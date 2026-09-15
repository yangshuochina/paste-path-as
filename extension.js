'use strict';

const vscode = require('vscode');
const { transform } = require('./transform');

function activate(context) {
  context.subscriptions.push(vscode.commands.registerCommand('pastePathAs.paste', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('请先打开一个可编辑的文本文件。');
      return;
    }
    const version = editor.document.version;
    const selections = editor.selections.slice();
    try {
      const text = await vscode.env.clipboard.readText();
      if (text.length === 0) {
        vscode.window.showInformationMessage('剪贴板中没有文本。');
        return;
      }
      const choice = await vscode.window.showQuickPick([
        { label: 'Windows 原始路径', description: 'D:\\Work\\a.c', detail: '原样粘贴，保留单反斜杠及所有其他字符。', format: 'windows' },
        { label: 'Escaped Backslashes', description: 'D:\\\\Work\\\\a.c', detail: '将每个反斜杠加倍，适合 C / JSON 字符串中的路径。', format: 'escaped' },
        { label: 'Forward Slashes', description: 'D:/Work/a.c', detail: '将每个反斜杠替换为正斜杠。', format: 'forward' }
      ], { title: 'Paste Path As...', placeHolder: '选择路径粘贴格式', matchOnDescription: true });
      if (!choice) return;
      // Avoid writing to a stale selection if the document changed while choosing.
      if (editor.document.isClosed || editor.document.version !== version || vscode.window.activeTextEditor !== editor) {
        vscode.window.showWarningMessage('目标编辑器已变化，请重新执行 Paste Path As...。');
        return;
      }
      const result = transform(text, choice.format);
      const applied = await editor.edit(builder => {
        for (const selection of selections) builder.replace(selection, result);
      }, { undoStopBefore: true, undoStopAfter: true });
      if (!applied) vscode.window.showWarningMessage('无法粘贴，请确认文件可编辑后重试。');
    } catch (error) {
      vscode.window.showErrorMessage(`Paste Path As 失败：${error instanceof Error ? error.message : String(error)}`);
    }
  }));
}

function deactivate() {}
module.exports = { activate, deactivate };
