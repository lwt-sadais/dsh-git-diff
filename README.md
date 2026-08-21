# dsh-git-diff

DeepSeek Harness Web GUI 插件：在聊天输入框内部的语音输入按钮右侧提供 **Git Diff** 入口，用双栏完整文件视图审阅当前工作区的本地改动，并将选区批注回填到聊天草稿。

## 功能

- 输入框内部、语音输入按钮右侧的 Git Diff 按钮
- 左侧修改前、右侧修改后的完整文件内容
- 删除红色、新增绿色；替换行使用左右连贯的渐变高亮
- 左右纵向和横向滚动同步
- 右侧红/绿改动指示器，点击快速定位
- 支持选择任意一侧代码内容并添加多条批注
- 有批注时“发送到会话”按钮高亮；点击只写入当前聊天草稿，不自动发送
- 支持 modified / added / deleted / renamed / untracked 文件
- Host 仅允许已注册 DSH workspace，HTTP 路由限制为 loopback、同源 JSON POST

## 安装

```bash
git clone https://github.com/lwt-sadais/dsh-git-diff.git
cd dsh-git-diff
pnpm install
pnpm run check
dsh plugin --profile desktop add link:$(pwd)
```

安装或 Host 代码变更后重启 DSH，再刷新现有 Web GUI。

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
