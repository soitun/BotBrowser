# BotBrowser Profiles

Academic Framework for Browser‑Environment Simulation.

In BotBrowser, everything starts with a profile. Research consistency and compatibility depend on proper profile configuration. Profiles are provided to authorized researchers, so review the project [Legal Disclaimer](DISCLAIMER.md) and [Responsible Use Guidelines](RESPONSIBLE_USE.md) for access policies.

## What Are Profiles?

Profiles are encrypted files that define the complete environment a browser instance should emulate. They include:

- **Browser fingerprint** information (user agent, WebGL, screen size)
- **System-level settings** (proxy, timezone, language, window size)
- **Hardware emulation** (device memory, CPU architecture, screen properties)
- **Platform simulation** (Android behavior, OS-specific features)

### Cross‑Platform Compatibility

**BotBrowser capability:** Profile compatibility across host systems (Windows, macOS, Android, Ubuntu) for comparative analysis.

By using profiles, BotBrowser launches controlled sessions that simulate consistent device behavior across different operating systems for academic research and compatibility testing.

**💡 Profile = controlled research‑environment configuration**

## Understanding BotBrowser Profiles

**Important:** BotBrowser profiles work differently than typical browser‑fingerprinting tools.

### What BotBrowser Profiles Actually Are
**Device Models**: think of them as specific hardware configurations.

**Real‑World Analogy**
- Profile = "MacBook Pro M4 Max" (the device type)
- You can simulate User A in USA using this "M4 Max" profile
- You can simulate User B in Europe using the same "M4 Max" profile
- Same device hardware, but different users and environments

### How Profiles Work
- **Profile defines the device fingerprint** (hardware, browser capabilities)
- **Environment settings differentiate users** (proxy, timezone, language, cookies)
- **Each session can have unique characteristics** while maintaining device consistency

**Example:** Using a “MacBook Pro M3” profile:
- User A: US proxy + English + EST timezone
- User B: Germany proxy + German + CET timezone
- User C: Japan proxy + Japanese + JST timezone

All appear as different users on the same device type.

## ⚠️ Profile Types

### 🚨 Demo Profiles (Educational Testing Only)

**Limitations**
- Limited-time educational testing only
- No headless mode support
- No automation framework connection
- No extension loading
- **Not suitable for production research** (widely distributed and may be flagged)

### Premium Profiles (Academic Use)

**Features:**
- Unique configurations for controlled studies
- Privacy-compliant synthetic data
- Based on aggregated device/browser patterns
- Suitable for authorized academic research

### Access Premium Profiles

For academic institutions and authorized research:

| Contact Method | Link |
|----------------|------|
| 📧 Email | [botbrowser@bk.ru](mailto:botbrowser@bk.ru) |
| 📱 Telegram | [@botbrowser_support](https://t.me/botbrowser_support) |

Premium profiles are available to qualified academic institutions with proper ethical approvals.

---

## Using Profiles

### CLI Usage

```bash
chromium --no-sandbox --bot-profile="/absolute/path/to/profile.enc"
```

**⚠️ Version Compatibility**
- BotBrowser binary version must match profile version
- Example: BotBrowser v139 only supports v139 profiles
- Use absolute paths if relative paths fail to load

> 📖 **For all available CLI flags**, see [⚙️ CLI Flags Reference](../CLI_FLAGS.md)

### Automation Framework Integration

**[Playwright](examples/playwright) / [Puppeteer](examples/puppeteer) Example:**

```javascript
const browser = await chromium.launch({
  headless: true,
  executablePath: BOTBROWSER_EXEC_PATH,
  args: [
    '--no-sandbox',
    `--bot-profile=${BOT_PROFILE_PATH}`,
    // ⚠️ PROXY CONFIGURATION:
    // Use --proxy-server flag instead of framework-specific proxy options
    // This ensures BotBrowser can retrieve geo information for accurate timezone/locale
    '--proxy-server="socks5://usr:pwd@127.0.0.1:8989"',
  ],
});

const page = await browser.newPage();

// Remove Playwright's bindings for clean research environment.
await page.addInitScript(() => {
  delete window.__playwright__binding__;
  delete window.__pwInitScripts;
});

await page.goto("https://abrahamjuliot.github.io/creepjs/");
```

⚠️ Important: With automation frameworks (Puppeteer/Playwright), use the `--proxy-server` flag instead of framework‑specific proxy options (like `page.authenticate()` or a `proxy` parameter in `launch()`). This ensures BotBrowser can derive accurate timezone/locale from the proxy IP.


---

## Configuration Approaches

### Profile‑Based Configuration
- **Purpose**: Stores authentic user fingerprints and base settings
- **When to use**: For core browser identity and fingerprint data
- **Limitation**: Encrypted files are difficult to modify

### CLI‑Based Configuration
- **Purpose**: Runtime overrides without modifying profile files
- **When to use**: For session-specific settings like proxy, title, cookies
- **Advantage**: Preserves profile integrity while enabling flexibility

### Best Practice: Hybrid Approach
```bash
# Keep profile data in profile
# Override session-specific settings via CLI
chromium --no-sandbox \
  --bot-profile="/absolute/path/to/profile.enc" \
  --proxy-server="session_specific_proxy" \
  --bot-title="current_session_id"
```

## Why CLI Flags Matter
- **Preserve Integrity:** Don't modify profile data
- **Runtime Flexibility:** Adjust settings per session without file edits
- **Session Isolation:** Multiple instances with different settings
- **Security:** Keep sensitive data (like proxy credentials) out of profile files

📖 For complete CLI flags documentation, see [⚙️ CLI Flags Reference](../CLI_FLAGS.md)

👉 **See [`PROFILE_CONFIGS.md`](https://github.com/botswin/BotBrowser/blob/main/profiles/PROFILE_CONFIGS.md) for complete configuration options.**

---

## Key Features

### Unique Capabilities

⚠️ **All features are intended for compatibility testing and academic research only, not for use in production against third-party services.**

- [x] **Provides compatibility in incognito-mode environments**
- [x] **CDP artifact minimization**: native CDP fingerprint consistency
- [x] **Custom page history**: enhance browsing pattern realism
- [x] **Keep pages active** even when they lose focus
- [x] **Set proxy with embedded credentials directly via profile**
- [x] **Set language and timezone** based on proxy or manually
- [x] **WebRTC configuration control**
- [x] **Canvas / WebGL noise injection** for consistency
- [x] **Audio fingerprinting variation**
- [x] **Control scroll bar width**
- [x] **Supports CDM compatibility** (no proprietary modules distributed)
- [x] **Customizable remote-debugging-address** (bind to 0.0.0.0)
- [x] **Full window/screen size control via profile**
- [x] **Advanced matchMedia simulation** for CSS feature compatibility
- [x] **Android behavior simulation** for mobile compatibility
- [x] **Precision GPU and WebGL parameter configuration**

---

## Fingerprint Coverage

| Category | Covered Elements |
|----------|------------------|
| **Browser** | Version, userAgentData, userAgent |
| **Operating System** | Windows, macOS, Ubuntu, Android simulation |
| **Navigator** | Languages, plugins, permissions, battery, keyboard |
| **Graphics** | WebGL, WebGL2, GPUAdapter, GPUDevice |
| **Hardware** | Screen, CPU, system fonts, system colors |
| **Media** | MediaDevices, MimeTypes, AudioContext |
| **Advanced** | Emoji, Unicode, matchMedia control |

## Best Practices

- **Use Premium Profiles** for production traffic
- **Configure realistic settings** (screen size, devicePixelRatio, proxy)
- **Choose appropriate profiles** (Android for mobile operations)
- **Keep profiles updated** with the latest Chrome versions
- **Test thoroughly** before production deployment

---

**📋 [Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md)** • **[Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint-consistency testing and research only.
