'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { transform } = require('../transform');

test('formats preserve quotes, whitespace, Unicode and multiline content', () => {
  const text = ' "D:\\工作\\a.c"\r\n\\\\server\\share\\b ';
  assert.equal(transform(text, 'windows'), text);
  assert.equal(transform(text, 'escaped'), ' "D:\\\\工作\\\\a.c"\r\n\\\\\\\\server\\\\share\\\\b ');
  assert.equal(transform(text, 'forward'), ' "D:/工作/a.c"\r\n//server/share/b ');
  assert.equal(transform('D:/Work/a.c', 'windows'), 'D:/Work/a.c');
  assert.equal(transform('', 'escaped'), '');
});

function setup({ cancel = false, changed = false, empty = false } = {}) {
  let callback;
  const edits = [];
  const selections = [{ start: 0, end: 0 }, { start: 3, end: 8 }];
  const editor = {
    document: { version: 1, isClosed: false }, selections,
    edit: async (fn, options) => {
      assert.deepEqual(JSON.parse(JSON.stringify(options)), { undoStopBefore: true, undoStopAfter: true });
      fn({ replace: (selection, text) => edits.push({ selection, text }) });
      return true;
    }
  };
  const vscode = {
    commands: { registerCommand: (id, fn) => { if (id === 'pastePathAs.paste') callback = fn; return { dispose() {} }; } },
    env: { clipboard: { readText: async () => empty ? '' : 'D:\\Work\\a.c' } },
    window: {
      activeTextEditor: editor,
      showQuickPick: async items => { if (changed) editor.document.version++; return cancel ? undefined : items[2]; },
      showInformationMessage() {}, showWarningMessage() {},
      showErrorMessage(message) { throw new Error(message); }
    }
  };
  const sandbox = { require: name => name === 'vscode' ? vscode : name === './wrap-if-zero' ? require('../wrap-if-zero') : { transform }, module: { exports: {} } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../extension'), 'utf8'), sandbox);
  sandbox.module.exports.activate({ subscriptions: [] });
  return { run: () => callback(), edits, selections };
}

test('inserts at empty selection and replaces selected text at all cursors', async () => {
  const env = setup();
  await env.run();
  assert.deepEqual(env.edits, env.selections.map(selection => ({ selection, text: 'D:/Work/a.c' })));
});

for (const scenario of ['cancel', 'changed', 'empty']) {
  test(`${scenario} leaves the document unchanged`, async () => {
    const env = setup({ [scenario]: true });
    await env.run();
    assert.equal(env.edits.length, 0);
  });
}
