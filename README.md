# dsh-git-diff

DeepSeek Harness Web GUI 插件：在聊天输入框内部的左侧工具栏提供 **Git Diff** 入口，用双栏完整文件视图审阅当前工作区的本地改动，并将选区批注回填到聊天草稿。

## 功能

- 输入框内部左侧工具栏的独立 Git Diff 图标按钮（不依赖语音输入插件）
- 左侧修改前、右侧修改后的完整文件内容
- 删除红色、新增绿色；替换行使用左右连贯的渐变高亮
- 左右纵向和横向滚动同步
- 右侧红/绿改动指示器，点击快速定位
- 支持选择任意一侧代码内容并添加多条批注
- 有批注时“发送到会话”按钮高亮；点击只写入当前聊天草稿，不自动发送
- 支持 modified / added / deleted / renamed / untracked 文件
- Host 仅允许已注册 DSH workspace，HTTP 路由限制为 loopback、同源 JSON POST

## 安装

插件支持直接从 GitHub 安装。

### 在普通系统终端中安装

普通终端无法自动判断 DSH Desktop 当前使用的 profile，需要明确指定 `desktop`：

```bash
dsh plugin --profile desktop add github:lwt-sadais/dsh-git-diff
```

### 在 DSH Desktop 内置的 DSH 终端中安装

从 DSH Desktop 打开的内置终端已经绑定当前 Desktop profile，不需要传入 `--profile`：

```bash
dsh plugin add github:lwt-sadais/dsh-git-diff
```

仓库已经提交可直接加载的 `lib/` 构建产物，因此通常不需要在安装机器上额外编译。

安装成功后重启 DSH Desktop，再刷新现有 Web GUI。

## 开发

```bash
pnpm install
pnpm run typecheck
pnpm test
pnpm run build
```

本插件是双面 DSH bundle：

- `src/index.ts`：Host 插件入口
- `src/host/`：工作区限制、Git 状态读取和 `/api/dsh-git-diff/snapshot`
- `src/client/`：`conversation.input.left` 按钮、body portal 弹窗、批注与草稿回填
- `src/core/types.ts`：Host / Client 共享协议

## 审阅边界

- “修改前”取自 `HEAD:<path>`；“修改后”取自当前磁盘工作树，因此同时覆盖 staged 与 unstaged 的最终本地状态。
- 单文件最多读取 2 MiB，总快照最多 16 MiB。
- 二进制文件只显示提示，不进行文本渲染。
- 插件不会执行 `git add`、提交、重置或修改工作树。

## License

MIT
