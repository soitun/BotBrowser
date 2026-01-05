# BotBrowser CLI Flags Reference

For Fingerprint Protection and Privacy Research.

This document explains BotBrowser's CLI configuration system. These flags extend Chromium and provide runtime control over fingerprints to prevent tracking system collection without modifying profile files. For terms of use, see the [Legal Disclaimer](DISCLAIMER.md) and [Responsible Use Guidelines](RESPONSIBLE_USE.md).

> Smart auto-configuration: BotBrowser derives timezone, locale, and languages from your IP/proxy. Override only when you need a specific setup.

> Dynamic configuration: CLI overrides (`--bot-config-*` + behavior toggles) enable runtime fingerprint control, which is ideal for CI/CD and multi-instance scenarios.

> License tiers: Some flags show tier hints in parentheses (PRO, ENT Tier1/Tier2/Tier3); those options are subscription-gated.

## Table of Contents

- [Core BotBrowser Flags](#core-botbrowser-flags)
- [Enhanced Proxy Configuration](#enhanced-proxy-configuration)
- [BotBrowser Customization](#botbrowser-customization)
- [Profile Configuration Override Flags](#profile-configuration-override-flags)
- [Mirror: Distributed Privacy Consistency](#mirror-distributed-privacy-consistency)
- [Usage Examples](#usage-examples)

---

## Core BotBrowser Flags

### `--bot-profile`
The foundation of BotBrowser's privacy features.

Specifies the path to the BotBrowser profile file (.enc).

```bash
--bot-profile="/absolute/path/to/profile.enc"
```

**Notes:**
- The profile determines the fingerprint, OS emulation, and privacy controls
- Use profiles from the [profiles directory](profiles/) or contact support for custom profiles
- This is the core difference from stock Chromium

### `--bot-profile-dir`
Random profile selection for fingerprint diversity.

Specify a directory containing multiple `.enc` profile files. BotBrowser will randomly select one profile on each startup for fingerprint diversity without manual configuration.

```bash
--bot-profile-dir="/absolute/path/to/profiles/directory"
```

**Notes:**
- Each startup randomly selects a different profile from the directory
- Useful for multi-instance deployments requiring fingerprint variation
- Cannot be used together with `--bot-profile` (directory takes precedence if both are specified)

---

<a id="enhanced-proxy-configuration"></a>
## Enhanced Proxy Configuration

### Enhanced `--proxy-server` with Embedded Credentials
BotBrowser extends the standard `--proxy-server` flag to accept embedded credentials in the URL.

⚠️ **Important**: For authorized privacy research and fingerprint protection only. Do not use for unauthorized data collection.

```bash
# HTTP/HTTPS proxy with credentials
--proxy-server="http://username:password@proxy.example.com:8080"
--proxy-server="https://username:password@proxy.example.com:8080"

# SOCKS5 proxy with credentials
--proxy-server="socks5://username:password@proxy.example.com:1080"
# SOCKS5H proxy with credentials (hostname resolution stays within tunnel)
--proxy-server="socks5h://username:password@proxy.example.com:1080"
```

**Supported Protocols:** HTTP, HTTPS, SOCKS5, SOCKS5H

**Proxy auth usernames:** Structured proxy usernames can include additional separators such as `,` and `｜` (full-width vertical bar). This is useful for providers that encode routing hints inside the username, for example:

```bash
--proxy-server="socks5://user_abc,type_mobile,country_GB,session_1234:11111@portal.proxy.io:1080"
```

### UDP over SOCKS5 (ENT Tier3)
ENT Tier3 adds built-in SOCKS5 UDP ASSOCIATE support with no extra flag required. When the proxy supports UDP, BotBrowser will tunnel QUIC traffic and STUN probes over the proxy to harden proxy checks.

```bash
# UDP (QUIC/STUN) auto-tunneled when the SOCKS5 proxy supports UDP associate
--proxy-server="socks5://username:password@proxy.example.com:1080"
```

### `--proxy-ip`
Specify the proxy’s public IP to optimize performance.

This skips per-page IP lookups and speeds up navigation.

```bash
--proxy-ip="203.0.113.1"
```

**Benefits:**
- Eliminates IP detection overhead on each page load
- Faster browsing when using proxies
- Combine with `--bot-config-timezone` for protected region emulation


⚠️ Important:
- Browser-level proxy: use `--proxy-server` for protected geo-detection across contexts
- Per-context proxy (ENT Tier1): set different proxies via `createBrowserContext({ proxy })`; BotBrowser auto-derives geo info in both cases
- Avoid: framework-specific options like `page.authenticate()` that disable BotBrowser's geo-detection, which may leak location information

### `--bot-local-dns` (ENT Tier1)
Enable the local DNS solver. This keeps DNS resolution local instead of relying on a proxy provider's DNS behavior, improving privacy and speed while avoiding common DNS poisoning paths.

```bash
--bot-local-dns
```

Practical notes:
- Helps when a proxy provider blocks or rewrites DNS lookups
- Useful when you want to avoid provider-side DNS policies and keep resolution behavior protected across runs

### `--bot-ip-service`
Customize the public IP service used to discover your egress IP (and derive geo settings when auto-detection is enabled).

```bash
--bot-ip-service="https://ip.example.com"
```

You can provide multiple endpoints as a comma-separated list. BotBrowser will race them and use the fastest successful response.

```bash
--bot-ip-service="https://ip1.example.com,https://ip2.example.com"
```

---

## BotBrowser Customization

### `--bot-title`
Custom browser identification and session management.

Sets custom browser window title and taskbar/dock icon label.

```bash
--bot-title="MyBot Session 1"
--bot-title="Research Session"
```

**Features:**
- Appears in the window title bar
- Shows on the taskbar/dock icon
- Displays as a label next to the Refresh button
- Useful for managing multiple instances

### `--bot-cookies`
Session restoration and cookie management.

Accepts cookie data as either inline JSON or from a file.

**Inline JSON:**
```bash
--bot-cookies='[{"name":"session","value":"abc123","domain":".example.com"}]'
```

**From JSON file:**
```bash
--bot-cookies="@/path/to/cookies.json"
```

The file should contain a JSON array of cookie objects with name, value, and domain fields.

### `--bot-bookmarks`
Pre-populate bookmarks for session preservation.

Accepts a JSON string containing bookmark data for startup.

```bash
--bot-bookmarks='[{"title":"Example","type":"url","url":"https://example.com"},{"title":"Folder","type":"folder","children":[{"title":"Example","type":"url","url":"https://example.com"}]}]'
```

### `--bot-canvas-record-file`
Canvas forensics and tracking analysis.

Records all Canvas 2D API calls to a JSONL file for forensic analysis and future replay capabilities.

```bash
--bot-canvas-record-file="/tmp/canvaslab.jsonl"
```

**Key Features:**
- Complete Canvas 2D API call recording with full parameter serialization
- Deterministic capture (noise variance disabled during recording)
- JSONL format for easy parsing and analysis
- HTML viewer included for interactive event inspection

Learn more: [CanvasLab Documentation](tools/canvaslab/)

### `--bot-script`
Framework-less approach with a privileged JavaScript context.

Execute a JavaScript file right after BotBrowser starts in a privileged, non-extension context where `chrome.debugger` is available.

```bash
--bot-script="/path/to/script.js"
```

**Key Features:**
- No framework dependencies: pure Chrome DevTools Protocol access
- Earlier intervention: runs before navigation
- Privileged context: full `chrome.debugger` API access
- Isolated execution: framework artifacts do not appear in page context

Documentation: Chrome `chrome.debugger` API - <https://developer.chrome.com/docs/extensions/reference/api/debugger/>

Examples: [Bot Script](examples/bot-script)

---

<a id="profile-configuration-override-flags"></a>
## Profile Configuration Override Flags

High-priority configuration overrides: these CLI flags supersede profile settings.

BotBrowser supports command-line flags that override profile configuration values with the highest priority. These flags start with `--bot-config-` and directly map to profile `configs` properties.

> Recommended: Use CLI flags instead of modifying profiles. They carry the highest priority and don’t require editing encrypted files. License tiers are indicated in parentheses where applicable.

### Bot Configuration Overrides (`--bot-config-*`)

Flags that directly map to profile `configs` and override them at runtime.

**Identity & Locale**
- `--bot-config-browser-brand=chrome` (PRO): Browser brand: chrome, chromium, edge, brave, opera
- `--bot-config-brand-full-version=142.0.3595.65` (PRO): Brand-specific full version (Edge/Opera cadence) for UA-CH congruence
- `--bot-config-ua-full-version=142.0.7444.60` (PRO): User agent version: full version string matching Chromium major
- `--bot-config-languages=auto`: Languages: "lang1,lang2" (comma-separated) or "auto" (IP-based)
- `--bot-config-locale=auto`: Browser locale: e.g. en-US, fr-FR, de-DE, or "auto" (derived from IP/language)
- `--bot-config-timezone=auto`: Timezone: auto (IP-based), real (system), or timezone name
- `--bot-config-location=40.7128,-74.0060`: Location: "lat,lon" (coordinates) or "auto" (IP-based)

**Display & Input**
- `--bot-config-window=profile`: Window dimensions: profile (use profile), real (system window)
- `--bot-config-screen=profile`: Screen properties: profile (use profile), real (system screen)
- `--bot-config-keyboard=profile`: Keyboard settings: profile (emulated), real (system keyboard)
- `--bot-config-fonts=profile`: Font settings: profile (embedded), expand (profile + fallback), real (system fonts)
- `--bot-config-color-scheme=light`: Color scheme: light, dark
- `--bot-config-disable-device-scale-factor`: Disable device scale factor: true, false

**Rendering, Noise & Media/RTC**
- `--bot-config-webgl=profile`: WebGL: profile (use profile), real (system), disabled (off)
- `--bot-config-webgpu=profile`: WebGPU: profile (use profile), real (system), disabled (off)
- `--bot-config-noise-webgl-image`: WebGL image noise: true, false
- `--bot-config-noise-canvas`: Canvas fingerprint noise: true, false
- `--bot-config-noise-audio-context`: Audio context noise: true, false
- `--bot-config-noise-client-rects`: Client rects noise: true, false
- `--bot-config-noise-text-rects`: Text rects noise: true, false
- `--bot-config-speech-voices=profile`: Speech voices: profile (synthetic), real (system)
- `--bot-config-media-devices=profile`: Media devices: profile (synthetic devices), real (system devices)
- `--bot-config-media-types=expand`: Media types: expand (default), profile, real
- `--bot-config-webrtc=profile`: WebRTC: profile (use profile), real (native), disabled (off)

> **Note: UA/Engine Congruence:** Keep `--bot-config-ua-full-version` aligned with your Chromium major version, and use `--bot-config-brand-full-version` when a vendor's cadence (Edge, Opera, Brave) diverges so UA-CH metadata stays internally protected.

### Behavior & Protection Toggles

Runtime toggles that don’t rely on profile `configs` but still override behavior at launch.

- `--bot-disable-debugger`: Ignore JavaScript `debugger` statements to avoid pauses
- `--bot-mobile-force-touch`: Force touch events on/off for mobile device simulation
- `--bot-disable-console-message` (PRO): Suppress console.* output from CDP logs (default true); prevents framework hooks from enabling `Console.enable`/`Runtime.enable`, which blocks fingerprint signals.
- `--bot-inject-random-history` (PRO): Add synthetic browsing history for session authenticity
- `--bot-always-active` (PRO): Keep windows/tabs active even when unfocused
- `--bot-webrtc-ice=google` (PRO): Override STUN/TURN endpoints observed by JavaScript/WebRTC to control ICE signaling; accepts presets (`google`) or `custom:stun:...,turn:...`
- `--bot-time-scale` (ENT Tier1): Float < 1.0; scales down `performance.now()` intervals to emulate lower load and reduce timing skew signals (typical range 0.80–0.99)
- `--bot-noise-seed` (ENT Tier2): Float seed (1.0–1.2) for the deterministic noise RNG; each seed augments privacy variance across Canvas 2D/WebGL/WebGPU images, text metrics, HarfBuzz layout, ClientRect measurements, and offline audio hashes so you can treat a seed as a reproducible fingerprint ID per tenant while keeping runs stable.

Example tracking probe BotBrowser avoids when console forwarding stays disabled:

```javascript
let detected = false;
const err = new Error();
Object.defineProperty(err, 'stack', {
  get() { detected = true; }
});
console.log(err);  // stack getter fires if Console.enable/Runtime.enable are active
```

### Key Benefits of CLI Configuration Flags

- **Highest Priority:** Overrides profile settings
- **No Profile Editing:** Avoid changing encrypted JSON
- **Dynamic Configuration:** Perfect for testing and CI/CD
- **Session Isolation:** Different settings per instance

### Configuration Priority

1. CLI `--bot-config-*` flags (Highest priority)
2. Profile `configs` settings (Medium priority)
3. Profile default values (Lowest priority)

Behavior & privacy toggles apply at launch and override profile data entirely.

---

<a id="mirror-distributed-privacy-consistency"></a>
## Mirror: Distributed Privacy Consistency (ENT Tier3)

Verify that your privacy protection works effectively across platforms and networks. Run a controller instance and multiple clients to ensure all instances maintain identical privacy defenses, protecting you from tracking across Windows, macOS, Linux, and remote deployment environments.

**Key flags:**
- `--bot-mirror-controller-endpoint=host:port` - Launch as controller (captures your actions)
- `--bot-mirror-client-endpoint=host:port` - Launch as client (receives controller actions)

**For complete setup instructions, examples, and troubleshooting, see the [Mirror documentation](tools/mirror/).**

---

## Usage Examples
📌 Quick launch patterns and reference commands.

### Minimal launch with proxy
```bash
# Essential flags with proxy and remote debugging
chromium-browser \
  --bot-profile="/absolute/path/to/profile.enc" \
  --bot-title="My Session" \
  --proxy-server="http://myuser:mypass@proxy.example.com:8080" \
  --remote-debugging-port=9222
```

### Single-instance overrides
```bash
# Override only what you need (timezone/locale auto-detected)
chromium-browser \
  --bot-profile="/absolute/path/to/profile.enc" \
  --bot-config-browser-brand="edge" \  # PRO feature
  --bot-title="Custom Session"

# Active window + custom ICE servers
chromium-browser \
  --bot-profile="/absolute/path/to/profile.enc" \
  --bot-always-active \  # PRO feature
  --bot-webrtc-ice="custom:stun:stun.l.google.com:19302,turn:turn.example.com"   # PRO feature
```

### Multi-instance setup
```bash
# Instance 1 - Chrome brand with profile window settings
chromium-browser \
  --bot-profile="/absolute/path/to/profile.enc" \
  --bot-config-browser-brand="chrome" \  # PRO feature
  --bot-config-window="profile" \
  --bot-cookies='[{"name":"sessionid","value":"abc123","domain":".example.com"}]' \
  --bot-bookmarks='[{"title":"Work Site","url":"https://work.com","type":"url"}]' \
  --user-data-dir="/tmp/instance1" &

# Instance 2 - Edge brand with real window settings
chromium-browser \
  --bot-profile="/absolute/path/to/profile.enc" \
  --bot-config-browser-brand="edge" \  # PRO feature
  --bot-config-window="real" \
  --user-data-dir="/tmp/instance2" &
```

### Performance timing & noise control (ENT)
```bash
# Stabilize performance timing and noise determinism under load
chromium-browser \
  --bot-profile="/absolute/path/to/profile.enc" \
  --bot-time-scale=0.92 \  # ENT Tier1 feature
  --bot-noise-seed=1.07   # ENT Tier2 feature
```

---

## Related Documentation
📎 Quick links to supporting materials.

- [Profile Configuration Guide](profiles/PROFILE_CONFIGS.md) - Configure browser behavior via profiles
- [Main README](README.md) - General usage and standard Chromium flags
- [Examples](examples/) - Playwright and Puppeteer integration examples
- [Docker Deployment](docker/README.md) - Container deployment guides

---

## Tips & Best Practices
💡 Practical pointers for stable runs.

### BotBrowser-Specific Considerations

Configuration priority: CLI `--bot-config-*` flags override profile `configs`.

Session management: use `--bot-title` to identify instances.

Cookie persistence: `--bot-cookies` helps maintain state across restarts.

Realistic browsing: `--bot-bookmarks` adds authenticity.

Proxy authentication: embed credentials directly in the proxy URL.

---

> Need help? Check our [Issues](https://github.com/botswin/BotBrowser/issues) or contact support at [botbrowser@bk.ru](mailto:botbrowser@bk.ru)

> Note: This document covers BotBrowser-specific flags only. For standard Chromium flags (like `--headless`, `--no-sandbox`, `--user-data-dir`, etc.), refer to the [Chromium command line documentation](https://peter.sh/experiments/chromium-command-line-switches/).

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
