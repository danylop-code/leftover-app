-- Dev seed: Lviv shops and today's bags. Prices in kopiyky (14900 = ₴149).
-- Pickup windows are relative to the moment the seed runs (UTC; Kyiv is UTC+2/+3), so re-run it
-- to refresh them: `pnpm --filter @leftover/api db:seed:local`. Run it with MARKET = "UA" (prices are
-- kopiyky). Idempotent: it removes the rows of either seed (ids starting with `seed-`) first.
-- Demo logins (all share the password `leftover24`): olena@seed.leftover.app (customer),
-- crumb@ / kasha@ / zelena@ / morning@ / greenrow@seed.leftover.app (shop owners).

DELETE FROM reviews WHERE order_id LIKE 'seed-%' OR store_id LIKE 'seed-%';
DELETE FROM favorites WHERE user_id LIKE 'seed-%' OR store_id LIKE 'seed-%';
DELETE FROM orders WHERE id LIKE 'seed-%' OR bag_id LIKE 'seed-%';
DELETE FROM bags WHERE id LIKE 'seed-%';
DELETE FROM stores WHERE id LIKE 'seed-%';
DELETE FROM sessions WHERE user_id LIKE 'seed-%';
DELETE FROM users WHERE id LIKE 'seed-%';

INSERT INTO users (id, email, password_hash, first_name, role, created_at) VALUES
  ('seed-owner-crumb', 'crumb@seed.leftover.app', 'pbkdf2-sha256$100000$eF-IQXIXz_GqehfH8api5w$TDpv5juiij0seSfSaNJbiD102DFiDgcOnd6qzM-f3YU', 'Taras', 'store', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-owner-kasha', 'kasha@seed.leftover.app', 'pbkdf2-sha256$100000$eF-IQXIXz_GqehfH8api5w$TDpv5juiij0seSfSaNJbiD102DFiDgcOnd6qzM-f3YU', 'Iryna', 'store', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-owner-zelena', 'zelena@seed.leftover.app', 'pbkdf2-sha256$100000$eF-IQXIXz_GqehfH8api5w$TDpv5juiij0seSfSaNJbiD102DFiDgcOnd6qzM-f3YU', 'Oksana', 'store', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-owner-morning', 'morning@seed.leftover.app', 'pbkdf2-sha256$100000$eF-IQXIXz_GqehfH8api5w$TDpv5juiij0seSfSaNJbiD102DFiDgcOnd6qzM-f3YU', 'Andriy', 'store', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-owner-greenrow', 'greenrow@seed.leftover.app', 'pbkdf2-sha256$100000$eF-IQXIXz_GqehfH8api5w$TDpv5juiij0seSfSaNJbiD102DFiDgcOnd6qzM-f3YU', 'Marta', 'store', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-customer-olena', 'olena@seed.leftover.app', 'pbkdf2-sha256$100000$eF-IQXIXz_GqehfH8api5w$TDpv5juiij0seSfSaNJbiD102DFiDgcOnd6qzM-f3YU', 'Olena', 'customer', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

-- Distances from vul. Doroshenka 14 (49.8421, 24.0224): Crumb ~0.8 km, Kasha ~1.4 km,
-- Morning Proof ~1.1 km, Zelena ~2.2 km, Green Row ~6.0 km (outside the default 5 km radius).
INSERT INTO stores (id, owner_id, name, category, address, lat, lng, opens_at, closes_at, timezone, created_at) VALUES
  ('seed-store-crumb', 'seed-owner-crumb', 'Crumb & Co. Bakery', 'bakery', 'vul. Doroshenka 32', 49.8393, 24.0325, '08:00', '20:00', 'Europe/Kyiv', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-store-kasha', 'seed-owner-kasha', 'Kasha Kitchen', 'meals', 'pl. Rynok 12', 49.8418, 24.0418, '11:00', '22:00', 'Europe/Kyiv', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-store-zelena', 'seed-owner-zelena', 'Zelena Grocery', 'groceries', 'vul. Zelena 40', 49.8260, 24.0400, '07:00', '23:00', 'Europe/Kyiv', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-store-morning', 'seed-owner-morning', 'Morning Proof Café', 'cafe', 'prosp. Svobody 28', 49.8420, 24.0376, '07:30', '19:00', 'Europe/Kyiv', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-store-greenrow', 'seed-owner-greenrow', 'Green Row Market', 'produce', 'vul. Stryiska 200', 49.7890, 24.0110, '08:00', '18:00', 'Europe/Kyiv', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

INSERT INTO bags (id, store_id, title, description, category, price_minor, original_price_minor, qty_total, qty_available, pickup_start, pickup_end, is_active, created_at, updated_at) VALUES
  ('seed-bag-crumb-surprise', 'seed-store-crumb', 'Bakery surprise bag', 'A mix of today''s bread and pastries. Contents change daily.', 'bakery', 14900, 45000, 5, 3, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+2 hours'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+3 hours', '+30 minutes'), 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-bag-crumb-sweet', 'seed-store-crumb', 'Sweet box', 'Cakes and cookies from the display counter.', 'bakery', 10900, 32000, 3, 2, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+2 hours'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+3 hours', '+30 minutes'), 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-bag-crumb-bread', 'seed-store-crumb', 'Bread-only bag', 'Two or three loaves from today.', 'bakery', 7900, 21000, 4, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+2 hours'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+3 hours', '+30 minutes'), 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-bag-kasha-hot', 'seed-store-kasha', 'Hot meal bag', 'Two portions of today''s mains.', 'meals', 17900, 52000, 3, 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+4 hours', '+30 minutes'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+5 hours'), 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-bag-kasha-sandwich', 'seed-store-kasha', 'Sandwich bag', 'Sandwiches and wraps.', 'meals', 9900, 26000, 4, 4, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+1 hours'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+2 hours'), 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-bag-zelena-groceries', 'seed-store-zelena', 'Grocery rescue box', 'Dairy, bread and pantry items near their date.', 'groceries', 19900, 60000, 6, 6, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+3 hours'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+5 hours'), 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-bag-morning-pastry', 'seed-store-morning', 'Coffee & pastry bag', 'Pastries plus a bag of beans.', 'cafe', 12900, 38000, 2, 2, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+1 hours'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+2 hours'), 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-bag-morning-yesterday', 'seed-store-morning', 'Morning bag', 'Window already over.', 'cafe', 9900, 30000, 2, 2, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-3 hours'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-2 hours'), 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-bag-greenrow-veg', 'seed-store-greenrow', 'Veg & fruit box', 'Seasonal produce, slightly imperfect.', 'produce', 11900, 34000, 5, 5, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+1 hours'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+3 hours'), 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

-- Olena's pickup history (collected earlier today) and her reviews, so Discover shows ratings,
-- My orders has a Past tab and Profile has stats. They're counted in the bags' stock already.
INSERT INTO orders (id, user_id, bag_id, store_id, qty, unit_price_minor, unit_original_price_minor, code, status, created_at, collected_at, cancelled_at) VALUES
  ('seed-order-crumb', 'seed-customer-olena', 'seed-bag-crumb-surprise', 'seed-store-crumb', 1, 14900, 45000, '4827', 'collected', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-5 hours'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-3 hours'), NULL),
  ('seed-order-kasha', 'seed-customer-olena', 'seed-bag-kasha-hot', 'seed-store-kasha', 1, 17900, 52000, '3150', 'collected', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-5 hours'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-2 hours'), NULL);

INSERT INTO reviews (order_id, store_id, user_id, overall, quality, variety, freshness, ease, text, created_at) VALUES
  ('seed-order-crumb', 'seed-store-crumb', 'seed-customer-olena', 5, 5, 4, 5, 4, 'Two loaves, a cinnamon roll and focaccia. All fresh — lovely value.', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-2 hours')),
  ('seed-order-kasha', 'seed-store-kasha', 'seed-customer-olena', 4, 4, NULL, 5, NULL, 'Generous portions, still warm.', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 hours'));
