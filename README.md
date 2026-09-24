# Paste Path As

从系统剪贴板读取文本，在 VS Code 编辑器中选择路径格式后粘贴。适用于 Windows VS Code 1.85.0 及以上版本。

## 安装与使用

1. 在 VS Code 扩展面板的 `…` 菜单中选择 **Install from VSIX...（从 VSIX 安装）**，打开 `paste-path-as-1.0.1.vsix`。
2. 从 Windows 资源管理器复制路径，在编辑器中放置光标或选择要替换的文本。
3. 按 **Ctrl+Alt+V**，或者右键选择 **Paste Path As...**，也可在命令面板搜索该命令。
4. 选择下列格式并按回车。按 Esc 取消，不改动文档。

| 选项 | 剪贴板为 `D:\Work\a.c` 时的结果 |
| --- | --- |
| Windows 原始路径 | `D:\Work\a.c` |
| Escaped Backslashes | `D:\\Work\\a.c` |
| Forward Slashes | `D:/Work/a.c` |

支持替换选区和多个光标；每个选区粘贴相同的完整文本。一次撤销可恢复此次粘贴。普通 Ctrl+V 保持原有行为。如果快捷键与其他扩展冲突，可在键盘快捷方式中搜索 `Paste Path As` 后重新绑定。

## 转换规则

- 原始格式完整保留剪贴板文本，不将已有 `/` 改成 `\`。
- 只进行所选的反斜杠替换，不裁剪空格、移除引号或解析路径。资源管理器“复制为路径”带来的外围双引号也会保留。
- 多行文本和 UNC 路径可用；换行使用目标文档的换行格式。
- 转义选项将所有现有反斜杠加倍，包括已转义文本中的反斜杠。它不是完整的 C / JSON 字符串序列化器，不转义双引号或换行，也不自动加引号。
- 不修改剪贴板，不访问网络，无额外运行时依赖。仅在执行命令时读取剪贴板。

## 开发与打包

源代码为 JavaScript，无需编译。安装 Node.js 后运行：

```powershell
npm test
npm run package
```

打包命令使用 Microsoft 的 `@vscode/vsce`，首次运行需要联网下载打包工具；扩展运行时只依赖 VS Code API。也可以在此项目中按 F5 启动扩展开发窗口进行交互测试。

发布者：`yangshuochina`。扩展标识：`yangshuochina.paste-path-as`。

## English

Paste clipboard text using one of three path formats: original Windows paths, doubled backslashes, or forward slashes. Requires VS Code 1.85.0 or later.

Copy a path, focus a text editor, and press **Ctrl+Alt+V** (macOS: **Cmd+Alt+V**). You can also use **Paste Path As...** from the editor context menu or Command Palette. Choose a format and press Enter; press Escape to cancel.

The command inserts at the cursor or replaces selected text. Multiple cursors receive the same complete clipboard text, and one Undo restores the edit. Quotes and whitespace are preserved. Escaping doubles every backslash; it does not perform complete C or JSON string serialization. Clipboard contents are not modified.

No network access or additional runtime dependencies. Clipboard text is read only when you run the command.

## 用 #if 0 包围代码（1.0.1）

选择 C / C++ 等支持预处理指令的代码，按 **Ctrl+Alt+0**（macOS：**Cmd+Alt+0**），或右键选择 **Wrap Selection with #if 0**。

```c
#if 0
selected_code();
#endif
```

自动扩展到选中代码所在的完整行，以保证指令独占一行；选区在下一行行首结束时不包含该行。保留代码缩进和文档换行格式。多选区重叠或相邻时合并，分离选区分别包围，一次撤销即可恢复。没有选区时不执行。此命令仅添加包围，不切换或删除已有指令；选区应包含完整、配对的预处理结构。快捷键冲突时可在键盘快捷方式中修改。

Select code and press **Ctrl+Alt+0** to wrap its complete lines with `#if 0` and `#endif`. Overlapping or adjacent selections are merged. Separate selections are wrapped independently. The operation preserves indentation and line endings and can be undone in one step. This adds a wrapper; it does not toggle existing directives.
