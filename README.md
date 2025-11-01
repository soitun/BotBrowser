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

BotBrowser delivers identical browser fingerprints across all platforms. Run the same profile on Windows, macOS, or Linux — get the exact same fingerprint every time.  

Designed for automation testing, cross-platform compatibility validation, and maintaining consistent browser environments in authorized research and defensive benchmarking settings. Review the project [Legal Disclaimer](DISCLAIMER.md) and [Responsible Use Guidelines](RESPONSIBLE_USE.md) before using the software.  

---

## 🏆 Why BotBrowser

> **What makes BotBrowser different:** Cross-platform browser with unified fingerprint technology — identical fingerprints everywhere

| **Core Advantages** | **Technical Excellence** |
|---------------------|-------------------------|
| **High-fidelity Profile Simulation** - Synthetic/aggregated profiles for realistic, policy-compliant testing | **Latest Chromium Base** - Always synced to newest stable Chrome for zero fingerprint drift |
| **Zero-Config Intelligence** - Auto-detects timezone/locale/language from IP | **Advanced Programmatic Control** - [Playwright/Puppeteer integration](examples/) with CDP leak blocking |

### 📱 Cross-Platform Fingerprint Consistency
**Unified fingerprints:** Identical browser fingerprints across all platforms (Windows, macOS, Android) ensuring consistency regardless of host system.

Automatic touch simulation, device metrics, and unified fingerprint rendering across platforms.

**Desktop → Android Test Results:**
- [▶️ CreepJS Test](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-creepjs-creepjs-Android) - Desktop simulation of Android fingerprint
- [▶️ Iphey Test](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-iphey-iphey-Android) - Complete mobile device simulation
- [▶️ Pixelscan Test](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-pixelscan-pixelscan-Android) - Cross-platform compatibility demonstration

---

## 🚀 Getting Started

### Quick Start

**Step 1: Download**
- [BotBrowser release](https://github.com/botswin/BotBrowser/releases) for your OS
- [Demo profile](profiles/) (any `.enc` file)

**Step 2: Launch** (⚠️ use absolute paths)

**Windows:**
```cmd
chrome.exe --no-sandbox --bot-profile="C:\\absolute\\path\\to\\chrome139_win11_x64.enc" --user-data-dir="%TEMP%\\botprofile_%RANDOM%"
```

**macOS:**
```bash
/Applications/Chromium.app/Contents/MacOS/Chromium --no-sandbox --user-data-dir="$(mktemp -d)" --bot-profile="/absolute/path/to/chrome139_win11_x64.enc"
```

**Ubuntu:**
```bash
chromium-browser --no-sandbox --user-data-dir="$(mktemp -d)" --bot-profile="/absolute/path/to/chrome139_win11_x64.enc"
```

**Step 3: Test**
Visit [CreepJS](https://abrahamjuliot.github.io/creepjs/) to see fingerprint consistency in action!

> 🌍 **Works instantly** — timezone and locale auto-detected from your IP

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
- Prefer `--proxy-server` or per‑context proxies; auto timezone/locale detection applies in both cases
- Avoid framework‑specific proxy/auth options (e.g., `page.authenticate()`), which bypass BotBrowser geo detection

Examples: [Playwright](examples/playwright/) • [Puppeteer](examples/puppeteer/)

**More options:**
- Framework‑less automation: [`--bot-script` + CDP](examples/bot-script/) (privileged context, earlier hook, fewer artifacts)
- Docker: [docker/README.md](docker/)
- Full flags: [CLI_FLAGS.md](CLI_FLAGS.md)

## 🛠️ Advanced Capabilities

> **Professional-grade browser technology** through sophisticated multi-layer fingerprint consistency and cross-platform compatibility systems

<details>
<summary><strong>Coverage Map — Detection Surfaces → Capabilities → Evidence</strong></summary>

This map links common detection surfaces to BotBrowser capabilities and the exact docs/tests where they are demonstrated.

| Detection Surface | Capability | Evidence |
|---|---|---|
| navigator.webdriver | Removed/hidden at engine level | [ADVANCED_FEATURES#Chrome Behavior Emulation](ADVANCED_FEATURES.md#chrome-behavior-emulation) |
| JS Execution Isolation | CDP/WebDriver artifact blocking | [ADVANCED_FEATURES#Playwright/Puppeteer Integration](ADVANCED_FEATURES.md#playwright-puppeteer-integration) |
| Canvas/WebGL/WebGPU/Audio/Text metrics | Deterministic noise + parameter controls and cross‑worker consistency | [ADVANCED_FEATURES#Graphics & Rendering Engine](ADVANCED_FEATURES.md#graphics-rendering-engine) |
| Fonts/Text | Built-in fonts + HarfBuzz shaping | [ADVANCED_FEATURES#Cross-Platform Font Engine](ADVANCED_FEATURES.md#cross-platform-font-engine) |
| MediaDevices | Profile-based device spoofing | [Profile Configs](profiles/PROFILE_CONFIGS.md) |
| WebRTC | SDP/ICE manipulation, candidate filtering | [ADVANCED_FEATURES#WebRTC Leak Protection](ADVANCED_FEATURES.md#webrtc-leak-protection) |
| Proxies/Geo | Per-context proxy + auto timezone/locale | [CLI_FLAGS#Enhanced Proxy Configuration](CLI_FLAGS.md#enhanced-proxy-configuration) |
| UA Congruence | Brand + full-version alignment | [CLI_FLAGS#Profile Configuration Override Flags](CLI_FLAGS.md#profile-configuration-override-flags) |
| Headless Parity | GPU/WebGPU/media signals stable | [ADVANCED_FEATURES#Headless & Incognito Compatibility](ADVANCED_FEATURES.md#headless-incognito-compatibility) |
| DNS Leaks | SOCKS5 DNS-through-proxy | [ADVANCED_FEATURES#Enhanced Proxy System](ADVANCED_FEATURES.md#enhanced-proxy-system) |
| HTTP Headers | Chrome-like headers, HTTP/2/3 behavior | [ADVANCED_FEATURES#Chrome Behavior Emulation](ADVANCED_FEATURES.md#chrome-behavior-emulation) |
| TLS Fingerprint | JA3/JARM/ALPN control (Roadmap) | [CHANGELOG](CHANGELOG.md) |

</details>

### Core Technology Arsenal

- **Multi‑Layer Consistency:** Canvas/WebGL/Text metrics with low‑level Skia/HarfBuzz tuning and targeted WebGL/WebGPU controls
- **Clean Automation:** CDP/WebDriver hardening, Chrome‑like behavior, and framework‑less early hooks via `--bot-script`
- **Configurability:** 30+ CLI overrides, per‑context proxies with automatic geo‑detection, and session tools (cookies/bookmarks/title)
- **Headless ↔ GUI Parity:** Stable GPU/WebGPU/media signals and consistent behavior across browser modes
- **Performance Controls:** Precise FPS simulation, memory/storage timing, and GPU micro‑benchmarks for realistic profiles
- **Focus & Session Control:** Always-active tab emulation, configurable WebRTC ICE servers, and expanded media decoder reporting for authentic runtime signals

### Fingerprint Consistency Matrix — Cross‑Platform Coverage

| Category | Sample Capabilities |
|----------|---------------------|
| **Graphics** | Canvas/WebGL rendering, GPU micro-benchmarks, texture hash configuration |
| **Network** | WebRTC SDP configuration, proxy auth, connection management |
| **Platform** | Font fallback chains, cross-worker consistency, OS-specific features |
| **Performance** | FPS simulation, memory timing, animation frame optimization |

📖 **[Complete Advanced Features Documentation →](ADVANCED_FEATURES.md)**



---

## ⚙️ Configuration & Profiles

> 📢 BotBrowser combines synthetic/aggregated profiles with flexible configuration for authorized research. Profile consistency and CLI settings enable comparative analysis.

### Key Concepts
- **Profile Foundation:** Synthetic/aggregated profiles provide realistic fingerprint data for authorized testing
- **CLI Flexibility:** Override profile settings at runtime without modifying encrypted files
- **Cross-Platform Compatibility:** A *macOS profile* works on Ubuntu; a *Windows profile* works on macOS; an *Android profile* can be fully emulated on any OS
- **Auto-Configuration:** Timezone, locale, and languages automatically detected from IP/proxy

### Configuration Options
- **CLI Flags:** See the [⚙️ CLI flags reference](CLI_FLAGS.md) - *Recommended for most users*
- **Profile Settings:** See the [📚 profile-configs guide](profiles/PROFILE_CONFIGS.md) - *Advanced configuration*


> ⚠️ Note: This project must only be used in environments you own or where you have explicit authorization. Use against third-party services without permission is strictly prohibited.

---

## 🖥️ BotBrowserConsole (GUI Tool)

For users who prefer a graphical interface, [BotBrowserConsole](console) provides a user-friendly way to manage BotBrowser:

**Features:**
- Select profiles and start browsing without command line
- Launch multiple browser instances easily
- Manage different environments and accounts
- User-friendly interface

---

## 🎯 Research Validation

### Academic Research Overview

Our compatibility research examines browser fingerprinting techniques across different client configurations to improve web compatibility and understand fingerprint consistency.

### Test Results

> ⚠️ Research demos in authorized environments. See [DISCLAIMER](DISCLAIMER.md).

**Anti-Bot Systems:**
| Service | Technology | Results |
|---------|------------|---------|
| **[Cloudflare](tests/tests/antibots/cloudflare.spec.ts)** | Turnstile, Bot Management | [▶️ Turnstile Demo](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-cloudflare-turnstile) |
| **[DataDome](tests/tests/antibots/datadome.spec.ts)** | ML-based detection | [▶️ FIFA2026 Demo](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-datadome-fifa) |
| **[PerimeterX](tests/tests/antibots/perimeterx.spec.ts)** | Behavioral analysis | [▶️ Zillow Demo](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-perimeterx-zillow) |

**Fingerprinting Systems:**
| Service | Focus | Results |
|---------|-------|---------|
| **[CreepJS](tests/tests/antibots/creepjs.spec.ts)** | Comprehensive fingerprinting | [▶️ Desktop Test](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-creepjs-creepjs) \| [▶️ Android Profile](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-creepjs-creepjs-Android) |
| **[FingerprintJS Pro](tests/tests/antibots/fingerprintjs.spec.ts)** | Commercial fingerprinting | [▶️ Bot Detection](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-fingerprintjs-botdetection) |
| **[Pixelscan](tests/tests/antibots/pixelscan.spec.ts)** | Detection suite | [▶️ Comprehensive Scan](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-pixelscan-pixelscan) |

### Cross-Platform Validation
- **Windows Profile on macOS:** Fingerprint consistency maintained
- **Android Emulation on Desktop:** Complete mobile API simulation
- **Headless vs GUI Mode:** Identical fingerprint stability

📖 **[Complete Validation Results & Research Data →](VALIDATION.md)** - 31+ anti-bot systems, 15+ fingerprinting tools, statistical analysis

---

## 📚 Resources & Support

### Documentation

| Document | Description | Content Preview |
|----------|-------------|-----------------|
| **[Installation Guide](INSTALLATION.md)** | Platform-specific setup | Windows/macOS/Ubuntu guides, Docker deployment, troubleshooting |
| **[Advanced Features](ADVANCED_FEATURES.md)** | Technical capabilities | 30+ CLI flags, noise injection, GPU micro-benchmarks |
| **[Validation Results](VALIDATION.md)** | Research data | 31+ anti-bot systems, 50,000+ test sessions, statistical analysis |
| **[CLI Flags Reference](CLI_FLAGS.md)** | Command-line options | `--bot-config-*` flags, proxy auth, session management |
| **[Profile Configuration](profiles/PROFILE_CONFIGS.md)** | Profile customization | Fingerprint control, cross-platform compatibility |
| **[BotCanvasLab](tools/botcanvas/)** | Canvas forensics tool | Canvas 2D recording, JSONL event viewer, replay roadmap |
| **[Examples](examples/)** | Code samples | Playwright, Puppeteer, bot-script automation |

### Quick Access

**Framework Integration:**
- [Playwright Examples](examples/playwright/) - TypeScript/Python integration
- [Puppeteer Examples](examples/puppeteer/) - JavaScript automation
- [Bot-Script Examples](examples/bot-script/) - Framework-less `chrome.debugger` API

**Profile Management:**
- Demo profiles available in [profiles/](profiles/) directory
- Premium profiles: Contact [botbrowser@bk.ru](mailto:botbrowser@bk.ru)

### Support Channels

| Contact Method | Best For | Link |
|----------------|----------|------|
| 📧 Email | Technical questions, source code access | [botbrowser@bk.ru](mailto:botbrowser@bk.ru) |
| 📱 Telegram | Community support, quick questions | [@botbrowser_support](https://t.me/botbrowser_support) |

### Building from Source

For advanced users who want to build BotBrowser from source:

1. **Requirements:** Linux build environment, Chromium build tools
2. **Source Access:** Available to qualified researchers and institutions

Contact [botbrowser@bk.ru](mailto:botbrowser@bk.ru) for source code access and compilation instructions.

### Debugging & FAQs

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

**📋 [Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md)** • **[Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)** — BotBrowser is for authorized fingerprint-consistency testing and research only.
