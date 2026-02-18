# CanvasLab: Canvas Forensics for Privacy Protection (Beta)

See what tracking code is doing when it tries to fingerprint users through Canvas and WebGL. Record every API call so you know what you're defending against.

---

## What Is CanvasLab?

CanvasLab records every Canvas and WebGL API call so you can see exactly what tracking code is trying to do. When you capture these recordings, you can study the tracking techniques and make sure BotBrowser's privacy protections are working against them.

- **See what trackers do** – watch every Canvas API call they make and understand their techniques
- **Test your defenses** – verify that BotBrowser's protections actually stop the tracking attempts
- **Check protection** – make sure privacy defenses work the same across Windows, macOS, and Linux
- **Understand the threat** – know exactly what you're protecting users from

---

## Try It Now

> **[▶️ Launch Live Replay Viewer](https://botswin.github.io/BotBrowser/tools/canvaslab/canvas_replay_viewer.html?jsonl=https://botswin.github.io/BotBrowser/tools/canvaslab/canvas_2d_simple_test_record.jsonl)**: Interactive demo preloaded with sample JSONL. Scrub through events, view generated code with source locations, and watch canvas rendering in slow motion!

### Demo Resources

| Resource | Description |
|----------|-------------|
| **[Sample Scene](../../docs/tools/canvaslab/canvas_2d_simple_test.html)** | Load it in BotBrowser, trigger the drawing routines, and create your own recording |
| **[Sample JSONL](../../docs/tools/canvaslab/canvas_2d_simple_test_record.jsonl)** | Reuse the hosted file or swap the `?jsonl=` query with your own URL |

---

## Current Development Status

| Component | Status | Timeline |
|-----------|--------|----------|
| **Canvas 2D Recording** | **Shipped** | Production-ready with full API coverage |
| **Canvas 2D Browser Replay** | **In Development** | Target: 2026 Q1 |
| **WebGL Recording** | **In Development** | Target: 2026 Q1 |
| **WebGL Browser Replay** | **Planned** | Post-Q1 2026 |

**What's shipped now:**
- Canvas 2D recording with complete API coverage and call stack tracking
- HTML-based event viewer for forensic analysis with source location mapping

**What's coming in Q1 2026:**
- Canvas 2D replay in BotBrowser (read JSONL and reconstruct canvas operations to restore hash)
- WebGL recording with shader and texture capture

---

## Quick Start: Recording Tracking Attempts

**Step 1: Start recording** (see [`--bot-canvas-record-file`](../../CLI_FLAGS.md#--bot-canvas-record-file))
```bash
chromium \
  --bot-profile=/absolute/path/to/profile.enc \
  --bot-canvas-record-file=/tmp/canvaslab.jsonl \
  --user-data-dir="$(mktemp -d)"
```

**Step 2: Visit a site and let tracking happen**
Go to the website you want to study. Let it load normally—CanvasLab will record every Canvas API call the tracking code makes.

**Step 3: Look at what was recorded**
Close BotBrowser. Your recording is saved to `/tmp/canvaslab.jsonl`. You can now see exactly what Canvas calls the tracking code tried to make.

---

## Recording Format & Capabilities

### Event Types

| Event Type | Description | Example Methods |
|------------|-------------|-----------------|
| **`canvas_init`** | Canvas creation and initial sizing | Canvas element creation, dimensions |
| **`context_create`** | Context initialization with attributes | `getContext('2d')` with options |
| **`state`** | Property setters and style changes | `fillStyle`, `lineWidth`, `font`, `shadowBlur` |
| **`draw`** | Drawing and transformation operations | `fillRect`, `drawImage`, `transform`, `arc` |
| **`read`** | Data extraction and measurements | `getImageData`, `toBlob`, `measureText` |
| **`resize`** | Canvas dimension changes | `canvas.width/height` modifications |

> **Note:** Every API call includes the source location (URL, line, column) so you can find exactly which tracking library made each call.

### What Gets Recorded

**Complete parameter capture:**
- Primitive values (numbers, strings, booleans)
- Complex objects serialized by content:
  - `ImageData` → base64 pixels + dimensions
  - `Path2D` → command sequence arrays
  - `DOMMatrix` → 6-element transforms
  - `CanvasGradient` → ID + color stops
  - Image sources → type + metadata

**Full return values:**
- Synchronous returns (`getImageData`, `measureText`)
- Callback results (`toBlob`)
- Promise resolutions (`OffscreenCanvas.convertToBlob`)

**Execution context:**
- Sequence numbers, timestamps, thread IDs
- Canvas IDs for multi-canvas scenarios
- Worker/offscreen canvas support

**Source code information:**
- Where every Canvas API call came from (URL, line, column)
- What function names are involved
- Which tracking libraries made which API calls
- Everything you need to understand what tracking code is trying to do

**Example event with caller:**
```json
{
  "type": "state",
  "property": "fillStyle",
  "value": "#ff0000",
  "caller": {
    "url": "https://example.com/fingerprint.js",
    "line": 42,
    "column": 16
  }
}
```

---

## Use Cases

| Scenario | How CanvasLab Helps |
|----------|---------------------|
| **Privacy Defense Development** | See how trackers try to fingerprint users through Canvas and build stronger protections against it |
| **Tracking Analysis** | Document exactly what Canvas API calls tracking code makes so you know what to defend against |
| **Source Code Attribution** | Find which tracking libraries are calling which Canvas APIs by looking at source locations |
| **Privacy Protection Validation** | Make sure BotBrowser's defenses work the same way on all platforms—Windows, macOS, Linux |
| **Privacy Testing** | Verify that privacy protections keep working after BotBrowser updates |
| **Privacy Research** | Study real-world tracking techniques with complete records and source information for fingerprint protection research |

---

## What's Coming in Q1 2026

### Canvas 2D Browser Replay (In Development)
Load your JSONL recordings back into BotBrowser to test privacy protections:
- **Verify privacy protection** – replay tracking code's Canvas calls and see if BotBrowser blocks them correctly
- **Cross-platform testing** – check that privacy works the same on Windows, macOS, and Linux
- **Ongoing validation** – make sure each BotBrowser update keeps privacy protections working

### WebGL Recording (In Development)
Capture WebGL/WebGL2 tracking attempts the same way we capture Canvas:
- Record every WebGL API call so we know what tracking code is doing
- Capture shader programs to see how trackers try to fingerprint through GPU operations
- Document texture and buffer data for analysis
- View WebGL tracking attempts with the same forensic viewer we use for Canvas


---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
