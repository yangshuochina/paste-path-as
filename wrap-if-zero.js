'use strict';

// Preprocessor directives must occupy separate lines, so expand to whole lines.
function selectedLineBlocks(selections) {
  const blocks = selections.filter(s => !s.isEmpty).map(s => ({
    start: s.start.line,
    end: s.end.line - (s.end.character === 0 && s.end.line > s.start.line ? 1 : 0)
  })).sort((a, b) => a.start - b.start);
  const merged = [];
  for (const block of blocks) {
    const previous = merged[merged.length - 1];
    if (previous && block.start <= previous.end + 1) previous.end = Math.max(previous.end, block.end);
    else merged.push({ ...block });
  }
  return merged;
}

function registerWrapCommand(vscode, context) {
  context.subscriptions.push(vscode.commands.registerCommand('pastePathAs.wrapIfZero', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const blocks = selectedLineBlocks(editor.selections);
    if (!blocks.length) {
      vscode.window.showInformationMessage('Select code to wrap with #if 0 / #endif.');
      return;
    }
    const eol = editor.document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n';
    try {
      const applied = await editor.edit(builder => {
        for (const block of blocks) {
          const range = new vscode.Range(block.start, 0, block.end, editor.document.lineAt(block.end).text.length);
          builder.replace(range, '#if 0' + eol + editor.document.getText(range) + eol + '#endif');
        }
      }, { undoStopBefore: true, undoStopAfter: true });
      if (!applied) vscode.window.showWarningMessage('Could not wrap the selection. Check that the file is editable.');
    } catch (error) {
      vscode.window.showErrorMessage(`Wrap with #if 0 failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }));
}

module.exports = { selectedLineBlocks, registerWrapCommand };
