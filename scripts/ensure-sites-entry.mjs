import { access, copyFile } from 'node:fs/promises';

try {
  await access('dist/server/index.js');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
  await copyFile('dist/server/index.mjs', 'dist/server/index.js');
}
