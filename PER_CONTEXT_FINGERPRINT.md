# Per-Context Fingerprint (ENT Tier3)

Run multiple independent fingerprint identities within a single browser instance. Shared GPU/Network/Browser processes. Reduced resource overhead.

## The Problem

Traditional approaches require launching a separate browser instance for each fingerprint profile. This architecture has significant overhead due to Chromium's multi-process design.

**Chromium Process Architecture**

Each browser instance spawns multiple processes:

| Process | Function |
|---------|----------|
| Browser process | Main coordinator, UI, profile management |
| GPU process | Graphics API calls, compositing, hardware acceleration |
| Network process | HTTP/HTTPS requests, DNS resolution, WebSocket |
| Utility processes | Audio, video decoding, extension services |
| Renderer processes | Web page execution, JavaScript, DOM |

Running 50 browser instances means 50 GPU processes, 50 Network processes, and 50+ Utility processes, in addition to the renderer processes.

**Process Startup Cost**
- Each browser instance requires full initialization: loading shared libraries, spawning GPU/Network/Utility processes, initializing the JavaScript engine, and establishing IPC channels
- Disk I/O spikes occur as each instance reads profile data, cache structures, and font resources from storage
- CPU-intensive work happens during V8 isolate creation, Blink initialization, and compositor setup

**Per-Instance Resource Duplication**
- GPU process: shader cache, command buffers, GPU memory allocation duplicated per instance
- Network process: connection pools, DNS cache, certificate cache duplicated per instance
- Each instance maintains its own JavaScript VM heap (typically 64-128 MB minimum)
- Internal caches (HTTP cache, font cache) cannot be shared across instances

**Scaling Limitations**
- Running 50 profiles means 50 browser instances with 200+ total processes
- CPU load scales with process count due to duplicated background tasks (garbage collection, network polling, GPU command processing)
- OS scheduler overhead increases with process count

## The Solution

Per-Context Fingerprint assigns a complete fingerprint bundle to each BrowserContext within a single browser instance. One browser process, one GPU process, one Network process, serving multiple fingerprint identities.

**Shared Process, Isolated Fingerprint**

BotBrowser modifies Chromium's shared processes to be fingerprint-aware:

| Shared Process | Per-Context Isolation |
|----------------|----------------------|
| GPU process | Canvas/WebGL/WebGPU noise applied per-context |
| Network process | Proxy routing, IP detection per-context |
| Audio service | AudioContext noise seed per-context |
| Browser process | Timezone, locale, screen metrics per-context |

Each context operates with its own:

- Profile file (via `--bot-profile`)
- User-Agent and userAgentData
- Device model and platform
- Screen resolution and color depth
- Timezone, locale, and languages
- Canvas/WebGL/Audio noise seeds
- Proxy configuration and public IP
- Most `--bot-*` CLI flags (see [Supported Flags](#supported-flags))

Contexts are isolated within BotBrowser's fingerprint model. Pages in Context A cannot detect or influence the fingerprint of Context B. The shared GPU/Network/Utility processes route fingerprint-specific data to the correct context.

## Why Per-Context Outperforms Multi-Instance

| Resource | Multi-Instance (50 profiles) | Per-Context (50 contexts) |
|----------|------------------------------|---------------------------|
| Browser processes | 50 | 1 |
| GPU processes | 50 | 1 |
| Network processes | 50 | 1 |
| Utility processes | 50+ | Shared |
| Renderer processes | 50+ | 50+ |
| **Total process count** | **200+** | **~55** |
| Browser startup I/O | 50x (shared libs, GPU init) | 1x |
| Add new identity | 1-3s (launch browser) | Fast (create context) |

Renderer processes scale with page count in both approaches. The key savings come from sharing GPU, Network, Browser, and Utility processes across all contexts.

## Worker Inheritance

Workers created within a BrowserContext automatically inherit that context's fingerprint:

- **Dedicated Workers**: Inherit parent context fingerprint
- **Shared Workers**: Inherit parent context fingerprint
- **Service Workers**: Inherit parent context fingerprint

No additional configuration needed. Fingerprint consistency is maintained across main thread, workers, and all execution contexts.

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

// Navigate with the unique fingerprint
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

Pass the proxy via context creation options, and set `--proxy-ip` via CDP to skip IP lookups.

> **Note**: Puppeteer uses `proxyServer`, Playwright uses `proxy: { server }`. See [examples/](examples/) for framework-specific syntax.

```javascript
// Puppeteer example
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

### Per-Context Proxy via botbrowserFlags

Configure proxy and other settings together through `botbrowserFlags`:

```javascript
// Context 1: US proxy via botbrowserFlags
const ctx1 = await browser.createBrowserContext();
const page1 = await ctx1.newPage();
const client1 = await page1.createCDPSession();
await client1.send('BotBrowser.setBrowserContextFlags', {
  browserContextId: ctx1._contextId,
  botbrowserFlags: [
    '--bot-profile=/path/to/profile.enc',
    '--proxy-server=socks5://user:pass@us-proxy.example.com:1080',
    '--proxy-ip=203.0.113.1',
    '--bot-config-timezone=America/Chicago'
  ]
});

// Context 2: UK proxy via botbrowserFlags
const ctx2 = await browser.createBrowserContext();
const page2 = await ctx2.newPage();
const client2 = await page2.createCDPSession();
await client2.send('BotBrowser.setBrowserContextFlags', {
  browserContextId: ctx2._contextId,
  botbrowserFlags: [
    '--bot-profile=/path/to/profile.enc',
    '--proxy-server=socks5://user:pass@uk-proxy.example.com:1080',
    '--proxy-ip=198.51.100.1',
    '--bot-config-timezone=Europe/London'
  ]
});

// Both contexts run with different proxies and settings
await Promise.all([
  page1.goto('https://example.com'),
  page2.goto('https://example.com')
]);
```

You can now configure proxy directly in `botbrowserFlags` without using `createBrowserContext({ proxyServer })`. This provides unified configuration for proxy and other per-context settings in a single call.

> **Tip:** Need to switch proxies at runtime without restarting a context? See [Dynamic Proxy Switching (ENT Tier2)](ADVANCED_FEATURES.md#dynamic-proxy-switching) in Advanced Features.

## Supported Flags

Most `--bot-*` flags from [CLI_FLAGS.md](CLI_FLAGS.md) work with per-context configuration. Browser-level exceptions are noted in [Important Notes](#important-notes).

| Category | Example Flags |
|----------|---------------|
| Profile | `--bot-profile` (load a completely different profile per context) |
| Noise Seed | [`--bot-noise-seed`](CLI_FLAGS.md#behavior--protection-toggles) for deterministic fingerprint variance |
| Timing | [`--bot-time-scale`](CLI_FLAGS.md#behavior--protection-toggles) for performance timing control, [`--bot-fps`](CLI_FLAGS.md#behavior--protection-toggles) for frame rate control |
| WebRTC | [`--bot-webrtc-ice`](ADVANCED_FEATURES.md#webrtc-leak-protection) for ICE endpoint control |
| Window | [`--bot-always-active`](ADVANCED_FEATURES.md#active-window-emulation) to maintain active window state |
| Session | `--bot-inject-random-history` for session authenticity |
| Proxy | [`--proxy-server`](CLI_FLAGS.md#enhanced-proxy-configuration) (configure proxy per-context via `botbrowserFlags`), `--proxy-ip` to skip IP lookups |
| HTTP | [`--bot-custom-headers`](CLI_FLAGS.md#--bot-custom-headers-pro) for custom HTTP request headers per context |
| Config | [`--bot-config-platform`, `--bot-config-timezone`, `--bot-config-noise-canvas`, etc.](CLI_FLAGS.md#profile-configuration-override-flags) |

See [CLI_FLAGS.md](CLI_FLAGS.md) for the complete flag reference.

## Use Cases

**Privacy Research at Scale**
- Run fingerprint protection validation across multiple configurations simultaneously
- Compare behavior across different platform/locale combinations
- Study tracking mechanisms with controlled, isolated contexts

**Cross-Platform Testing**
- Validate application behavior across different platform fingerprints
- Test localization across multiple locales in parallel
- Verify responsive behavior across device configurations

**Resource-Efficient Automation**
- Reduce infrastructure costs by consolidating browser instances
- Scale research capacity on CPU-limited environments (VPS, containers)
- Enable high-concurrency scenarios previously blocked by resource constraints

## Important Notes

⚠️ Per-context proxy via `botbrowserFlags` or `createBrowserContext` must be set before navigation. To switch proxies at runtime, use `BotBrowser.setBrowserContextProxy` (ENT Tier2). See [Dynamic Proxy Switching](ADVANCED_FEATURES.md#dynamic-proxy-switching).

⚠️ Some network-layer settings ([`--bot-local-dns`](CLI_FLAGS.md#--bot-local-dns-ent-tier1), UDP proxy support) apply at the browser level and cannot be configured per-context.

⚠️ Each context can load a completely different profile (`--bot-profile`), or use `--bot-config-*` flags to override specific settings from the browser's base profile.

## Related Documentation

- [CLI Flags Reference](CLI_FLAGS.md)
- [Advanced Features](ADVANCED_FEATURES.md)
- [Profile Configuration](profiles/PROFILE_CONFIGS.md)
- [Examples](examples/)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
