// Puts the seed photos into the local R2 bucket and points the seed bags and shops at them
// (brief 20). Run after the SQL seed: `node seed/load-images.mjs oman|lviv`.
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const BUCKET = 'leftover-images';
const dir = path.join(import.meta.dirname, 'images');

// Seed row → photo. Bags get `photo_key`; shops get `cover_key`.
const SEEDS = {
  oman: {
    bags: {
      'seed-bag-qurum-surprise': 'croissants',
      'seed-bag-qurum-sweet': 'cake',
      'seed-bag-qurum-bread': 'croissants',
      'seed-bag-khuwair-hot': 'kabsa',
      'seed-bag-shatti-groceries': 'salad-bar',
      'seed-bag-qahwa-pastry': 'coffee',
      'seed-bag-ruwi-veg': 'vegetables',
    },
    stores: {
      'seed-store-qurum': 'croissants',
      'seed-store-khuwair': 'kabsa',
      'seed-store-shatti': 'salad-bar',
      'seed-store-qahwa': 'coffee',
      'seed-store-ruwi': 'vegetables',
    },
  },
  lviv: {
    bags: {
      'seed-bag-crumb-surprise': 'croissants',
      'seed-bag-crumb-sweet': 'cake',
      'seed-bag-crumb-bread': 'croissants',
      'seed-bag-kasha-hot': 'kabsa',
      'seed-bag-zelena-groceries': 'salad-bar',
      'seed-bag-morning-pastry': 'coffee',
      'seed-bag-greenrow-veg': 'vegetables',
    },
    stores: {
      'seed-store-crumb': 'croissants',
      'seed-store-kasha': 'kabsa',
      'seed-store-zelena': 'salad-bar',
      'seed-store-morning': 'coffee',
      'seed-store-greenrow': 'vegetables',
    },
  },
};

const seed = SEEDS[process.argv[2]];
if (!seed) {
  console.error('Usage: node seed/load-images.mjs oman|lviv');
  process.exit(1);
}

const wrangler = (...args) => execFileSync('npx', ['wrangler', ...args], { stdio: 'inherit' });

const put = (key, photo) =>
  wrangler(
    'r2',
    'object',
    'put',
    `${BUCKET}/${key}`,
    '--local',
    '--file',
    path.join(dir, `${photo}.jpg`),
    '--content-type',
    'image/jpeg',
    '--cache-control',
    'public, max-age=31536000, immutable',
  );

const updates = [];
for (const [id, photo] of Object.entries(seed.bags)) {
  const key = `bags/${id}/photo/seed-${photo}.jpg`;
  put(key, photo);
  updates.push(`UPDATE bags SET photo_key = '${key}' WHERE id = '${id}';`);
}
for (const [id, photo] of Object.entries(seed.stores)) {
  const key = `stores/${id}/cover/seed-${photo}.jpg`;
  put(key, photo);
  updates.push(`UPDATE stores SET cover_key = '${key}' WHERE id = '${id}';`);
}
wrangler('d1', 'execute', 'DB', '--local', '--command', updates.join(' '));
