# BotBrowser CLI Flags Reference

For Academic and Authorized Testing Environments.

This document explains BotBrowser’s CLI configuration system. These flags extend Chromium and provide comprehensive, runtime control over fingerprints without modifying profile files. For terms of use, see the [Legal Disclaimer](DISCLAIMER.md) and [Responsible Use Guidelines](RESPONSIBLE_USE.md).

> Smart auto‑configuration: BotBrowser derives timezone, locale, and languages from your IP/proxy. Override only when you need a specific setup.

> Dynamic configuration: CLI overrides (`--bot-config-*` + behavior toggles) enable runtime fingerprint control, which is ideal for CI/CD and multi‑instance scenarios.

> License tiers: Some flags show tier hints in parentheses (PRO, ENT Tier1/Tier2/Tier3); those options are subscription-gated.

## 📘 Table of Contents

- [Core BotBrowser Flags](#core-botbrowser-flags)
- [Enhanced Proxy Configuration](#enhanced-proxy-configuration)
- [BotBrowser Customization](#botbrowser-customization)
- [Profile Configuration Override Flags](#profile-configuration-override-flags)
- [Usage Examples](#usage-examples)

---

## 🛠️ Core BotBrowser Flags

### `--bot-profile`
The foundation of BotBrowser’s compatibility features.

Specifies the path to the BotBrowser profile file (.enc).

```bash
--bot-profile="/absolute/path/to/profile.enc"
```

**Notes:**
- The profile determines the fingerprint, OS emulation, and compatibility features
- Use profiles from the [profiles directory](profiles/) or contact support for custom profiles
- This is the core difference from stock Chromium

---

<a id="enhanced-proxy-configuration"></a>
## Enhanced Proxy Configuration

### Enhanced `--proxy-server` with Embedded Credentials
BotBrowser extends the standard `--proxy-server` flag to accept embedded credentials in the URL.

⚠️ **Important**: For authorized network testing only. Do not use for unauthorized data collection.

```bash
# HTTP/HTTPS proxy with credentials
--proxy-server="http://username:password@proxy.example.com:8080"
--proxy-server="https://username:password@proxy.example.com:8080"

# SOCKS5 proxy with credentials
--proxy-server="socks5://username:password@proxy.example.com:1080"
```

**Supported Protocols:** HTTP, HTTPS, SOCKS5

### UDP over SOCKS5 (ENT Tier3)
ENT Tier3 adds automatic SOCKS5 UDP ASSOCIATE support with no extra flag required. When the proxy supports UDP, BotBrowser will tunnel QUIC traffic and STUN probes over the proxy to harden proxy checks.

```bash
# UDP (QUIC/STUN) auto-tunneled when the SOCKS5 proxy supports UDP associate
--proxy-server="socks5://username:password@proxy.example.com:1080"
```

### `--proxy-ip`
Specify the proxy’s public IP to optimize performance.

This skips per‑page IP lookups and speeds up navigation.

```bash
--proxy-ip="203.0.113.1"
```

**Benefits:**
- Eliminates IP detection overhead on each page load
- Faster browsing when using proxies
- Combine with `--bot-config-timezone` for consistent region emulation


⚠️ Important:
- Browser‑level proxy: use `--proxy-server` for consistent geo‑detection across contexts
- Per‑context proxy: set different proxies via `createBrowserContext({ proxy })`; BotBrowser auto‑derives geo info in both cases
- Avoid: framework‑specific options like `page.authenticate()` that bypass BotBrowser’s geo‑detection

---

## 🎨 BotBrowser Customization

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

Accepts a JSON string containing cookie data for startup.

```bash
--bot-cookies='[{"name":"session","value":"abc123","domain":".example.com"}]'
```

### `--bot-bookmarks`
Pre‑populate bookmarks for session consistency.

Accepts a JSON string containing bookmark data for startup.

```bash
--bot-bookmarks='[{"title":"Example","type":"url","url":"https://example.com"},{"title":"Folder","type":"folder","children":[{"title":"Example","type":"url","url":"https://example.com"}]}]'
```

### `--bot-canvas-record-file`
Canvas forensics and fingerprint analysis.

Records all Canvas 2D API calls to a JSONL file for forensic analysis and future replay capabilities.

```bash
--bot-canvas-record-file="/tmp/botcanvas.jsonl"
```

**Key Features:**
- Complete Canvas 2D API call recording with full parameter serialization
- Deterministic capture (noise injection disabled during recording)
- JSONL format for easy parsing and analysis
- HTML viewer included for interactive event inspection

Learn more: [BotCanvas Documentation](tools/botcanvas/)

### `--bot-script`
Framework‑less automation with a privileged JavaScript context.

Execute a JavaScript file right after BotBrowser starts in a privileged, non-extension context where `chrome.debugger` is available.

```bash
--bot-script="/path/to/automation.js"
```

**Key Features:**
- No framework dependencies: pure Chrome DevTools Protocol access
- Earlier intervention: runs before navigation
- Privileged context: full `chrome.debugger` API access
- Reduced detection surface: no Playwright/Puppeteer artifacts

Documentation: Chrome `chrome.debugger` API - <https://developer.chrome.com/docs/extensions/reference/api/debugger/>

Examples: [Bot Script Automation](examples/bot-script)

---

<a id="profile-configuration-override-flags"></a>
## ⚙️ Profile Configuration Override Flags

High‑priority configuration overrides: these CLI flags supersede profile settings.

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
- `--bot-config-disable-device-scale-factor=true`: Disable device scale factor: true, false

**Rendering, Noise & Media/RTC**
- `--bot-config-webgl=profile`: WebGL: profile (use profile), real (system), disabled (off)
- `--bot-config-webgpu=profile`: WebGPU: profile (use profile), real (system), disabled (off)
- `--bot-config-noise-webgl-image=true`: WebGL image noise: true, false
- `--bot-config-noise-canvas=true`: Canvas fingerprint noise: true, false
- `--bot-config-noise-audio-context=true`: Audio context noise: true, false
- `--bot-config-noise-client-rects=false`: Client rects noise: true, false
- `--bot-config-noise-text-rects=true`: Text rects noise: true, false
- `--bot-config-speech-voices=profile`: Speech voices: profile (synthetic), real (system)
- `--bot-config-media-devices=profile`: Media devices: profile (fake devices), real (system devices)
- `--bot-config-media-types=expand`: Media types: expand (default), profile, real
- `--bot-config-webrtc=profile`: WebRTC: profile (use profile), real (native), disabled (off)

> **Note: UA/Engine Congruence:** Keep `--bot-config-ua-full-version` aligned with your Chromium major version, and use `--bot-config-brand-full-version` when a vendor’s cadence (Edge, Opera, Brave) diverges so UA-CH metadata stays internally consistent.

### Behavior & Stealth Toggles

Runtime toggles that don’t rely on profile `configs` but still override behavior at launch.

- `--bot-disable-console-message`: Suppress console.* output from CDP logs (default true)
- `--bot-disable-debugger`: Ignore JavaScript `debugger` statements to avoid pauses
- `--bot-inject-random-history` (PRO): Inject synthetic browsing history for session authenticity
- `--bot-always-active` (PRO): Keep windows/tabs active even when unfocused
- `--bot-mobile-force-touch`: Force touch events on/off for mobile device simulation
- `--bot-webrtc-ice=google` (PRO): Override STUN/TURN endpoints observed by JavaScript/WebRTC to control ICE signaling; accepts presets (`google`) or `custom:stun:...,turn:...`
- `--bot-time-scale` (ENT Tier1): Float < 1.0; scales down `performance.now()` intervals to emulate lower load and reduce timing skew signals (typical range 0.80–0.99)
- `--bot-noise-seed` (ENT Tier2): Float seed for noise RNG; accepts 1.0–1.2 with arbitrary decimal precision to stabilize noise across sessions

### Key Benefits of CLI Configuration Flags

- **Highest Priority:** Overrides profile settings
- **No Profile Editing:** Avoid changing encrypted JSON
- **Dynamic Configuration:** Perfect for automation and CI/CD
- **Session Isolation:** Different settings per instance

### Spotlight: BotBrowser v142 20251117 Additions

- **Chromium 142.0.7444.163 base**: keeps rendering, networking, and storage surfaces in lockstep with Chrome Stable for minimum version skew.
- **`--bot-config-brand-full-version`**: decouples UA full version and brand cadence so Edge/Opera style UA-CH tuples remain believable.
- **Opera brand mode**: `--bot-config-browser-brand=opera` mirrors Opera UA-CH data and branding, while Brave parity fixes hide disallowed fields exactly like the real browser.

### Configuration Priority

1. CLI `--bot-config-*` flags (Highest priority)
2. Profile `configs` settings (Medium priority)
3. Profile default values (Lowest priority)

Behavior & stealth toggles apply at launch and bypass profile data entirely.

---

## 🔬 Usage Examples
📌 Quick launch patterns and reference commands.

### Minimal launch + proxy/automation
```bash
# Essential flags with proxy and remote debugging
chromium-browser \
  --no-sandbox \
  --bot-profile="/absolute/path/to/profile.enc" \
  --bot-title="My Session" \
  --proxy-server="http://myuser:mypass@proxy.example.com:8080" \
  --remote-debugging-port=9222
```

### Single-instance overrides
```bash
# Override only what you need (timezone/locale auto-detected)
chromium-browser \
  --no-sandbox \
  --bot-profile="/absolute/path/to/profile.enc" \
  --bot-config-browser-brand="edge" \  # PRO feature
  --bot-config-webgl="disabled" \
  --bot-config-noise-canvas=true \
  --bot-title="Custom Session"

# Active window + custom ICE servers
chromium-browser \
  --no-sandbox \
  --bot-profile="/absolute/path/to/profile.enc" \
  --bot-always-active=true \  # PRO feature
  --bot-webrtc-ice="custom:stun:stun.l.google.com:19302,turn:turn.example.com" \  # PRO feature
  --bot-config-media-types="expand"
```

### Multi-instance setup
```bash
# Instance 1 - Chrome brand with profile window settings
chromium-browser \
  --no-sandbox \
  --bot-profile="/absolute/path/to/profile.enc" \
  --bot-config-browser-brand="chrome" \  # PRO feature
  --bot-config-window="profile" \
  --bot-cookies='[{"name":"sessionid","value":"abc123","domain":".example.com"}]' \
  --bot-bookmarks='[{"title":"Work Site","url":"https://work.com","type":"url"}]' \
  --user-data-dir="/tmp/instance1" &

# Instance 2 - Edge brand with real window settings
chromium-browser \
  --no-sandbox \
  --bot-profile="/absolute/path/to/profile.enc" \
  --bot-config-browser-brand="edge" \  # PRO feature
  --bot-config-window="real" \
  --user-data-dir="/tmp/instance2" &
```

### Performance timing & noise control (ENT)
```bash
# Stabilize performance timing and noise determinism under load
chromium-browser \
  --no-sandbox \
  --bot-profile="/absolute/path/to/profile.enc" \
  --bot-time-scale=0.92 \  # ENT Tier1 feature
  --bot-noise-seed=1.07 \  # ENT Tier2 feature
  --bot-config-noise-canvas=true
```

---

## 📖 Related Documentation
📎 Quick links to supporting materials.

- [Profile Configuration Guide](profiles/PROFILE_CONFIGS.md) - Configure browser behavior via profiles
- [Main README](README.md) - General usage and standard Chromium flags
- [Examples](examples/) - Playwright and Puppeteer integration examples
- [Docker Deployment](docker/README.md) - Container deployment guides

---

## 💡 Tips & Best Practices
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

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md)** • **[Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**: BotBrowser is for authorized fingerprint-consistency testing and research only.
