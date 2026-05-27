# OpenCode Desktop 插件不加载问题排查经验

## 症状

OpenCode Desktop 启动后模式选择器中仅显示原生 `build` / `plan` 两个 mode，oh-my-openagent 的所有 agent（Sisyphus、Hephaestus、Prometheus、Atlas 等）均不出现。

## 排查路径

### Step 1: Doctor 诊断

```bash
bunx oh-my-opencode doctor
```

输出三个问题，但其中两个是**误报**：

| 问题 | 实际情况 |
|------|---------|
| "OpenCode binary not found" | Desktop 版 CLI bin 不在 PATH（正常现象） |
| "oh-my-openagent is not registered" | doctor 的 `findPluginEntry()` 仅识别 npm 包名和 `file://` 前缀，不识别本地目录路径（如 `D:\Agent\oh-my-openagent`） |
| "GitHub CLI missing" | 真实问题，但不影响 agent 加载 |

⚠️ **教训**：doctor 工具**不能完全信赖**，尤其对于本地开发路径。

### Step 2: 检查 OpenCode Desktop 日志

关键日志路径：`~/.local/share/opencode/log/`（Windows：`C:\Users\<用户>\.local\share\opencode\log\`）

日志中可看到：

```
ERROR service=plugin path=file:///D:/Agent/oh-my-openagent
  target=file:///D:/Agent/oh-my-openagent/dist/index.js
  error=The "path" argument must be of type string. Received undefined
  failed to load plugin
```

**关键信息**：
- `target` 已正确解析为 `dist/index.js` → 插件路径配置正确
- `error=The "path" argument must be of type string. Received undefined` → 模块加载时 `path.join(xxx, undefined)` 崩溃
- 无 `ENTRY - plugin loading` 日志 → 崩溃发生在 `serverPlugin()` 函数被调用之前

### Step 3: 用 Node.js 直接加载定位崩溃行

```bash
node -e "import('file:///D:/Agent/oh-my-openagent/dist/index.js')"
```

输出精确位置：

```
ERR: The "path" argument must be of type string. Received undefined
    at join (node:path:513:7)
    at file:///D:/Agent/oh-my-openagent/dist/index.js:110546:21
```

`dist/index.js:110546` 对应源码 `src/tools/codesign/scaffold.ts:6-7`：

```typescript
// ❌ 崩溃代码
import { join } from "node:path"
const TEMPLATES_DIR = join(import.meta.dir, "..", "..", "..", ...)
```

**根因**：`import.meta.dir` 是 **Bun 专用 API**，在 Node.js（OpenCode Desktop 的 Electron 运行时）中值为 `undefined`。项目构建使用 `--target bun`，Bun 打包器未对此进行 polyfill，而 Node.js 的 `path.join(undefined, ...)` 直接抛出 `ERR_INVALID_ARG_TYPE`。

### Step 4: 修复

将 `import.meta.dir` 替换为 Node.js + Bun 兼容写法：

```typescript
// ✅ 修复后
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, "..", "..", "..", ...)
```

重建验证：

```bash
# 验证 dist 中无 import.meta.dir
findstr "import\.meta\.dir" dist/index.js   # 应无输出

# 验证 Node.js 可正常加载
node -e "import('file:///D:/Agent/oh-my-openagent/dist/index.js')"  # 不应报 path 错误
```

## 常见陷阱与排查清单

### 1. 配置文件冲突

同时存在 `opencode.json` 和 `opencode.jsonc` 时可能导致配置合并异常。应只保留一个（推荐 `.json`）。

### 2. 插件路径格式

- `"D:\\Agent\\oh-my-openagent"` — ✅ 本地绝对路径（Node.js 模块解析自动查找 package.json → main）
- `"file:///D:/Agent/oh-my-openagent/dist/index.js"` — ✅ `file://` URL（但直接指向入口文件可能在 Node 环境下路径解析异常）
- `"./local-plugin.ts"` — ✅ 相对路径（适用于 ~/.config/opencode/ 相对位置）
- `"oh-my-openagent"` — ✅ npm 包名
- 不要用 `"\D:\Agent\..."`（单反斜杠，JSON 非法）

### 3. `--target bun` 构建的 Node.js 兼容性

项目使用 `bun build --target bun` 构建，生成的代码默认使用 Bun 运行时 API。在 OpenCode Desktop（Electron + Node.js）中运行时需注意：

| API | Bun | Node.js |
|-----|-----|---------|
| `import.meta.dir` | ✅ | ❌（v21.2+ 才支持） |
| `import.meta.require` | ✅ | ❌（需 shim） |
| `Bun.file()` | ✅ | ❌ |
| `Bun.write()` | ✅ | ❌ |

已有 `patch-node-require-shim.ts` 处理 `import.meta.require`，但**不处理** `import.meta.dir` 或其他 Bun 专用 API。

**建议**：在 CI 或 pre-commit hook 中添加 `import.meta.dir` 检查。

### 4. `os.tmpdir()` 在 Electron 中的行为

在 `src/shared/logger.ts` 中，`os.tmpdir()` 在模块加载时被调用（行首 `const logFile = path.join(os.tmpdir(), ...)`）。虽然 `os.tmpdir()` 是标准 Node.js API，但在某些 Electron 沙箱环境中可能返回 `undefined`。

**已修复**：改为延迟初始化（`getLogFile()` 仅在首次 log 调用时计算路径）。

### 5. `systemDefaultModel` 未配置

当所有 agent 的 model fallback 链都失败时，最终回退到 `systemDefaultModel`。若 `opencode.json` 中未配置 `"model"` 字段，该项为 `undefined`，导致 agent 创建失败。确保配置中有兜底模型。

## 排查工具速查

| 工具 | 路径 / 命令 | 用途 |
|------|-----------|------|
| OpenCode Desktop 日志 | `~/.local/share/opencode/log/` | 查看插件加载错误 |
| oh-my-openagent 日志 | `%TEMP%/oh-my-opencode.log` | 查看插件运行时日志 |
| Node.js 直接加载 | `node -e "import('file:///path/to/dist/index.js')"` | 精确定位模块加载崩溃行 |
| Doctor 诊断 | `bunx oh-my-opencode doctor` | 综合健康检查（可能有误报） |
| 进程检查 | `tasklist \| findstr OpenCode` | 验证 OpenCode 是否完全退出 |
