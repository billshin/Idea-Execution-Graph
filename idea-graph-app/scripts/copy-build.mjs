import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.resolve(__dirname, '../../docs');
const targetDir = path.resolve(__dirname, '../../backend/public');

async function main() {
  await mkdir(targetDir, { recursive: true });
  await rm(targetDir, { recursive: true, force: true });
  await mkdir(targetDir, { recursive: true });
  await cp(sourceDir, targetDir, { recursive: true });
  console.log(`[copy-build] Copied ${sourceDir} -> ${targetDir}`);
}

main().catch((error) => {
  console.error('[copy-build] Failed to copy build output:', error);
  process.exit(1);
});
