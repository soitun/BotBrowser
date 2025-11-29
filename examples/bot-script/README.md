# 🔬 BotBrowser Script Automation Examples

Framework‑less automation using BotBrowser’s native `--bot-script` feature.

These examples assume an authorized research environment. Review the project [Legal Disclaimer](../../DISCLAIMER.md) and [Responsible Use Guidelines](../../RESPONSIBLE_USE.md) before adapting them to your own lab.

## What Is `--bot-script`?

`--bot-script` executes JavaScript in a privileged, non‑extension context where the `chrome.debugger` API is available. This provides:

- **No framework dependencies** - Pure Chrome DevTools Protocol access
- **Earlier intervention** - Execute before page navigation
- **Privileged context** - Full `chrome.debugger` API access
- **Reduced detection surface** - No Playwright/Puppeteer artifacts

## Usage

```bash
chrome.exe --no-sandbox --bot-profile="C:\\absolute\\path\\to\\profile.enc" --bot-script="your-script.js"
```

## Examples

### Cloudflare Turnstile Automation
**File:** `cloudflare-turnstile.js`

Demonstrates automated handling of Cloudflare Turnstile challenges using:
- `chrome.debugger.getTargets()` - Find challenge frames
- `chrome.debugger.attach()` - Attach to targets
- `chrome.debugger.sendCommand()` - Send CDP commands
- Mobile device detection and touch event emulation
- Direct coordinate clicking

**Usage:**
```bash
chrome.exe --no-sandbox --bot-profile="C:\\absolute\\path\\to\\profile.enc" --bot-script="cloudflare-turnstile.js"
```

## Key APIs Available

Because scripts run in a privileged context, you have access to:

- **`chrome.debugger`** - Full Chrome DevTools Protocol access
- **`chrome.runtime`** - Runtime APIs
- Standard browser APIs (console, setTimeout, etc.)

## Best Practices

1. Error handling: always check `chrome.runtime.lastError`
2. Target management: track active targets to avoid duplicates
3. Resource cleanup: detach from the debugger when done
4. Timing control: use appropriate delays between actions

## Behavior Recipes (Human‑Like Interaction)

**Mouse movement (CDP)**
```js
// Minimal example: smooth cursor path with jitter
const path = [{x:100,y:200},{x:140,y:220},{x:180,y:230},{x:220,y:240}];
for (const p of path) {
  await chrome.debugger.sendCommand({tabId}, 'Input.dispatchMouseEvent', {
    type: 'mouseMoved', x: p.x + Math.random()*0.7, y: p.y + Math.random()*0.7,
    modifiers: 0, buttons: 0
  });
  await new Promise(r => setTimeout(r, 12 + Math.random()*18));
}
```

**Typing cadence (CDP)**
```js
const text = 'hello world';
for (const ch of text) {
  await chrome.debugger.sendCommand({tabId}, 'Input.insertText', { text: ch });
  await new Promise(r => setTimeout(r, 35 + Math.random()*45));
}
```

**Scrolling pattern (CDP)**
```js
// Wheel events with easing
for (let i = 0; i < 20; i++) {
  await chrome.debugger.sendCommand({tabId}, 'Input.dispatchMouseEvent', {
    type: 'mouseWheel', x: 400, y: 300, deltaY: 60 + Math.sin(i/3)*10
  });
  await new Promise(r => setTimeout(r, 30 + Math.random()*30));
}
```

## 📖 Documentation

📖 **Chrome Debugger API:** https://developer.chrome.com/docs/extensions/reference/api/debugger/

📖 **Chrome DevTools Protocol:** https://chromedevtools.github.io/devtools-protocol/

---

**📋 [Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md)** • **[Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint-consistency testing and research only.
