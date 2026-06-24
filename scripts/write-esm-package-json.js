// Marks out/esm as an ES module scope.
//
// tsc emits plain .js files. Without a "type": "module" marker (and with the
// root package defaulting to CommonJS), Node treats out/esm/*.js as CommonJS
// and throws on the `export` syntax in native Node / SSR. This writes the
// marker so the ESM build is interpreted as ESM.

const fs = require('fs');
const path = require('path');

const esmDir = path.resolve(__dirname, '..', 'out', 'esm');

fs.mkdirSync(esmDir, { recursive: true });
fs.writeFileSync(
  path.join(esmDir, 'package.json'),
  JSON.stringify({ type: 'module' }, null, 2) + '\n'
);
