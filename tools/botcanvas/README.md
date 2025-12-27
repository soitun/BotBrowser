# BotCanvasLab (Beta): recording for all users; deterministic replay tooling forthcoming

Canvas 2D/WebGL tracking forensics for BotBrowser. Capture every API call as a JSONL event stream for analysis and future replay capabilities.

---

## What Is BotCanvas?

BotCanvas is a comprehensive canvas recording system that captures all Canvas 2D and WebGL API calls with complete parameter serialization. The recorded JSONL format enables:

- **Forensic analysis** – understand how tracking systems collect data so you can defend against it
- **Deterministic testing** – validate cross-platform consistency with identical API sequences
- **Hash reconstruction** – upcoming replay feature in BotBrowser will restore canvas operations from recordings to reproduce identical hashes

---

## Try It Now

> **[▶️ Launch Live Replay Viewer](https://botswin.github.io/BotBrowser/tools/botcanvas/canvas_replay_viewer.html?jsonl=https://botswin.github.io/BotBrowser/tools/botcanvas/canvas_2d_simple_test_record.jsonl)**: Interactive demo preloaded with sample JSONL. Scrub through events, view generated code with source locations, and watch canvas rendering in slow motion!

### Demo Resources

| Resource | Description |
|----------|-------------|
| **[Sample Scene](../../docs/tools/botcanvas/canvas_2d_simple_test.html)** | Load it in BotBrowser, trigger the drawing routines, and create your own recording |
| **[Sample JSONL](../../docs/tools/botcanvas/canvas_2d_simple_test_record.jsonl)** | Reuse the hosted file or swap the `?jsonl=` query with your own URL |

---

## Current Development Status

| Component | Status | Timeline |
|-----------|--------|----------|
| **Canvas 2D Recording** | ✅ **Shipped** | Production-ready with full API coverage |
| **Canvas 2D Browser Replay** | 🚧 **In Development** | Target: 2025 Q4 |
| **WebGL Recording** | 🚧 **In Development** | Target: 2025 Q4 |
| **WebGL Browser Replay** | 🔜 **Planned** | Post-Q4 2025 |

**What's shipped now:**
- ✅ Canvas 2D recording with complete API coverage and call stack tracking
- ✅ HTML-based event viewer for forensic analysis with source location mapping

**What's coming in Q4 2025:**
- 🚧 Canvas 2D replay in BotBrowser (read JSONL and reconstruct canvas operations to restore hash)
- 🚧 WebGL recording with shader and texture capture

---

## Quick Start: Recording Canvas 2D

**Step 1: Launch with recording enabled**
```bash
chromium \
  --no-sandbox \
  --bot-profile=/absolute/path/to/profile.enc \
  --bot-canvas-record-file=/tmp/botcanvas.jsonl \
  --user-data-dir="$(mktemp -d)"
```

**Step 2: Navigate and execute**
Visit your target site (or load a test scene) and trigger the canvas tracking workflow you want to analyze.

**Step 3: Collect results**
Exit BotBrowser. The complete recording is saved to `/tmp/botcanvas.jsonl` in structured JSONL format.

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

> **Note:** All events include `caller` information (source URL, line, column) for precise debugging and analysis.

### What Gets Recorded

✅ **Complete parameter capture:**
- Primitive values (numbers, strings, booleans)
- Complex objects serialized by content:
  - `ImageData` → base64 pixels + dimensions
  - `Path2D` → command sequence arrays
  - `DOMMatrix` → 6-element transforms
  - `CanvasGradient` → ID + color stops
  - Image sources → type + metadata

✅ **Full return values:**
- Synchronous returns (`getImageData`, `measureText`)
- Callback results (`toBlob`)
- Promise resolutions (`OffscreenCanvas.convertToBlob`)

✅ **Execution context:**
- Sequence numbers, timestamps, thread IDs
- Canvas IDs for multi-canvas scenarios
- Worker/offscreen canvas support

✅ **Call stack information:**
- Source location for every API call (`url:line:column`)
- Function name when available
- Direct mapping between canvas operations and source code
- Enables precise debugging and tracking technique analysis

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

| Scenario | How BotCanvas Helps |
|----------|---------------------|
| **Fingerprint Analysis** | Capture exact API sequences used by tracking libraries to build canvas hashes |
| **Source Code Mapping** | Trace every canvas operation back to its exact source location (`url:line:column`) for reverse engineering |
| **Cross-Platform Validation** | Record on one OS, verify identical API calls reproduce on another platform |
| **Regression Testing** | Baseline recordings ensure consistent fingerprint behavior across BotBrowser updates |
| **Research & Documentation** | Archive real-world tracking techniques with complete reproducibility and source attribution |

---

## What's Coming in Q4 2025

### Canvas 2D Browser Replay (In Development)
The ability to load JSONL recordings directly in BotBrowser and reconstruct canvas operations:
- **Hash reconstruction** – replay recorded canvas operations in BotBrowser to restore identical canvas hashes
- **Cross-platform validation** – verify fingerprint consistency by replaying recordings on different OS/hardware
- **Regression testing** – systematic comparison of canvas outputs across browser versions

### WebGL Recording (In Development)
Same JSONL-based event capture extended to WebGL/WebGL2:
- Complete API call recording with parameter serialization
- Shader program capture (source + compilation metadata)
- Texture and buffer data serialization
- Integration with existing HTML viewer for forensic analysis

---

## Feedback & Community

Share JSONL samples or feature requests via [GitHub Issues](https://github.com/botswin/BotBrowser/issues) using the `botcanvas` label. Your real-world recordings help prioritize API coverage and replay improvements

---

**[Legal Disclaimer & Terms of Use](../../DISCLAIMER.md)** • **[Responsible Use Guidelines](../../RESPONSIBLE_USE.md)**: BotCanvas is for authorized fingerprint-consistency testing and research only.
