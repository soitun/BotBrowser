<h1 align="center">🤖 BotBrowser</h1>

<h4 align="center">Advanced Privacy Browser Core with Unified Fingerprint Defense 🚀</h4>

<p align="center">
  Identical privacy posture on any OS • Cross-platform compatibility • Fingerprint consistency validated across 31+ tracking scenarios
</p>

<p align="center">
  <a href="https://github.com/botswin/BotBrowser/releases">
    <img src="https://img.shields.io/github/v/release/botswin/BotBrowser?style=flat-square" alt="Latest Release">
  </a>
  <a href="https://github.com/botswin/BotBrowser/commits/main/">
    <img src="https://img.shields.io/github/commit-activity/m/botswin/BotBrowser?style=flat-square" alt="Commit Activity">
  </a>
  <a href="https://github.com/botswin/BotBrowser/issues">
    <img src="https://img.shields.io/github/issues/botswin/BotBrowser?style=flat-square" alt="Issues">
  </a>
  <a href="https://github.com/botswin/BotBrowser/fork">
    <img src="https://img.shields.io/github/forks/botswin/BotBrowser?style=flat-square" alt="GitHub Forks">
  </a>
  <a href="https://github.com/botswin/BotBrowser">
    <img src="https://img.shields.io/github/stars/botswin/BotBrowser" alt="GitHub Stars">
  </a>
</p>

<div align="center">
  <img width="600" alt="BotBrowser GUI - Your Command Center" src="https://github.com/user-attachments/assets/e9c0b656-83b0-4be5-986e-d4bc3c04b4b5">
</div>

---
## What Is BotBrowser?

BotBrowser is a privacy first browser core that keeps fingerprint signals uniform across every platform, preventing tracking systems from collecting and correlating tracking data to identify users across devices. Run the same profile on Windows, macOS, or Linux and the fingerprint posture stays identical each time.

All engineering focuses on privacy research, cross-platform tracking-resistance validation, and maintaining consistent environments for authorized defensive benchmarking. Review the project [Legal Disclaimer](DISCLAIMER.md) and [Responsible Use Guidelines](RESPONSIBLE_USE.md) before using the software.

---

## Why BotBrowser

> **What makes BotBrowser different:** Cross-platform privacy browser core with unified fingerprint technology that prevents tracking data collection and device linkage.

<table cellspacing="0" cellpadding="8">
  <tr>
    <td width="50%"><strong>High-fidelity Profile Simulation</strong> keeps synthetic and aggregated fingerprints ready for policy-compliant privacy experiments</td>
    <td width="50%"><strong>Latest Chromium Base</strong> stays synced to the newest stable Chrome so trackers cannot key on stale engines</td>
  </tr>
  <tr>
    <td width="50%"><strong>Advanced Programmatic Control</strong> offers <a href="examples/">Playwright/Puppeteer integration</a> with CDP leak blocking so privacy tooling leaves no telemetry residue</td>
    <td width="50%"><strong>Network Stack Parity</strong> with <a href="ADVANCED_FEATURES.md#network-fingerprint-control">Full-Proxy QUIC/STUN</a> (UDP over SOCKS5, ENT Tier3 feature) delivers Chromium-level tunneling so geo metadata does not leak and privacy labs maintain clean transport parity</td>
  </tr>
  <tr>
    <td width="50%"><strong>Distributed Privacy Consistency</strong> lets you verify privacy protection consistency across multiple browser instances simultaneously <a href="tools/mirror/">with Mirror</a>, validating privacy posture in parallel (ENT Tier3 feature)</td>
    <td width="50%"><strong>Execution Environment Isolation</strong> provides clean contexts that prevent framework artifacts and external libraries from exposing privacy leaks through side channels</td>
  </tr>
</table>

### Cross-Platform Fingerprint Consistency

- Single profile, every host OS: identical UA, screen metrics, touch surfaces, fonts, and device APIs on Windows, macOS, Linux, and Android emulation so trackers see the same fingerprint everywhere.
- Built-in configuration handles touch simulation, device metrics, and locale/timezone detection from the proxy IP while still allowing CLI overrides when privacy experiments require them.
- Quick demos: [▶️ CreepJS Android](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-creepjs-creepjs-Android) • [▶️ Iphey](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-iphey-iphey-Android) • [▶️ Pixelscan](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-pixelscan-pixelscan-Android)

---

## Getting Started

### Quick Start

**Step 1: Download**
- [Latest release](https://github.com/botswin/BotBrowser/releases) for your OS
- [Demo profile](profiles/) (any `.enc` file)

**Step 2: Launch** (⚠️ use absolute paths)
- **Windows example:**
  ```cmd
  chrome.exe --bot-profile="C:\absolute\path\to\profile.enc" --user-data-dir="%TEMP%\botprofile_%RANDOM%"
  ```
- macOS/Linux commands follow the same pattern; see [INSTALLATION.md](INSTALLATION.md) for full instructions.

**Step 3: Verify**
- Visit [CreepJS](https://abrahamjuliot.github.io/creepjs/) or your preferred tracking observatory to confirm identical privacy posture.
- Timezone/locale/language auto-derive from your proxy/IP; override via CLI only when needed.


📖 **[Complete Installation Guide →](INSTALLATION.md)**

### Minimal Playwright Example

```javascript
const browser = await chromium.launch({
  headless: true,
  executablePath: BOTBROWSER_EXEC_PATH,
  args: [`--bot-profile=${BOT_PROFILE_PATH}`],
  '--proxy-server="socks5://usr:pwd@127.0.0.1:8989"',  // or: "http://usr:pwd@127.0.0.1:8989"
});
const page = await browser.newPage();
await page.addInitScript(() => { delete window.__playwright__binding__; delete window.__pwInitScripts; });
await page.goto('https://abrahamjuliot.github.io/creepjs/');
```

**Notes:**
- Use `--user-data-dir` with a unique temporary folder to avoid conflicts with running Chromium instances
- Prefer `--proxy-server` or per-context proxies (ENT Tier1); auto timezone/locale detection applies in both cases
- Avoid framework-specific proxy/auth options (e.g., `page.authenticate()`), which disable BotBrowser's geo-detection and may leak location information
- `socks5h://` is supported when you need hostnames resolved by the proxy

Examples: [Playwright](examples/playwright/) • [Puppeteer](examples/puppeteer/)

**More options:**
- Framework‑less approach: [`--bot-script` + CDP](examples/bot-script/) (privileged context, earlier hook, fewer artifacts)
- Docker: [docker/README.md](docker/)
- Full flags: [CLI_FLAGS.md](CLI_FLAGS.md)

## Advanced Capabilities
> **Professional-grade privacy technology** built on multi-layer fingerprint consistency, network-stack control, and hardening.

- **Multi Layer Noise**: Canvas, WebGL, WebGPU, text, and AudioContext surfaces share deterministic, cross-worker noise with low-level Skia and HarfBuzz tuning so observers cannot correlate runs
- **Execution Environment Isolation**: Clean execution contexts prevent framework artifacts from exposing privacy leaks, framework-less `--bot-script`, and console suppression PRO toggles maintain consistent fingerprints across all execution modes
- **Configurable Stack**: 30+ CLI overrides, per-context proxies with auto geo (ENT Tier1), and session tooling (cookies, bookmarks, title, history) make privacy scripting flexible
- **Typography Fidelity**: DOM text renders from embedded Windows, macOS, and Android font packs so host fonts never leak during cross-OS simulation
- **Client Hints Lockstep**: DPR, device-memory, and UA-CH headers match JavaScript-visible values to keep header data in sync with runtime fingerprints
- **Headless ↔ GUI Parity**: Identical GPU, WebGPU, and media signals across browser modes so privacy regression tests remain stable
- **Performance Controls**: Precision FPS (ENT Tier2) and memory timings plus timing controls (ENT Tier1) and noise seeds for reproducible privacy benchmarks (ENT Tier2)
- **Focus & Session Control**: Always-active tabs, configurable ICE presets, and expanded media reporting keep privacy sessions believable
- **Network Enhancements**: (ENT Tier1) per-context proxies, optional local DNS solver (ENT Tier1), UDP-over-SOCKS5 (ENT Tier3), and SOCKS5H DNS in tunnel behavior for clean geo signals

<details>
<summary><strong>Fingerprint Consistency Implementation: Privacy Controls → Technical Design → Validation</strong></summary>

This reference maps privacy protection goals to BotBrowser implementation details and validation evidence.

| Privacy Protection | Implementation | Reference |
|---|---|---|
| API standardization | navigator.webdriver standardized across all platforms so trackers cannot use API presence/absence as identification signal | [ADVANCED_FEATURES#Chrome Behavior Emulation](ADVANCED_FEATURES.md#chrome-behavior-emulation) |
| Execution environment consistency | Isolated execution context prevents framework artifacts from exposing privacy leaks | [ADVANCED_FEATURES#Playwright/Puppeteer Integration](ADVANCED_FEATURES.md#playwright-puppeteer-integration) |
| Graphics rendering parity | Deterministic noise across Canvas, WebGL, WebGPU, and audio ensures consistent fingerprints even in GPU-dependent scenarios | [ADVANCED_FEATURES#Graphics & Rendering Engine](ADVANCED_FEATURES.md#graphics-rendering-engine) |
| GPU fingerprint uniformity | Canvas and WebGPU rendering shares deterministic properties so GPU probes like [WebBrowserTools](https://webbrowsertools.com/webgpu-fingerprint/) return consistent results | [CHANGELOG#2025-12-08](CHANGELOG.md#2025-12-08) |
| Typography consistency | Embedded font engines for Windows, macOS, Linux, and Android ensure text rendering remains identical across platforms | [ADVANCED_FEATURES#Cross-Platform Font Engine](ADVANCED_FEATURES.md#cross-platform-font-engine) |
| Font availability uniformity | DOM queries return consistent font lists from embedded bundles so host system fonts cannot leak platform identity | [ADVANCED_FEATURES#Cross-Platform Font Engine](ADVANCED_FEATURES.md#cross-platform-font-engine) |
| Device capabilities | Profile-based device properties maintain consistent device claims across all platforms | [Profile Configs](profiles/PROFILE_CONFIGS.md) |
| Network topology privacy | WebRTC signaling stays consistent through SDP and ICE controls preventing network topology leakage | [ADVANCED_FEATURES#WebRTC Leak Protection](ADVANCED_FEATURES.md#webrtc-leak-protection) |
| User agent coherence | Browser brand and version consistency prevents UA string from revealing platform differences | [CLI_FLAGS#Profile Configuration Override Flags](CLI_FLAGS.md#profile-configuration-override-flags) |
| Header to API parity | Client Hints headers DPR, device-memory, and UA-CH align with JavaScript reported values preventing header based identification | [ADVANCED_FEATURES#Browser & OS Fingerprinting](ADVANCED_FEATURES.md#browser--os-fingerprinting) |
| Execution mode consistency | GPU, WebGPU, and media signals remain identical whether running headless or in GUI mode | [ADVANCED_FEATURES#Headless & Incognito Compatibility](ADVANCED_FEATURES.md#headless-incognito-compatibility) |
| DNS privacy | DNS can stay in-tunnel via SOCKS5H, or use the local DNS solver (ENT Tier1) to improve privacy and speed while avoiding DNS poisoning and provider DNS limits | [CLI_FLAGS#Enhanced Proxy Configuration](CLI_FLAGS.md#enhanced-proxy-configuration) |
| Public IP discovery | Customizable IP lookup backend for geo derivation via `--bot-ip-service` (supports comma-separated endpoints; BotBrowser races them and uses the fastest successful response) | [CLI_FLAGS#Enhanced Proxy Configuration](CLI_FLAGS.md#enhanced-proxy-configuration) |
| Protocol conformance | HTTP/2 and HTTP/3 behavior matches Chrome specifications preventing protocol based differentiation | [ADVANCED_FEATURES#Chrome Behavior Emulation](ADVANCED_FEATURES.md#chrome-behavior-emulation) |
| TLS fingerprint consistency | JA3, JARM, and ALPN parameters optimized for uniform TLS negotiation across platforms | [CHANGELOG](CHANGELOG.md) |

**Fingerprint Consistency Matrix: Cross‑Platform Coverage**

| Category | Sample Capabilities |
|----------|---------------------|
| **Graphics** | Canvas/WebGL rendering, GPU micro-benchmarks, texture hash configuration |
| **Network** | WebRTC SDP configuration, proxy auth, connection management |
| **Platform** | Font fallback chains, cross-worker consistency, OS-specific features |
| **Performance** | FPS simulation, memory timing, animation frame optimization |

</details>


📖 **[Complete Advanced Features Documentation →](ADVANCED_FEATURES.md)**



---

## Configuration & Profiles

> 📢 BotBrowser combines synthetic and aggregated profiles with flexible configuration for authorized privacy research. Profile consistency and CLI settings enable comparative analysis without leaking host traits.

- **Profile Foundation:** Synthetic and aggregated profiles provide realistic fingerprint data for authorized privacy testing
- **CLI Flexibility:** Override profile settings at runtime without modifying encrypted files
- **Cross-Platform Compatibility:** A *macOS profile* works on Ubuntu; a *Windows profile* works on macOS; an *Android profile* can be fully emulated on any OS
- **Smart Configuration:** Timezone, locale, and languages intelligently derived from IP/proxy
- **CLI Flags:** See the [⚙️ CLI flags reference](CLI_FLAGS.md) - *Recommended for most users*


> ⚠️ Note: This project must only be used in environments you own or where you have explicit authorization. Use against third-party services without permission is strictly prohibited and undermines the privacy mission.

---

## BotBrowserConsole (GUI Tool)

Prefer a GUI launcher? See [console/README.md](console) for BotBrowserConsole usage, multi-instance management, and privacy profile selection.

---

## Mirror: Distributed Privacy Consistency

Ensure your privacy protection works consistently across platforms and networks. Run a controller instance and multiple client instances to verify that all instances maintain identical privacy defenses, protecting you from tracking across Windows, macOS, Linux, and remote environments.

Launch with CLI flags: `--bot-mirror-controller-endpoint=127.0.0.1:9990` on the controller, `--bot-mirror-client-endpoint=127.0.0.1:9990` on each client. Runtime activation via CDP is also supported for programmatic control.

See [Mirror documentation](tools/mirror/) for detailed setup, testing procedures, and troubleshooting.

---

## Fingerprint Consistency Research

### Research Methodology

Our fingerprint consistency research examines how standardized browser fingerprints prevent tracking systems from collecting tracking data to identify users across platforms. By maintaining identical fingerprints across operating systems, we demonstrate how privacy protection through consistency prevents the tracking methods that malicious observers rely on.

> ⚠️ Research validation uses authorized test environments. See [DISCLAIMER](DISCLAIMER.md).

<table cellspacing="0" cellpadding="8">
  <tr>
    <td width="20%"><strong><a href="tests/tests/antibots/cloudflare.spec.ts">Cloudflare Consistency Research</a></strong></td>
    <td width="30%"><a href="//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-cloudflare-turnstile">▶️ Validation Recording</a></td>
    <td width="20%"><strong><a href="tests/tests/antibots/creepjs.spec.ts">CreepJS Fingerprint Analysis</a></strong></td>
    <td width="30%"><a href="//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-creepjs-creepjs">▶️ Desktop Consistency</a> / <a href="//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-creepjs-creepjs-Android">▶️ Android Profile</a></td>
  </tr>
  <tr>
    <td width="20%"><strong><a href="tests/tests/antibots/datadome.spec.ts">DataDome Detection Environment</a></strong></td>
    <td width="30%"><a href="//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-datadome-fifa">▶️ Scenario Analysis</a></td>
    <td width="20%"><strong><a href="tests/tests/antibots/fingerprintjs.spec.ts">FingerprintJS Pro Analysis</a></strong></td>
    <td width="30%"><a href="//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-fingerprintjs-botdetection">▶️ Tracking Methodology</a></td>
  </tr>
  <tr>
    <td width="20%"><strong><a href="tests/tests/antibots/perimeterx.spec.ts">PerimeterX Protection Study</a></strong></td>
    <td width="30%"><a href="//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-perimeterx-zillow">▶️ Consistency Validation</a></td>
    <td width="20%"><strong><a href="tests/tests/antibots/pixelscan.spec.ts">Pixelscan Fingerprint Assessment</a></strong></td>
    <td width="30%"><a href="//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-pixelscan-pixelscan">▶️ Comprehensive Study</a></td>
  </tr>
</table>

### Cross-Platform Consistency Validation
- **Windows Profile on macOS:** Fingerprint consistency maintained so privacy protections remain effective across platforms
- **Android Emulation on Desktop:** Mobile API consistency enables fingerprint parity testing for cross-device privacy research
- **Headless vs GUI Mode:** Identical fingerprint behavior ensures privacy validation results remain consistent across execution contexts

📖 **[Complete Validation Results & Research Data →](VALIDATION.md)** - 31+ tracking analysis scenarios, 15+ tracking methodologies, statistical analysis

---

## Resources & Support

### Documentation

| Document | Description | Content Preview |
|----------|-------------|-----------------|
| **[Installation Guide](INSTALLATION.md)** | Platform-specific setup | Windows/macOS/Ubuntu guides, Docker deployment, troubleshooting |
| **[Advanced Features](ADVANCED_FEATURES.md)** | Technical capabilities | 30+ CLI flags, privacy noise augmentation, GPU micro-benchmarks |
| **[Validation Results](VALIDATION.md)** | Research data | 31+ tracking observatories, 50,000+ test sessions, statistical analysis |
| **[CLI Flags Reference](CLI_FLAGS.md)** | Command-line options | `--bot-config-*` flags, proxy auth, session management |
| **[Profile Configuration](profiles/PROFILE_CONFIGS.md)** | Profile customization | Fingerprint control, cross-platform compatibility |
| **[Mirror](tools/mirror/)** | Distributed privacy consistency | Verify privacy protection consistency across multiple browser instances simultaneously |
| **[CanvasLab](tools/canvaslab/)** | Canvas forensics tool | Canvas 2D recording with JSONL viewer (deterministic replay under development) |
| **[Examples](examples/)** | Code samples | Playwright, Puppeteer, bot-script integration |

### Quick Access

**Framework Integration:**
- [Playwright Examples](examples/playwright/) - TypeScript/Python integration
- [Puppeteer Examples](examples/puppeteer/) - JavaScript scripting
- [Bot-Script Examples](examples/bot-script/) - Framework-less `chrome.debugger` API

**Profile Management:**
- Demo profiles available in [profiles/](profiles/) directory
- Premium privacy profiles: Contact [botbrowser@bk.ru](mailto:botbrowser@bk.ru)

### Support Channels

<table>
  <tr><td>📧 Email</td><td>Technical questions, source code access</td><td><a href="mailto:botbrowser@bk.ru">botbrowser@bk.ru</a></td></tr>
  <tr><td>📱 Telegram</td><td>Community support, quick questions</td><td><a href="https://t.me/botbrowser_support">@botbrowser_support</a></td></tr>
</table>

### Building from Source

For advanced users who want to build BotBrowser from source:

1. **Requirements:** Linux build environment, Chromium build tools
2. **Source Access:** Available to qualified researchers and institutions

Contact [botbrowser@bk.ru](mailto:botbrowser@bk.ru) for source code access and compilation instructions.

### Debugging & FAQs

| Issue | Platform | Solution |
|-------|----------|----------|
| **"Chromium" is damaged** | macOS | Run `xattr -rd com.apple.quarantine /Applications/Chromium.app` |
| **Missing dependencies** | Ubuntu | Run `sudo apt-get install -f` |
| **Profile file permission errors** | All | Ensure `.enc` file has read permissions (`chmod 644`) |
| **BotBrowser won't start or crashes** | All | Check that your OS and Chromium version match the build; update BotBrowser to the latest release |

---

## Responsible Use

- Review the detailed [Responsible Use Guidelines](RESPONSIBLE_USE.md) and [Legal Disclaimer](DISCLAIMER.md) before requesting binaries or premium profiles.
- Maintain written authorization for every environment you test, and record the synthetic data sets you rely on.
- Contact the maintainers at [botbrowser@bk.ru](mailto:botbrowser@bk.ru) if you observe suspicious activity or need to report an abuse incident.

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
