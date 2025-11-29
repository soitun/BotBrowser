<h1 align="center">🤖 BotBrowser</h1>

<h4 align="center">Professional Cross-Platform Browser with Unified Fingerprint Technology 🚀</h4>

<p align="center">
  Identical fingerprints on any OS • Cross-platform compatibility • Validated against 31+ detection systems for research benchmarking
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
## 📖 What Is BotBrowser?

BotBrowser delivers identical browser fingerprints across all platforms. Run the same profile on Windows, macOS, or Linux and you'll see the exact same fingerprint every time.  

Designed for automation testing, cross-platform compatibility validation, and maintaining consistent browser environments in authorized research and defensive benchmarking settings. Review the project [Legal Disclaimer](DISCLAIMER.md) and [Responsible Use Guidelines](RESPONSIBLE_USE.md) before using the software.  

---

## 🏆 Why BotBrowser

> **What makes BotBrowser different:** Cross-platform browser with unified fingerprint technology that keeps fingerprints identical everywhere.

<table cellspacing="0" cellpadding="8">
  <tr>
    <th width="50%">Core Advantages</th>
    <th width="50%">Technical Excellence</th>
  </tr>
  <tr>
    <td width="50%"><strong>High-fidelity Profile Simulation</strong> – Synthetic/aggregated profiles for realistic, policy-compliant testing</td>
    <td width="50%"><strong>Latest Chromium Base</strong> – Always synced to newest stable Chrome for zero fingerprint drift</td>
  </tr>
  <tr>
    <td width="50%"><strong>Zero-Config Intelligence</strong> – Auto-detects timezone/locale/language from IP</td>
    <td width="50%"><strong>Advanced Programmatic Control</strong> – <a href="examples/">Playwright/Puppeteer integration</a> with CDP leak blocking</td>
  </tr>
  <tr>
    <td width="50%"><strong>Network Stack Parity</strong> – Browser-level proxies keep geo signals consistent (ENT Tier3 feature)</td>
    <td width="50%"><strong>Full-Proxy QUIC/STUN</strong> – Chromium-level UDP associate keeps QUIC/STUN proxied; ICE presets only needed when UDP is unavailable (ENT Tier3 feature, see <a href="ADVANCED_FEATURES.md#network-fingerprint-control">Network Fingerprint Control</a>)</td>
  </tr>
</table>

### 📱 Cross-Platform Fingerprint Consistency

- Single profile, every host OS: identical UA, screen metrics, touch surfaces, fonts, and device APIs on Windows/macOS/Linux + Android emulation.
- Built-in automation handles touch simulation, device metrics, and locale/timezone detection from the proxy IP while still allowing CLI overrides when you truly need them.
- Quick demos: [▶️ CreepJS Android](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-creepjs-creepjs-Android) • [▶️ Iphey](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-iphey-iphey-Android) • [▶️ Pixelscan](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-pixelscan-pixelscan-Android)

---

## 🚀 Getting Started

### ⚙️ Quick Start

**Step 1: Download**
- [Latest release](https://github.com/botswin/BotBrowser/releases) for your OS
- [Demo profile](profiles/) (any `.enc` file)

**Step 2: Launch** (⚠️ use absolute paths)
- **Windows example:**
  ```cmd
  chrome.exe --no-sandbox --bot-profile="C:\absolute\path\to\profile.enc" --user-data-dir="%TEMP%\botprofile_%RANDOM%"
  ```
- macOS/Linux commands follow the same pattern; see [INSTALLATION.md](INSTALLATION.md) for full instructions.

**Step 3: Verify**
- Visit [CreepJS](https://abrahamjuliot.github.io/creepjs/) or your preferred test harness to confirm identical fingerprints.
- Timezone/locale/language auto-derive from your proxy/IP; override via CLI only when needed.


📖 **[Complete Installation Guide →](INSTALLATION.md)**

### 🔬 Minimal Playwright Example

```javascript
const browser = await chromium.launch({
  headless: true,
  executablePath: BOTBROWSER_EXEC_PATH,
  args: ['--no-sandbox', `--bot-profile=${BOT_PROFILE_PATH}`],
  '--proxy-server="socks5://usr:pwd@127.0.0.1:8989"',  // or: "http://usr:pwd@127.0.0.1:8989"
});
const page = await browser.newPage();
await page.addInitScript(() => { delete window.__playwright__binding__; delete window.__pwInitScripts; });
await page.goto('https://abrahamjuliot.github.io/creepjs/');
```

**Notes:**
- Use `--user-data-dir` with a unique temporary folder to avoid conflicts with running Chromium instances
- Prefer `--proxy-server` or per‑context proxies; auto timezone/locale detection applies in both cases
- Avoid framework‑specific proxy/auth options (e.g., `page.authenticate()`), which bypass BotBrowser geo detection

Examples: [Playwright](examples/playwright/) • [Puppeteer](examples/puppeteer/)

**More options:**
- Framework‑less automation: [`--bot-script` + CDP](examples/bot-script/) (privileged context, earlier hook, fewer artifacts)
- Docker: [docker/README.md](docker/)
- Full flags: [CLI_FLAGS.md](CLI_FLAGS.md)

## 🛠️ Advanced Capabilities
> **Professional-grade browser technology** through multi-layer fingerprint consistency, network-stack control, and automation-hardening.

- **Multi‑Layer Consistency:** Canvas/WebGL/Text metrics with low‑level Skia/HarfBuzz tuning and targeted WebGL/WebGPU controls
- **Clean Automation:** CDP/WebDriver hardening, Chrome‑like behavior, and framework‑less early hooks via `--bot-script`
- **Configurability:** 30+ CLI overrides, per‑context proxies with automatic geo‑detection, and session tools (cookies/bookmarks/title)
- **Headless ↔ GUI Parity:** Stable GPU/WebGPU/media signals and consistent behavior across browser modes
- **Performance Controls:** Precise FPS simulation, memory/storage timing, and GPU micro‑benchmarks for realistic profiles; runtime timing scaling (ENT Tier1) and deterministic noise seeds (ENT Tier2)
- **Focus & Session Control:** Always-active tab emulation, configurable WebRTC ICE servers, and expanded media decoder reporting for authentic runtime signals
- **Network & Proxy Enhancements:** Per-context proxies with auto geo detection; UDP-over-SOCKS5 tunnel for QUIC/STUN in ENT Tier3; ICE presets optional when UDP is available
> **Professional-grade browser technology** through sophisticated multi-layer fingerprint consistency and cross-platform compatibility systems

<details>
<summary><strong>Coverage Map: Detection Surfaces → Capabilities → Evidence</strong></summary>

This map links common detection surfaces to BotBrowser capabilities and the exact docs/tests where they are demonstrated.

| Detection Surface | Capability | Evidence |
|---|---|---|
| navigator.webdriver | Removed/hidden at engine level | [ADVANCED_FEATURES#Chrome Behavior Emulation](ADVANCED_FEATURES.md#chrome-behavior-emulation) |
| JS Execution Isolation | CDP/WebDriver artifact blocking | [ADVANCED_FEATURES#Playwright/Puppeteer Integration](ADVANCED_FEATURES.md#playwright-puppeteer-integration) |
| Canvas/WebGL/WebGPU/Audio/Text metrics | Deterministic noise + parameter controls and cross‑worker consistency | [ADVANCED_FEATURES#Graphics & Rendering Engine](ADVANCED_FEATURES.md#graphics-rendering-engine) |
| Fonts/Text | Built-in fonts + HarfBuzz shaping | [ADVANCED_FEATURES#Cross-Platform Font Engine](ADVANCED_FEATURES.md#cross-platform-font-engine) |
| MediaDevices | Profile-based device spoofing | [Profile Configs](profiles/PROFILE_CONFIGS.md) |
| WebRTC | SDP/ICE manipulation, candidate filtering | [ADVANCED_FEATURES#WebRTC Leak Protection](ADVANCED_FEATURES.md#webrtc-leak-protection) |
| UA Congruence | Brand + full-version alignment | [CLI_FLAGS#Profile Configuration Override Flags](CLI_FLAGS.md#⚙️-profile-configuration-override-flags) |
| UA Congruence | Brand + full-version alignment | [CLI_FLAGS#Profile Configuration Override Flags](CLI_FLAGS.md#profile-configuration-override-flags) |
| Headless Parity | GPU/WebGPU/media signals stable | [ADVANCED_FEATURES#Headless & Incognito Compatibility](ADVANCED_FEATURES.md#headless-incognito-compatibility) |
| DNS Leaks | SOCKS5 DNS-through-proxy | [ADVANCED_FEATURES#Enhanced Proxy System](ADVANCED_FEATURES.md#enhanced-proxy-system) |
| HTTP Headers | Chrome-like headers, HTTP/2/3 behavior | [ADVANCED_FEATURES#Chrome Behavior Emulation](ADVANCED_FEATURES.md#chrome-behavior-emulation) |
| TLS Fingerprint | JA3/JARM/ALPN control (Roadmap) | [CHANGELOG](CHANGELOG.md) |

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

## ⚙️ Configuration & Profiles

> 📢 BotBrowser combines synthetic/aggregated profiles with flexible configuration for authorized research. Profile consistency and CLI settings enable comparative analysis.

- **Profile Foundation:** Synthetic/aggregated profiles provide realistic fingerprint data for authorized testing
- **CLI Flexibility:** Override profile settings at runtime without modifying encrypted files
- **Cross-Platform Compatibility:** A *macOS profile* works on Ubuntu; a *Windows profile* works on macOS; an *Android profile* can be fully emulated on any OS
- **Auto-Configuration:** Timezone, locale, and languages automatically detected from IP/proxy
- **CLI Flags:** See the [⚙️ CLI flags reference](CLI_FLAGS.md) - *Recommended for most users*


> ⚠️ Note: This project must only be used in environments you own or where you have explicit authorization. Use against third-party services without permission is strictly prohibited.

---

## 🖥️ BotBrowserConsole (GUI Tool)

Prefer a GUI launcher? See [console/README.md](console) for BotBrowserConsole usage, multi-instance management, and profile selection.

---

## 🎯 Research Validation

### Academic Research Overview

Our compatibility research examines browser fingerprinting techniques across different client configurations to improve web compatibility and understand fingerprint consistency.

> ⚠️ Research demos in authorized environments. See [DISCLAIMER](DISCLAIMER.md).

<table cellspacing="0" cellpadding="8">
  <tr>
    <th width="20%">Service</th>
    <th width="30%">Demo</th>
    <th width="20%">Service</th>
    <th width="30%">Demo</th>
  </tr>
  <tr>
    <td width="20%"><strong><a href="tests/tests/antibots/cloudflare.spec.ts">Cloudflare</a></strong></td>
    <td width="30%"><a href="//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-cloudflare-turnstile">▶️ Turnstile Demo</a></td>
    <td width="20%"><strong><a href="tests/tests/antibots/creepjs.spec.ts">CreepJS</a></strong></td>
    <td width="30%"><a href="//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-creepjs-creepjs">▶️ Desktop Test</a> / <a href="//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-creepjs-creepjs-Android">▶️ Android Profile</a></td>
  </tr>
  <tr>
    <td width="20%"><strong><a href="tests/tests/antibots/datadome.spec.ts">DataDome</a></strong></td>
    <td width="30%"><a href="//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-datadome-fifa">▶️ FIFA2026 Demo</a></td>
    <td width="20%"><strong><a href="tests/tests/antibots/fingerprintjs.spec.ts">FingerprintJS Pro</a></strong></td>
    <td width="30%"><a href="//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-fingerprintjs-botdetection">▶️ Bot Detection</a></td>
  </tr>
  <tr>
    <td width="20%"><strong><a href="tests/tests/antibots/perimeterx.spec.ts">PerimeterX</a></strong></td>
    <td width="30%"><a href="//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-perimeterx-zillow">▶️ Zillow Demo</a></td>
    <td width="20%"><strong><a href="tests/tests/antibots/pixelscan.spec.ts">Pixelscan</a></strong></td>
    <td width="30%"><a href="//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-pixelscan-pixelscan">▶️ Comprehensive Scan</a></td>
  </tr>
</table>

### Cross-Platform Validation
- **Windows Profile on macOS:** Fingerprint consistency maintained
- **Android Emulation on Desktop:** Complete mobile API simulation
- **Headless vs GUI Mode:** Identical fingerprint stability

📖 **[Complete Validation Results & Research Data →](VALIDATION.md)** - 31+ detection systems, 15+ fingerprinting tools, statistical analysis

---

## 📖 Resources & Support

### 📄 Documentation

| Document | Description | Content Preview |
|----------|-------------|-----------------|
| **[Installation Guide](INSTALLATION.md)** | Platform-specific setup | Windows/macOS/Ubuntu guides, Docker deployment, troubleshooting |
| **[Advanced Features](ADVANCED_FEATURES.md)** | Technical capabilities | 30+ CLI flags, noise injection, GPU micro-benchmarks |
| **[Validation Results](VALIDATION.md)** | Research data | 31+ detection systems, 50,000+ test sessions, statistical analysis |
| **[CLI Flags Reference](CLI_FLAGS.md)** | Command-line options | `--bot-config-*` flags, proxy auth, session management |
| **[Profile Configuration](profiles/PROFILE_CONFIGS.md)** | Profile customization | Fingerprint control, cross-platform compatibility |
| **[BotCanvasLab](tools/botcanvas/)** | Canvas forensics tool | Canvas 2D recording with JSONL viewer (deterministic replay under development) |
| **[Examples](examples/)** | Code samples | Playwright, Puppeteer, bot-script automation |

### 🔗 Quick Access

**Framework Integration:**
- [Playwright Examples](examples/playwright/) - TypeScript/Python integration
- [Puppeteer Examples](examples/puppeteer/) - JavaScript automation
- [Bot-Script Examples](examples/bot-script/) - Framework-less `chrome.debugger` API

**Profile Management:**
- Demo profiles available in [profiles/](profiles/) directory
- Premium profiles: Contact [botbrowser@bk.ru](mailto:botbrowser@bk.ru)

### 🆘 Support Channels

| Contact Method | Best For | Link |
|----------------|----------|------|
| 📧 Email | Technical questions, source code access | [botbrowser@bk.ru](mailto:botbrowser@bk.ru) |
| 📱 Telegram | Community support, quick questions | [@botbrowser_support](https://t.me/botbrowser_support) |

### 🏗️ Building from Source

For advanced users who want to build BotBrowser from source:

1. **Requirements:** Linux build environment, Chromium build tools
2. **Source Access:** Available to qualified researchers and institutions

Contact [botbrowser@bk.ru](mailto:botbrowser@bk.ru) for source code access and compilation instructions.

### 🐞 Debugging & FAQs

| Issue | Platform | Solution |
|-------|----------|----------|
| **STATUS_ACCESS_VIOLATION** | Windows | Add `--no-sandbox` flag when launching |
| **"Chromium" is damaged** | macOS | Run `xattr -rd com.apple.quarantine /Applications/Chromium.app` |
| **Missing dependencies** | Ubuntu | Run `sudo apt-get install -f` |
| **Profile file permission errors** | All | Ensure `.enc` file has read permissions (`chmod 644`) |
| **BotBrowser won't start or crashes** | All | Check that your OS and Chromium version match the build; update BotBrowser to the latest release |

---

## 🛡️ Responsible Use

- Review the detailed [Responsible Use Guidelines](RESPONSIBLE_USE.md) and [Legal Disclaimer](DISCLAIMER.md) before requesting binaries or premium profiles.
- Maintain written authorization for every environment you test, and record the synthetic data sets you rely on.
- Contact the maintainers at [botbrowser@bk.ru](mailto:botbrowser@bk.ru) if you observe suspicious activity or need to report an abuse incident.

**📋 [Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md)** • **[Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint-consistency testing and research only.
