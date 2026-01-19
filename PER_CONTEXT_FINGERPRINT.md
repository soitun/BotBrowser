# Per-Context Fingerprint (ENT Tier3)

Run multiple independent fingerprint identities in a single browser instance. No extra processes. No memory bloat. Millisecond switching.

## The Problem

Traditional approaches require launching a separate browser process for each fingerprint profile. Running 100 profiles means 100 browser processes, each consuming 200-500 MB of RAM. This limits scale, slows down research, and wastes resources.

## The Solution

Per-Context Fingerprint lets you assign a complete fingerprint bundle to each BrowserContext within a single browser instance. Each context operates with its own:

- User-Agent and userAgentData
- Device model and platform
- Screen resolution and color depth
- Timezone and locale
- Languages
- Canvas/WebGL/Audio noise seeds
- All other fingerprint parameters

Contexts are fully isolated. A page in Context A cannot detect or influence the fingerprint of Context B, even when running simultaneously in the same browser instance.

All [CLI flags](CLI_FLAGS.md) can be applied per-context, including `--bot-profile` to load entirely different profile files per context. This means you get the same flexibility as launching separate browser instances, but without the overhead.

## Why This Matters

| Metric | Traditional (100 profiles) | Per-Context (100 contexts) |
|--------|---------------------------|---------------------------|
| Processes | 100 | 1 |
| Memory | 20-50 GB | 2-4 GB |
| Startup time | Minutes | Milliseconds |
| Context switching | Process spawn | Instant |

For high-concurrency research scenarios, this changes what's possible.

## Worker Inheritance

Workers created within a BrowserContext automatically inherit that context's fingerprint:

- **Dedicated Workers**: Inherit parent context fingerprint
- **Shared Workers**: Inherit parent context fingerprint
- **Service Workers**: Inherit parent context fingerprint

No additional configuration needed. The fingerprint stays consistent across main thread, workers, and all execution contexts.

## Quick Start

### Via CDP (Runtime Configuration)

Configure fingerprint flags on an existing BrowserContext:

```javascript
const puppeteer = require('puppeteer-core');

const browser = await puppeteer.launch({
  executablePath: '/path/to/botbrowser',
  args: ['--bot-profile=/path/to/base-profile.enc']
});

// Create a new browser context
const context = await browser.createBrowserContext();

// Get CDP session for the context
const page = await context.newPage();
const client = await page.createCDPSession();

// Set per-context fingerprint flags
// Load a different profile and customize locale settings
await client.send('BotBrowser.setBrowserContextFlags', {
  browserContextId: context._contextId,
  botbrowserFlags: [
    '--bot-profile=/path/to/android-profile.enc',
    '--bot-config-timezone=Asia/Tokyo',
    '--bot-config-languages=ja-JP,en-US',
    '--bot-config-locale=ja-JP'
  ]
});

// Navigate and use the context with its unique fingerprint
await page.goto('https://example.com');
```

### Via Target.createBrowserContext

Pass fingerprint flags when creating the context:

```javascript
const client = await browser.target().createCDPSession();

const { browserContextId } = await client.send('Target.createBrowserContext', {
  botbrowserFlags: [
    '--bot-profile=/path/to/windows-profile.enc',
    '--bot-config-timezone=America/New_York',
    '--bot-config-languages=en-US'
  ]
});

const { targetId } = await client.send('Target.createTarget', {
  url: 'about:blank',
  browserContextId
});
```

### Multiple Contexts Example

```javascript
// Context 1: Windows profile with US location
const ctx1 = await browser.createBrowserContext();
const page1 = await ctx1.newPage();
const client1 = await page1.createCDPSession();
await client1.send('BotBrowser.setBrowserContextFlags', {
  browserContextId: ctx1._contextId,
  botbrowserFlags: [
    '--bot-profile=/path/to/windows-profile.enc',
    '--bot-config-timezone=America/Chicago',
    '--bot-config-languages=en-US'
  ]
});

// Context 2: macOS profile with UK location
const ctx2 = await browser.createBrowserContext();
const page2 = await ctx2.newPage();
const client2 = await page2.createCDPSession();
await client2.send('BotBrowser.setBrowserContextFlags', {
  browserContextId: ctx2._contextId,
  botbrowserFlags: [
    '--bot-profile=/path/to/macos-profile.enc',
    '--bot-config-timezone=Europe/London',
    '--bot-config-languages=en-GB'
  ]
});

// Both contexts run simultaneously with completely different fingerprints
await Promise.all([
  page1.goto('https://example.com'),
  page2.goto('https://example.com')
]);
```

### Per-Context Proxy with Known IP

When you know the proxy's public IP, use `--proxy-ip` to skip IP lookups and speed up navigation. Pass the proxy via context creation options, and set `--proxy-ip` via CDP:

```javascript
// Context 1: US proxy with known IP
const ctx1 = await browser.createBrowserContext({
  proxyServer: 'socks5://user:pass@us-proxy.example.com:1080'
});
const page1 = await ctx1.newPage();
const client1 = await page1.createCDPSession();
await client1.send('BotBrowser.setBrowserContextFlags', {
  browserContextId: ctx1._contextId,
  botbrowserFlags: [
    '--bot-profile=/path/to/profile.enc',
    '--proxy-ip=203.0.113.1'
  ]
});

// Context 2: UK proxy with known IP
const ctx2 = await browser.createBrowserContext({
  proxyServer: 'socks5://user:pass@uk-proxy.example.com:1080'
});
const page2 = await ctx2.newPage();
const client2 = await page2.createCDPSession();
await client2.send('BotBrowser.setBrowserContextFlags', {
  browserContextId: ctx2._contextId,
  botbrowserFlags: [
    '--bot-profile=/path/to/profile.enc',
    '--proxy-ip=198.51.100.1'
  ]
});

// All contexts navigate without IP lookup overhead
// BotBrowser derives timezone and locale from the provided proxy IP
await Promise.all([
  page1.goto('https://example.com'),
  page2.goto('https://example.com')
]);
```

## Supported Flags

All `--bot-*` flags from [CLI_FLAGS.md](CLI_FLAGS.md) are supported for per-context configuration:

| Category | Example Flags |
|----------|---------------|
| Profile | `--bot-profile` (load a completely different profile per context) |
| Noise Seed | `--bot-noise-seed` (ENT Tier2) for deterministic fingerprint variance |
| Timing | `--bot-time-scale` (ENT Tier2) for performance timing control |
| WebRTC | `--bot-webrtc-ice` (ENT Tier1) for ICE endpoint control |
| Window | `--bot-always-active` (PRO) to maintain active window state |
| Session | `--bot-inject-random-history` (PRO) for session authenticity |
| Proxy | `--proxy-ip` to skip IP lookups when proxy is known |
| Config | `--bot-config-platform`, `--bot-config-timezone`, `--bot-config-noise-canvas`, etc. |

See [CLI_FLAGS.md](CLI_FLAGS.md) for the complete list of flags.

## Use Cases

**Privacy Research at Scale**
- Run fingerprint protection validation across multiple configurations simultaneously
- Compare behavior across different platform/locale combinations
- Study tracking mechanisms with controlled, isolated contexts

**Cross-Platform Testing**
- Test how your application appears to users on different platforms
- Validate localization across multiple locales in parallel
- Verify responsive behavior across device configurations

**Resource-Efficient Automation**
- Reduce infrastructure costs by consolidating browser instances
- Scale research capacity without proportional memory increase
- Enable scenarios previously limited by resource constraints

## Important Notes

⚠️ Per-context proxy configuration requires the proxy to be set before navigation. The proxy cannot be changed after the first network request in a context.

⚠️ Some network-layer settings (`--bot-local-dns`, UDP proxy support) apply at the browser level and cannot be configured per-context.

⚠️ You can either load a completely different profile per context (`--bot-profile`), or use `--bot-config-*` flags to override specific settings from the browser's base profile.

## Related Documentation

- [CLI Flags Reference](CLI_FLAGS.md)
- [Advanced Features](ADVANCED_FEATURES.md)
- [Profile Configuration](profiles/PROFILE_CONFIGS.md)
- [Examples](examples/)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
