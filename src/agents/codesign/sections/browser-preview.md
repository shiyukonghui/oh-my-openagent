# Browser preview with Kimi WebBridge

## Preferred browser tool

When you need to preview a design artifact in a real browser — take screenshots, read page content, interact with elements, or verify rendering — use **Kimi WebBridge** as your primary browser tool.

## Quick start

```bash
# 1. Load the skill
skill("kimi-webbridge")

# 2. Health check
~/.kimi-webbridge/bin/kimi-webbridge status
# OR on Windows:
# %USERPROFILE%\.kimi-webbridge\bin\kimi-webbridge.exe status
```

## Extension not connected?

If health check returns `extension_connected: false` or the daemon isn't running:

1. Tell the user to install the extension **once**: "请安装 Kimi WebBridge 浏览器扩展。安装步骤：从 [webbridge.md](file:///D:/Agent/oh-my-openagent/docs/webbridge.md) 下载扩展包，在 `chrome://extensions` 开启开发者模式，加载未打包的扩展程序。"

2. If the daemon isn't running, start it:
   ```bash
   ~/.kimi-webbridge/bin/kimi-webbridge start
   ```

3. After the user confirms the extension is loaded, retry the health check.

## Preview workflow

After writing an HTML/JSX artifact, preview it in the real browser:

```bash
# Navigate to the local file (use absolute path, forward slashes)
curl -s -X POST http://127.0.0.1:10086/command \
  -d '{"action":"navigate","args":{"url":"file:///D:/Path/To/output.html","newTab":true},"session":"preview"}'

# Take an accessibility snapshot to read the rendered page
curl -s -X POST http://127.0.0.1:10086/command \
  -d '{"action":"snapshot","session":"preview"}'

# Take a screenshot to see visual rendering
# Use the screenshot bash helper to avoid base64 flooding context
bash "$SKILL_PATH/scripts/screenshot.sh" -s preview -o /tmp/preview.png
# Then READ the image file to inspect it
```

## When to use Kimi WebBridge vs preview tool

| Scenario | Tool |
|----------|------|
| Quick static validation of JSX/HTML structure | `preview(path)` |
| See actual visual rendering (screenshot) | kimi-webbridge |
| Read rendered page content | kimi-webbridge snapshot |
| Interact with elements (click, fill forms) | kimi-webbridge |
| Test responsive breakpoints | kimi-webbridge (resize manually) |
| Final self-check before completion | `design_done(path)` |

## Session management

Use distinct session names for different designs or screens:
```bash
# Session names: "preview", "design-review", "mobile-check"
curl -s -X POST http://127.0.0.1:10086/command \
  -d '{"action":"navigate","args":{"url":"file:///path/to/page.html","newTab":true},"session":"design-review"}'
```

## Screenshots

**Never call screenshot API directly** — the base64 response floods context. Always save to disk first:

```bash
# On Windows (PowerShell):
$r = Invoke-RestMethod -Uri http://127.0.0.1:10086/command -Method POST -Body '{"action":"screenshot","args":{"format":"png","quality":80},"session":"preview"}'
[IO.File]::WriteAllBytes("$env:TEMP\preview.png", [Convert]::FromBase64String($r.data.data))
```

Then use the `read` tool on the saved file to inspect the visual output. If `$SKILL_PATH` is set, prefer the bundled `scripts/screenshot.sh` helper.

## Key limitation

`file://` URLs may be blocked by the extension. If navigation to `file:///...` fails, serve the HTML via a local server:

```bash
# Start a quick HTTP server in the design directory
cd /d/Path/To/Design && python -m http.server 8765 &
# Then navigate
curl -s -X POST http://127.0.0.1:10086/command \
  -d '{"action":"navigate","args":{"url":"http://localhost:8765/page.html","newTab":true},"session":"preview"}'
```
