'use strict';

function transform(text, format) {
  switch (format) {
    case 'windows': return text;
    case 'escaped': return text.replace(/\\/g, '\\\\');
    case 'forward': return text.replace(/\\/g, '/');
    default: throw new Error(`Unknown path format: ${format}`);
  }
}

module.exports = { transform };
