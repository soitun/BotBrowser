# BotBrowser Advanced Features

Technical architecture and implementation details behind BotBrowser's fingerprint protection. This document covers the design and capabilities of each subsystem. For configuration syntax and usage examples, see the [CLI Flags Reference](CLI_FLAGS.md).

> License tiers: Some capabilities show tier hints in parentheses (PRO, ENT Tier1/Tier2/Tier3); those options are subscription-gated.

---

## Capabilities Index

[navigator.webdriver removal](#chrome-behavior-emulation), [main-world isolation](#playwright-puppeteer-integration), [JS hook isolation](#playwright-puppeteer-integration), [Canvas noise](#multi-layer-fingerprint-noise), [WebGL/WebGPU param control](#multi-layer-fingerprint-noise), [Skia anti-alias](#cross-platform-font-engine), [HarfBuzz shaping](#cross-platform-font-engine), [MediaDevices protection](#complete-fingerprint-control), [font list authenticity](#cross-platform-font-engine), [UA congruence](#browser-os-fingerprinting), [custom User-Agent (ENT Tier3)](CLI_FLAGS.md#profile-configuration-override-flags), [per-context proxy (ENT Tier1) geo](CLI_FLAGS.md#enhanced-proxy-configuration), [DNS-through-proxy](#network-fingerprint-control), [active window emulation](#active-window-emulation), [HTTP headers/HTTP2/HTTP3](#chrome-behavior-emulation), [headless parity](#headless-incognito-compatibility), [WebRTC SDP/ICE control](#webrtc-leak-protection), [TLS fingerprint (JA3/JARM)](#network-fingerprint-control), [port protection (PRO)](#port-protection), [dynamic proxy switching (ENT Tier2)](#dynamic-proxy-switching), [distributed privacy consistency](#mirror-distributed-privacy-consistency), [CDP quick reference](#cdp-quick-reference)

---

## Configuration

BotBrowser offers three configuration interfaces with a clear priority order:

1. **CLI `--bot-config-*` flags** (highest priority) — [CLI Flags Reference](CLI_FLAGS.md)
2. **Profile `configs` JSON** (medium priority) — [Profile Configuration Guide](profiles/PROFILE_CONFIGS.md)
3. **CDP commands** (runtime, per-context) — [Per-Context Fingerprint](PER_CONTEXT_FINGERPRINT.md) | [CDP Quick Reference](#cdp-quick-reference)

Smart auto-configuration: timezone, locale, and languages derive from your proxy IP. Override only when your scenario requires it.

---

<a id="network-fingerprint-control"></a>
## Network Fingerprint Control

**Scope:** Network-layer traits that tracking systems often score.

- **HTTP Headers & Protocol:** Chrome-like request headers; authentic HTTP/2 and HTTP/3 behavior (see [Chrome Behavior Emulation](#chrome-behavior-emulation)).
- **DNS Routing:** SOCKS5 proxies route all lookups through the proxy tunnel, preventing local DNS leakage.
- **UDP over SOCKS5 (ENT Tier3):** Automatic UDP associate when supported to tunnel QUIC and STUN; ICE presets often unnecessary if UDP is available.
- **WebRTC:** SDP/ICE manipulation and candidate filtering to prevent local IP disclosure (see [WebRTC Leak Protection](#webrtc-leak-protection)).
- **TLS Fingerprints (JA3/JARM/ALPN):** Roadmap: cipher/extension ordering and ALPN tuning under evaluation.

**Stack differentiators:**
- [Per-context proxies](PER_CONTEXT_FINGERPRINT.md) with proxy-based geo detection (timezone/locale/language) across contexts and sessions
- DNS-through-proxy plus credentialed proxy URLs keep browser-level geo signals protected
- UDP-over-SOCKS5 tunnel (ENT Tier3) for QUIC/STUN so ICE presets are only needed when UDP is unavailable
- Optional ICE control via [`--bot-webrtc-ice`](CLI_FLAGS.md#behavior--protection-toggles) (ENT Tier1) when the proxy lacks UDP support
- Chromium-level implementation: tunneling lives inside the network stack, no external proxy-chain hijacking

> Note: Many privacy-oriented browsers disable QUIC or skip UDP entirely. BotBrowser implements UDP-over-SOCKS5 directly inside Chromium's network stack so QUIC/STUN stay proxied and consistent with TCP traffic.

For proxy configuration syntax and examples, see [CLI Flags: Enhanced Proxy Configuration](CLI_FLAGS.md#enhanced-proxy-configuration).

<a id="port-protection"></a>
### Port Protection (PRO)

Protect local service ports (VNC, RDP, development servers, etc.) from being scanned by remote pages. Prevents detection of which services are running on localhost.

Covers 30 commonly-probed ports across:
- IPv4 loopback (`127.0.0.0/8`)
- IPv6 loopback (`::1`)
- `localhost` hostname

Enable via CLI (`--bot-port-protection`) or profile JSON (`configs.portProtection`). See [CLI Flags](CLI_FLAGS.md#--bot-port-protection-pro) for details.

<a id="dynamic-proxy-switching"></a>
### Dynamic Per-Context Proxy Switching (ENT Tier2)

Switch proxy servers for a specific BrowserContext at runtime without restarting the context. Use the CDP command `BotBrowser.setBrowserContextProxy` to change proxies on the fly. Supports multiple switches per context, with automatic timezone and language adaptation after each switch.

```javascript
const ctx = await browser.createBrowserContext();
const page = await ctx.newPage();
const client = await page.createCDPSession();

// Set initial proxy - US endpoint
await client.send('BotBrowser.setBrowserContextProxy', {
  browserContextId: ctx._contextId,
  proxyServer: 'socks5://user:pass@us-proxy.example.com:1080',
  proxyIp: '203.0.113.1'  // optional: skip IP lookup for faster geo detection
});
await page.goto('https://example.com');

// Switch to UK proxy at runtime - no context restart needed
await client.send('BotBrowser.setBrowserContextProxy', {
  browserContextId: ctx._contextId,
  proxyServer: 'socks5h://user:pass@uk-proxy.example.com:1080'
});
await page.goto('https://example.co.uk');
```

**Supported protocols:** `socks5://`, `socks5h://`, `http://`, `https://`, all with embedded authentication (`user:pass@host:port`).

**Optional parameter:** `proxyIp` provides the proxy's exit IP to skip automatic IP detection, resulting in faster geo-based timezone and language adaptation.

---

## Privacy Protection & Fingerprint Consistency

<a id="multi-layer-fingerprint-noise"></a>
### Multi-Layer Fingerprint Noise

Deterministic noise generation prevents fingerprint collection while maintaining session consistency.

- **Canvas**: Controlled variance applied to Canvas 2D rendering
- **WebGL image**: Controlled variance applied to WebGL readback
- **WebGPU**: Deterministic noise applied to WebGPU canvases by default so GPU-only probes inherit the same reproducible noise characteristics
- **AudioContext**: Inaudible noise calibration (Chromium 141+) with cross-worker consistency
- **ClientRects/TextRects**: Realistic font measurement variance with cross-worker consistency
- **Deterministic noise seeds (ENT Tier2)**: Reproducible yet distinct noise fields per tenant; each seed shapes Canvas 2D, WebGL, WebGPU imagery, text metrics, HarfBuzz layout, ClientRects, and offline audio hashes. See [`--bot-noise-seed`](CLI_FLAGS.md#behavior--protection-toggles)

Protection model:
- Stable noise algorithms maintain session consistency while varying across different sessions
- GPU tuning preserves authentic WebGL and WebGPU behavior (1.0 and 2.0 contexts)
- Text metrics and ClientRects noise sustains realistic font measurements with cross-worker consistency

For noise configuration flags, see [CLI Flags: Rendering, Noise & Media/RTC](CLI_FLAGS.md#profile-configuration-override-flags).

<a id="active-window-emulation"></a>
### Active Window Emulation

Maintains protected window state to prevent focus-based tracking even when the host window is unfocused.

- [`--bot-always-active`](CLI_FLAGS.md#behavior--protection-toggles) (PRO, default true) maintains protected `blur` and `visibilitychange` event patterns, keeping `document.hidden=false`
- Protects against window-focus-based tracking heuristics that monitor caret blinking, FocusManager events, or inactive viewport throttling

<a id="headless-incognito-compatibility"></a>
### Headless & Incognito Compatibility

Consistent behavior across execution modes.

**GPU Simulation in Headless Mode (ENT Tier2):**
- Full GPU context simulation without physical GPU
- WebGL and WebGPU rendering consistency
- Hardware-accelerated video decoding simulation

**Incognito-Mode Consistency:**
- Fingerprint protection maintained in incognito mode
- Consistent fingerprint between normal and incognito modes

<a id="webrtc-leak-protection"></a>
### WebRTC Leak Protection

Complete WebRTC fingerprint protection and network privacy.

**SDP Control:**
- IPv4 and IPv6 Session Description Protocol (SDP) standardization across platforms
- ICE candidate filtering and protection management
- STUN and TURN server response standardization

**Real-Time Communication Privacy:**
- MediaStream API protection across execution contexts
- RTCPeerConnection behavior standardization
- Network topology protection through controlled signal patterns
- ICE server presets and custom lists via [`--bot-webrtc-ice`](CLI_FLAGS.md#behavior--protection-toggles) (ENT Tier1) to standardize STUN and TURN endpoints observed by page JavaScript
- Combined with [UDP-over-SOCKS5](CLI_FLAGS.md#udp-over-socks5-ent-tier3) (ENT Tier3) for Chromium-level QUIC and STUN tunneling

<a id="chrome-behavior-emulation"></a>
### Chrome Behavior Emulation

Consistent Chrome-compatible behaviors and standardized API responses.

**Protocol Headers:**
- Standard HTTP headers matching Chrome specifications
- Consistent HTTP/2 and HTTP/3 behavior across platforms
- Standardized request timing and protocol patterns

**API Standardization:**
- Chrome-compatible API implementations
- Standardized JavaScript API responses matching Chrome specifications

**Widevine CDM Integration (ENT Tier2):**
> Note: BotBrowser does not distribute proprietary modules (e.g., Widevine). End users must obtain playback components via official channels.

---

## Device & Platform Emulation

<details>
<summary><strong>Full details: Device & Platform Emulation</strong></summary>

<a id="cross-platform-font-engine"></a>
### Cross-Platform Font Engine

Advanced font rendering with consistent results across hosts.

**Built-In Font Libraries:**
- Windows fonts (Segoe UI, Arial, Times New Roman, etc.)
- macOS fonts (San Francisco, Helvetica, Times, etc.)
- Android fonts (Roboto, Noto, etc.) (PRO)
- Complete emoji sets for all platforms

**Accurate Font-Fallback Chains:**
- Accurate CJK (Chinese, Japanese, Korean) font fallback
- Rare symbol and Unicode character support
- Cross-worker consistency
- HarfBuzz text shaping integration

**Text-Rendering Features:**
- Skia anti-aliasing integration
- Multi-language support (CJK/RTL/emoji)
- Platform-specific font metrics
- Consistent text measurement across workers
- DOM text renders exclusively from the embedded Windows/macOS font bundles (Linux requires ENT Tier1; Android requires PRO) so layouts never fall through to host fonts

> **Implementation Detail:** Low-level rendering paths in Skia (2D/Canvas) and HarfBuzz (text shaping) are tuned to align metrics and glyph shaping across OS targets. Targeted WebGL/WebGPU parameter controls keep visual output stable across contexts.

### Cross-Platform Consistency

Maintains fingerprint and behavior consistency across different host systems.

**Platform Profile Portability:**
- Windows profile produces identical fingerprints on macOS and Linux (ENT Tier1) hosts
- macOS profile maintains consistency across Windows and Linux (ENT Tier1) hosts
- Android profile (PRO) operates identically when emulated on any desktop OS
- Android DevTools interface (PRO) maintains readability during emulation because the inspector normalizes page zoom and font scaling

**Behavioral Consistency:**
- Eliminates host-OS-specific behavioral differences
- Simulates platform-specific UI element behavior consistently
- Maintains identical touch and mouse event patterns
- Emulates authentic device behavior across platforms

### Touch & Input Reliability

- Pointer/touch bridging fixes ensure `Input.dispatchMouseEvent` and synthesized taps land reliably, even in nested iframe trees
- Mobile flows keep consistent tap timing and coordinates when `mobileForceTouch` is enabled

### Hardware Fingerprint Control

Comprehensive hardware emulation and fingerprint management.

**CPU-Architecture Emulation:**
- x86/x64/ARM architecture simulation
- Authentic CPU core count and timing
- Hardware concurrency simulation
- JavaScript & WebAssembly parity across baseline, Turbo, and SIMD pipelines

**Screen and Display Control:**
- Device pixel ratio emulation
- Screen resolution and color depth control
- Multi-monitor configuration simulation
- Refresh rate and orientation control

**Device-Behavior Simulation:**
- Authentic device memory reporting
- Battery status and charging simulation
- Network connection type emulation
- Sensor availability and behavior

</details>

---

## Deep System Integration

<details>
<summary><strong>Full details: Deep System Integration</strong></summary>

### Precise FPS Simulation (ENT Tier2)

- requestAnimationFrame delay matching target FPS
- Emulate target refresh rates (60Hz, 120Hz, 144Hz, etc.)
- Simulate high-FPS macOS behavior on Ubuntu hosts (Ubuntu requires ENT Tier1)
- Authentic vsync and frame timing patterns
- Runtime timing scaling via [`--bot-time-scale`](CLI_FLAGS.md#behavior--protection-toggles) to compress `performance.now()` deltas

### Performance Fingerprint Controls

- Realistic memory allocation patterns and garbage collection timing
- IndexedDB, localStorage, and Cache API response timing
- JavaScript execution timing and WebAssembly performance simulation
- Deterministic noise seeds via [`--bot-noise-seed`](CLI_FLAGS.md#behavior--protection-toggles) (ENT Tier2) to stabilize noise distributions across sessions

### Extended Media Types & WebCodecs APIs

- Extended MIME type support beyond browser defaults
- Platform-specific codec availability simulation
- WebCodecs API support: videoDecoder/audioDecoder authentic reporting
- Realistic mediaCapabilities.decodingInfo() responses (ENT Tier2)
- Default configuration uses `expand` to prioritize local decoders

### GPU Driver Micro-Benchmarks

- GPU command execution timing and shader compilation performance
- Texture upload/download speeds and buffer allocation rates
- NVIDIA, AMD, Intel driver behavior patterns
- Realistic performance scaling with memory bandwidth limitations

### Dynamic Blink Features

- Windows-specific, macOS-exclusive, and Android mobile (PRO) Blink features
- Authentic feature availability reporting and runtime capability discovery
- Linux distribution variations (ENT Tier1)

</details>

---

<a id="complete-fingerprint-control"></a>
## Complete Fingerprint Control

<details>
<summary><strong>Full details: Complete Fingerprint Control</strong></summary>

<a id="browser-os-fingerprinting"></a>
### Browser & OS Fingerprinting

| Component | Capabilities |
|-----------|-------------|
| **User Agent** | Version control, userAgentData brands, full version override, custom UA with placeholders (ENT Tier3) |
| **Platform Detection** | Windows/macOS/Android(PRO) with authentic APIs |
| **Browser Features** | Debugger control, CDP leak protection, Chrome-specific behavior, WebView brand (ENT Tier3) |
| **Font System** | Built-in cross-platform fonts, Blink features, authentic fallback chains |
| **Client Hints** | DPR, device-memory, UA-CH, and other CH values stay aligned with JavaScript-visible metrics |
| **userAgentData** | Full control over platform, platformVersion, model, architecture, bitness, mobile (ENT Tier3) |

### Location & Time Management

| Component | Capabilities |
|-----------|-------------|
| **Timezone** | Automatic IP-based detection, manual override, DST handling |
| **Geolocation** | Coordinate consistency, accuracy simulation, permission handling |
| **Time APIs** | Date/time consistency, performance.now() behavior, timezone transitions |

### Display & UI Control

| Component | Capabilities |
|-----------|-------------|
| **Screen Properties** | Resolution, color depth, orientation, pixel density |
| **Window Dimensions** | Size control, viewport management, responsive behavior |
| **Color Schemes** | matchMedia queries, prefers-color-scheme, system colors |
| **UI Elements** | System colors, scrollbar styling, form control appearance |

### Input & Navigation Systems

| Component | Capabilities |
|-----------|-------------|
| **Keyboard** | Layout emulation, key timing, input method simulation |
| **Touch Interface** | Touch event simulation, gesture recognition, mobile patterns |
| **Mouse Patterns** | Movement algorithms, click timing, scroll behavior |
| **Languages** | Accept-Language headers, navigator.languages, speech recognition |
| **Permissions** | API permission simulation, notification handling, media access |
| **Navigation** | History management, referrer control, navigation timing |

<a id="graphics-rendering-engine"></a>
### Graphics & Rendering Engine

| Component | Capabilities |
|-----------|-------------|
| **Canvas** | 2D context noise, consistent image data, cross-worker consistency |
| **WebGL** | Precision GPU micro-benchmarks, driver-specific behavior, extension simulation |
| **WebGPU** | Modern GPU API support, compute shader capabilities, buffer management |
| **Text Rendering** | HarfBuzz text shaping, cross-platform fonts, emoji rendering consistency |
| **Performance** | Precise FPS simulation, texture hash fidelity, render timing control |

### Network & Media Subsystems

| Component | Capabilities |
|-----------|-------------|
| **Proxy** | Authentication embedding, credential management, geo-detection |
| **WebRTC** | SDP control, ICE candidate filtering, media stream simulation |
| **HTTP Headers** | Google-specific headers (ENT Tier2), Chrome behavior patterns, request timing |
| **Media Devices** | AudioContext simulation, speech synthesis, device enumeration |
| **Codecs** | Extended media types, WebCodecs APIs, hardware acceleration simulation |
| **Widevine DRM** | Persistent license support, platform-appropriate license negotiation, EME capability fingerprinting prevention |
| **WebAuthn** | Platform-specific client capabilities, Touch ID/Bluetooth/payment authenticator detection prevention |

### Performance Characteristics

| Component | Capabilities |
|-----------|-------------|
| **Memory** | Allocation timing, garbage collection patterns, heap behavior |
| **Storage** | IndexedDB latency, cache timing, quota management |
| **Animation** | requestAnimationFrame precision, frame timing, smooth scrolling |
| **Computation** | JavaScript execution timing, WebAssembly performance, crypto operations |

</details>

---

## Integration with Automation Frameworks

### Framework-Less Automation ([`--bot-script`](CLI_FLAGS.md#--bot-script))

Execute JavaScript with privileged `chrome.debugger` access, with no framework dependencies.

- **Earlier intervention** — Execute before page navigation
- **Privileged context** — Full `chrome.debugger` API access
- **Isolated execution** — Framework artifacts do not appear in page context

Documentation: [Bot Script Examples](examples/bot-script)

<a id="playwright-puppeteer-integration"></a>
### Playwright/Puppeteer Integration

Privacy-preserving integration with popular frameworks.

- Prevents CDP artifacts from appearing in page context
- Maintains authentic browser behavior in all contexts
- Eliminates framework-specific fingerprint signatures
- ChromeDriver compatibility and Selenium Grid integration support

---

<a id="mirror-distributed-privacy-consistency"></a>
## Mirror: Distributed Privacy Consistency (ENT Tier3)

Verify that privacy protection works consistently across platforms and networks. Run a controller instance and multiple clients to ensure all instances maintain identical privacy defenses.

**[Complete Mirror documentation](tools/mirror/)** including setup, CLI flags, CDP examples, and troubleshooting.

---

<a id="per-context-fingerprint"></a>
## Per-Context Fingerprint (ENT Tier3)

Assign independent fingerprint bundles per BrowserContext without spawning new browser processes. Each context can have its own profile, timezone, locale, noise seeds, and all other fingerprint parameters. Workers automatically inherit the parent context fingerprint.

**[Complete Per-Context Fingerprint documentation](PER_CONTEXT_FINGERPRINT.md)** including CDP examples, supported flags, and use cases.

---

<a id="cdp-quick-reference"></a>
## CDP Quick Reference

All commands live under the `BotBrowser` CDP domain. Send them through a CDP session (`page.createCDPSession()` or `browser.target().createCDPSession()` depending on the command scope).

| Command | Scope | Tier | Description | Documentation |
|---------|-------|------|-------------|---------------|
| `SetBrowserContextFlags` | page | ENT Tier3 | Assign independent fingerprint flags to a BrowserContext | [Per-Context Fingerprint](PER_CONTEXT_FINGERPRINT.md) |
| `SetBrowserContextProxy` | page | ENT Tier2 | Switch proxy for a BrowserContext at runtime | [Dynamic Proxy Switching](#dynamic-proxy-switching) |
| `ClearBrowserContextProxy` | page | ENT Tier2 | Remove proxy override from a BrowserContext | [Dynamic Proxy Switching](#dynamic-proxy-switching) |
| `SetCustomHeaders` | browser | PRO | Replace all custom HTTP request headers | [CLI Flags](CLI_FLAGS.md#--bot-custom-headers-pro) |
| `GetCustomHeaders` | browser | PRO | Retrieve current custom headers | [CLI Flags](CLI_FLAGS.md#--bot-custom-headers-pro) |
| `AddCustomHeader` | browser | PRO | Add or update a single custom header | [CLI Flags](CLI_FLAGS.md#--bot-custom-headers-pro) |
| `RemoveCustomHeader` | browser | PRO | Remove a single custom header | [CLI Flags](CLI_FLAGS.md#--bot-custom-headers-pro) |
| `ClearCustomHeaders` | browser | PRO | Remove all custom headers | [CLI Flags](CLI_FLAGS.md#--bot-custom-headers-pro) |
| `StartMirrorController` | browser | ENT Tier3 | Start this instance as a Mirror controller | [Mirror](tools/mirror/) |
| `StartMirrorClient` | browser | ENT Tier3 | Connect this instance as a Mirror client | [Mirror](tools/mirror/) |
| `StopMirror` | browser | ENT Tier3 | Stop Mirror controller or client role | [Mirror](tools/mirror/) |
| `GetMirrorStatus` | browser | ENT Tier3 | Query current Mirror connection status | [Mirror](tools/mirror/) |

> **Scope**: `browser` = send to browser-level CDP session; `page` = send to page-level CDP session.

---

## Related Documentation

- [CLI Flags Reference](CLI_FLAGS.md) - Complete command-line options and usage examples
- [Profile Configuration](profiles/PROFILE_CONFIGS.md) - Profile JSON field reference
- [Installation Guide](INSTALLATION.md) - Platform-specific setup
- [Per-Context Fingerprint](PER_CONTEXT_FINGERPRINT.md) - Independent fingerprint per BrowserContext
- [Validation Results](VALIDATION.md) - Research and testing data
- [Mirror](tools/mirror/) - Distributed privacy consistency verification
- [CanvasLab](tools/canvaslab/) - Canvas forensics and tracking analysis tool
- [Examples](examples/) - Playwright, Puppeteer, bot-script integration
- [Main README](README.md) - Project overview and quick start

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
