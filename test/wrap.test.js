const { test } = require('node:test');
const assert = require('node:assert/strict');
const { selectedLineBlocks, registerWrapCommand } = require('../wrap-if-zero');
const sel = (a, b, c, d) => ({ start: { line: a, character: b }, end: { line: c, character: d }, isEmpty: a === c && b === d });
test('whole lines, next-line boundary, overlapping and adjacent selections', () => {
  assert.deepEqual(selectedLineBlocks([sel(1, 3, 3, 0)]), [{ start: 1, end: 2 }]);
  assert.deepEqual(selectedLineBlocks([sel(2, 1, 4, 1), sel(1, 0, 2, 3), sel(5, 0, 5, 2), sel(8, 0, 8, 1)]), [{ start: 1, end: 5 }, { start: 8, end: 8 }]);
  assert.deepEqual(selectedLineBlocks([sel(1, 2, 1, 2)]), []);
});
for (const eol of ['\n', '\r\n']) {
  test('preserves indentation and wraps final line with ' + JSON.stringify(eol), async () => {
    let command;
    let output;
    const lines = ['  foo();', '  bar();'];
    const vscode = {
      EndOfLine: { CRLF: 2 },
      Range: class { constructor(a,b,c,d) { Object.assign(this, { a,b,c,d }); } },
      commands: { registerCommand: (_, fn) => { command = fn; return {}; } },
      window: { activeTextEditor: {
        selections: [sel(0, 2, 1, 4)],
        document: { eol: eol === '\r\n' ? 2 : 1, lineAt: i => ({ text: lines[i] }), getText: r => { assert.equal(r.b, 0); assert.equal(r.d, 8); return lines.join(eol); } },
        edit: async (fn, options) => { assert.equal(options.undoStopBefore && options.undoStopAfter, true); fn({ replace: (_, text) => { output = text; } }); return true; }
      }, showErrorMessage: message => assert.fail(message) }
    };
    registerWrapCommand(vscode, { subscriptions: [] });
    await command();
    assert.equal(output, ['#if 0', ...lines, '#endif'].join(eol));
  });
}
