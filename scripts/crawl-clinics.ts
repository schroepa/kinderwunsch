import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { runFullCrawl } from '../src/crawler/runCrawl';

const root = process.cwd();

async function main() {
  console.log('Crawling clinics (allowlist)...');
  const payload = await runFullCrawl(root);
  await writeFile(
    join(root, 'public/data/clinics.json'),
    JSON.stringify(payload.clinics, null, 2) + '\n',
    'utf8',
  );
  await writeFile(
    join(root, 'public/data/clinics-meta.json'),
    JSON.stringify(payload.meta, null, 2) + '\n',
    'utf8',
  );
  console.log(`Wrote ${payload.clinics.length} clinics`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
