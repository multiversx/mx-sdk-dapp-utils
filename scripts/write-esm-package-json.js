// Marks out/esm as an ES module scope.

const fs = require('fs');
const path = require('path');

const esmDir = path.resolve(__dirname, '..', 'out', 'esm');

fs.mkdirSync(esmDir, { recursive: true });
fs.writeFileSync(
  path.join(esmDir, 'package.json'),
  JSON.stringify({ type: 'module' }, null, 2) + '\n'
);
