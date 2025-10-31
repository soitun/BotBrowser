# 🚀 BotBrowser CLI Flags Reference

For Academic and Authorized Testing Environments.

This document explains BotBrowser’s CLI configuration system. These flags extend Chromium and provide comprehensive, runtime control over fingerprints—without modifying profile files. For terms of use, see the [Legal Disclaimer](DISCLAIMER.md) and [Responsible Use Guidelines](RESPONSIBLE_USE.md).

> 🌍 **Smart Auto‑Configuration:** BotBrowser derives timezone, locale, and languages from your IP/proxy. Override only when you need a specific setup.

> ⚡ **Dynamic Configuration:** 28 [`--bot-config-*` flags](#⚙️-profile-configuration-override-flags) enable runtime fingerprint control—ideal for CI/CD and multi‑instance scenarios.

## 📋 Table of Contents

- [🎯 Core BotBrowser Flags](#-core-botbrowser-flags)
- [🌐 Enhanced Proxy Configuration](#-enhanced-proxy-configuration)
- [🎨 BotBrowser Customization](#-botbrowser-customization)
- [⚙️ Profile Configuration Override Flags](#️-profile-configuration-override-flags)
- [📝 Usage Examples](#-usage-examples)

---

## 🎯 Core BotBrowser Flags

### `--bot-profile`
The foundation of BotBrowser’s compatibility features.

Specifies the path to the BotBrowser profile file (.enc).

```bash
--bot-profile="/path/to/chrome139_win11_x64.enc"
```

**Notes:**
- The profile determines the fingerprint, OS emulation, and compatibility features
- Use profiles from the [profiles directory](profiles/) or contact support for custom profiles
- This is the core difference from stock Chromium

---

<a id="enhanced-proxy-configuration"></a>
## 🌐 Enhanced Proxy Configuration

### Enhanced `--proxy-server` with Embedded Credentials
BotBrowser extends the standard `--proxy-server` flag to accept embedded credentials in the URL.

⚠️ **For Authorized Network Testing Only.** Do not use for unauthorized data collection.

```bash
# HTTP/HTTPS proxy with credentials
--proxy-server="http://username:password@proxy.example.com:8080"
--proxy-server="https://username:password@proxy.example.com:8080"

# SOCKS5 proxy with credentials
--proxy-server="socks5://username:password@proxy.example.com:1080"
```

**Supported Protocols:** HTTP, HTTPS, SOCKS5

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


⚠️ **Important:**
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

📖 **Learn More:** [BotCanvas Documentation](tools/botcanvas/)

### `--bot-script`
Framework‑less automation with a privileged JavaScript context.

Execute a JavaScript file right after BotBrowser starts in a privileged, non-extension context where `chrome.debugger` is available.

```bash
--bot-script="/path/to/automation.js"
```

**Key Features:**
- No framework dependencies — pure Chrome DevTools Protocol access
- Earlier intervention — runs before navigation
- Privileged context — full `chrome.debugger` API access
- Reduced detection surface — no Playwright/Puppeteer artifacts

📖 **Documentation:** Chrome `chrome.debugger` API - <https://developer.chrome.com/docs/extensions/reference/api/debugger/>

📖 **Examples:** [Bot Script Automation](examples/bot-script)

---

<a id="profile-configuration-override-flags"></a>
## ⚙️ Profile Configuration Override Flags

High‑priority configuration overrides — these CLI flags supersede profile settings.

BotBrowser now supports command-line flags that override profile configuration values with the highest priority. These flags start with `--bot-config-` and directly map to profile `configs` properties.

> 💡 **Recommended:** Use CLI flags instead of modifying profiles. They carry the highest priority and don’t require editing encrypted files.

### Available Configuration Override Flags

The following `--bot-config-*` flags map directly to profile `configs`:

```bash
--bot-config-browser-brand=chrome             # Browser brand: chrome, chromium, edge, brave
--bot-config-color-scheme=light               # Color scheme: light, dark
--bot-config-disable-debugger=true            # Disable JavaScript debugger: true, false
--bot-config-disable-device-scale-factor=true # Disable device scale factor: true, false
--bot-config-disable-console-message=true     # Suppress console.* output from CDP logs: true, false (default true)
--bot-config-fonts=profile                    # Font settings: profile (embedded), expand (profile + fallback), real (system fonts)
--bot-config-inject-random-history=true       # Inject random history: true, false
--bot-config-keyboard=profile                 # Keyboard settings: profile (emulated), real (system keyboard)
--bot-config-languages=auto                   # Languages: "lang1,lang2" (comma-separated) or "auto" (IP-based)
--bot-config-locale=auto                      # Browser locale: e.g. en-US, fr-FR, de-DE, or "auto" (derived from IP/language)
--bot-config-location=40.7128,-74.0060        # Location: "lat,lon" (coordinates) or "auto" (IP-based)
--bot-config-media-devices=profile            # Media devices: profile (fake devices), real (system devices)
--bot-config-always-active=true               # Keep windows/tabs active even unfocused (default true)
--bot-config-noise-audio-context=true         # Audio context noise: true, false
--bot-config-noise-canvas=true                # Canvas fingerprint noise: true, false
--bot-config-noise-client-rects=false         # Client rects noise: true, false
--bot-config-noise-text-rects=true            # Text rects noise: true, false
--bot-config-noise-webgl-image=true           # WebGL image noise: true, false
--bot-config-screen=profile                   # Screen properties: profile (use profile), real (system screen)
--bot-config-speech-voices=profile            # Speech voices: profile (synthetic), real (system voices)
--bot-config-timezone=auto                    # Timezone: auto (IP-based), real (system), or timezone name
--bot-config-ua-full-version=142.0.7444.60    # User agent version: full version string matching Chromium major
--bot-config-webgl=profile                    # WebGL: profile (use profile), real (system), disabled (off)
--bot-config-webgpu=profile                   # WebGPU: profile (use profile), real (system), disabled (off)
--bot-config-webrtc=profile                   # WebRTC: profile (use profile), real (native), disabled (off)
--bot-config-webrtc-ice=google                # ICE servers: google preset or custom:stun:host:port,turn:host
--bot-config-window=profile                   # Window dimensions: profile (use profile), real (system window)
--bot-config-media-types=expand               # Media types: expand (default), profile, real
--bot-config-mobile-force-touch=false         # Mobile touch: force touch events on/off for mobile device simulation
```

> **Note — UA/Engine Congruence:** For `--bot-config-ua-full-version`, use a value that matches the Chromium major version in your build, and keep brands/`userAgentData` aligned to avoid fingerprint mismatches.

### Key Benefits of CLI Configuration Flags

- **Highest Priority:** Overrides profile settings
- **No Profile Editing:** Avoid changing encrypted JSON
- **Dynamic Configuration:** Perfect for automation and CI/CD
- **Session Isolation:** Different settings per instance

### Spotlight: BotBrowser v142 20251031 Additions

- **Chromium 142.0.7444.60 base** — aligns rendering, networking, and security surfaces with the current Chrome stable channel.
- **`--bot-config-disable-console-message`** — silences console output to keep CDP logging noise out of page scripts and production logs.
- **`--bot-config-fonts=expand`** — loads supplemental system fonts when profiles lack coverage to improve authenticity while keeping profile baselines.

### Configuration Priority

1. **🥇 CLI `--bot-config-*` flags** (Highest priority)
2. **🥈 Profile `configs` settings** (Medium priority)
3. **🥉 Profile default values** (Lowest priority)

---

## 📝 Usage Examples

### Basic BotBrowser Setup
```bash
# Essential BotBrowser flags only
chromium-browser \
  --bot-profile="/absolute/path/to/chrome139_win11_x64.enc" \
  --bot-title="My Session"
```

### Multiple Instances with Session Management
```bash
# Instance 1 with cookies and bookmarks
chromium-browser \
  --bot-profile="/absolute/path/to/profile1.enc" \
  --bot-title="Account 1" \
  --bot-cookies='[{"name":"sessionid","value":"abc123","domain":".example.com"}]' \
  --bot-bookmarks='[{"title":"Work Site","url":"https://work.com","type":"url"}]' \
  --user-data-dir="/tmp/bot1" &

# Instance 2 with different profile
chromium-browser \
  --bot-profile="/absolute/path/to/profile2.enc" \
  --bot-title="Account 2" \
  --user-data-dir="/tmp/bot2" &
```

### Automation with Proxy Authentication
```bash
# Using BotBrowser's enhanced proxy with embedded credentials
chromium-browser \
  --bot-profile="/absolute/path/to/chrome139_win11_x64.enc" \
  --proxy-server="http://myuser:mypass@proxy.example.com:8080" \
  --remote-debugging-port=9222
```

### Configuration Override Examples
```bash
# Only override when you need specific settings (timezone/locale auto-detected)
chromium-browser \
  --bot-profile="/absolute/path/to/chrome139_win11_x64.enc" \
  --bot-config-browser-brand="edge" \
  --bot-config-webgl="disabled" \
  --bot-config-noise-canvas=true \
  --bot-title="Custom Session"
```

### Active Window + Custom ICE Setup
```bash
# Keep tabs active while routing WebRTC through explicit ICE servers
chromium-browser \
  --bot-profile="/absolute/path/to/chrome141_win11_x64.enc" \
  --bot-config-always-active=true \
  --bot-config-webrtc-ice="custom:stun:stun.l.google.com:19302,turn:turn.example.com" \
  --bot-config-media-types="expand"
```

### Dynamic Multi-Instance Setup
```bash
# Instance 1 - Chrome brand with profile window settings
chromium-browser \
  --bot-profile="/absolute/path/to/profile.enc" \
  --bot-config-browser-brand="chrome" \
  --bot-config-window="profile" \
  --user-data-dir="/tmp/instance1" &

# Instance 2 - Edge brand with real window settings
chromium-browser \
  --bot-profile="/absolute/path/to/profile.enc" \
  --bot-config-browser-brand="edge" \
  --bot-config-window="real" \
  --user-data-dir="/tmp/instance2" &
```

### Comprehensive Testing Configuration Example
```bash
# All BotBrowser features combined with CLI configuration
chromium-browser \
  --no-sandbox \
  --headless \
  --bot-profile="/absolute/path/to/chrome139_win11_x64.enc" \
  --bot-title="Production Bot" \
  --bot-cookies='[{"name":"auth","value":"token123","domain":".site.com"}]' \
  --proxy-server="http://user:pass@proxy.example.com:8080" \
  --bot-config-browser-brand="chrome" \
  --bot-config-timezone="auto" \
  --bot-config-webgl="profile" \
  --bot-config-noise-canvas=true \
  --bot-config-noise-webgl-image=true \
  --user-data-dir="$(mktemp -d)" \
  --remote-debugging-port=9222
```

---

## 🔗 Related Documentation

- [📚 Profile Configuration Guide](profiles/PROFILE_CONFIGS.md) - Configure browser behavior via profiles
- [📖 Main README](README.md) - General usage and standard Chromium flags
- [🎭 Examples](examples/) - Playwright and Puppeteer integration examples
- [🐳 Docker Deployment](docker/README.md) - Container deployment guides

---

## 💡 Tips & Best Practices

### BotBrowser-Specific Considerations

Configuration priority — CLI `--bot-config-*` flags override profile `configs`.

Session management — use `--bot-title` to identify instances.

Cookie persistence — `--bot-cookies` helps maintain state across restarts.

Realistic browsing — `--bot-bookmarks` adds authenticity.

Proxy authentication — embed credentials directly in the proxy URL.

---

> 💡 **Need Help?** Check our [Issues](https://github.com/botswin/BotBrowser/issues) or contact support at [botbrowser@bk.ru](mailto:botbrowser@bk.ru)

> 📘 **Note:** This document covers BotBrowser-specific flags only. For standard Chromium flags (like `--headless`, `--no-sandbox`, `--user-data-dir`, etc.), refer to the [Chromium command line documentation](https://peter.sh/experiments/chromium-command-line-switches/).

---

**📋 [Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md)** • **[Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)** — BotBrowser is for authorized fingerprint-consistency testing and research only.
