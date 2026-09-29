-- Oman seed (brief 21): Muscat shops and today's bags. Prices in baisa (1500 = OMR 1.500).
-- Run with the API's MARKET = "OM" (the default): `pnpm --filter @leftover/api db:seed:oman`.
-- Pickup windows are relative to the moment the seed runs (UTC; Muscat is UTC+4), so re-run it
-- to refresh them. Idempotent, and it replaces the Lviv seed: both own the ids starting with
-- `seed-`, so only one seed is loaded at a time.
-- Demo logins (all share the password `leftover24`): aisha@seed.leftover.app (customer),
-- qurum@ / khuwair@ / shatti@ / qahwa@ / ruwi@seed.leftover.app (shop owners).

DELETE FROM reviews WHERE order_id LIKE 'seed-%' OR store_id LIKE 'seed-%';
DELETE FROM favorites WHERE user_id LIKE 'seed-%' OR store_id LIKE 'seed-%';
DELETE FROM orders WHERE id LIKE 'seed-%' OR bag_id LIKE 'seed-%';
DELETE FROM bags WHERE id LIKE 'seed-%';
DELETE FROM stores WHERE id LIKE 'seed-%';
DELETE FROM sessions WHERE user_id LIKE 'seed-%';
DELETE FROM users WHERE id LIKE 'seed-%';

INSERT INTO users (id, email, password_hash, first_name, role, created_at) VALUES
  ('seed-owner-qurum', 'qurum@seed.leftover.app', 'pbkdf2-sha256$100000$eF-IQXIXz_GqehfH8api5w$TDpv5juiij0seSfSaNJbiD102DFiDgcOnd6qzM-f3YU', 'Salim', 'store', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-owner-khuwair', 'khuwair@seed.leftover.app', 'pbkdf2-sha256$100000$eF-IQXIXz_GqehfH8api5w$TDpv5juiij0seSfSaNJbiD102DFiDgcOnd6qzM-f3YU', 'Maryam', 'store', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-owner-shatti', 'shatti@seed.leftover.app', 'pbkdf2-sha256$100000$eF-IQXIXz_GqehfH8api5w$TDpv5juiij0seSfSaNJbiD102DFiDgcOnd6qzM-f3YU', 'Fatma', 'store', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-owner-qahwa', 'qahwa@seed.leftover.app', 'pbkdf2-sha256$100000$eF-IQXIXz_GqehfH8api5w$TDpv5juiij0seSfSaNJbiD102DFiDgcOnd6qzM-f3YU', 'Hamad', 'store', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-owner-ruwi', 'ruwi@seed.leftover.app', 'pbkdf2-sha256$100000$eF-IQXIXz_GqehfH8api5w$TDpv5juiij0seSfSaNJbiD102DFiDgcOnd6qzM-f3YU', 'Khalid', 'store', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-customer-aisha', 'aisha@seed.leftover.app', 'pbkdf2-sha256$100000$eF-IQXIXz_GqehfH8api5w$TDpv5juiij0seSfSaNJbiD102DFiDgcOnd6qzM-f3YU', 'Aisha', 'customer', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

-- Distances from Qurum (23.6139, 58.4757): Qurum Crust ~0.5 km, Shatti ~1.3 km, Dar Al Qahwa ~2.0 km,
-- Khuwair ~4.0 km, Ruwi Green ~7.3 km (outside the default 5 km radius).
INSERT INTO stores (id, owner_id, name, category, address, lat, lng, opens_at, closes_at, timezone, created_at) VALUES
  ('seed-store-qurum', 'seed-owner-qurum', 'Qurum Crust Bakery', 'bakery', 'Way 2601, Qurum', 23.6168, 58.4800, '08:00', '20:00', 'Asia/Muscat', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-store-khuwair', 'seed-owner-khuwair', 'Khuwair Kitchen', 'meals', '18th November St, Al Khuwair', 23.5985, 58.4400, '11:00', '22:00', 'Asia/Muscat', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-store-shatti', 'seed-owner-shatti', 'Shatti Grocery', 'groceries', 'Al Kharjiya St, Shatti Al Qurum', 23.6200, 58.4650, '07:00', '23:00', 'Asia/Muscat', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-store-qahwa', 'seed-owner-qahwa', 'Dar Al Qahwa Café', 'cafe', 'Way 3017, Madinat Sultan Qaboos', 23.6060, 58.4580, '07:30', '19:00', 'Asia/Muscat', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-store-ruwi', 'seed-owner-ruwi', 'Ruwi Green Market', 'produce', 'Ruwi High St, Ruwi', 23.5930, 58.5440, '08:00', '18:00', 'Asia/Muscat', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

INSERT INTO bags (id, store_id, title, description, category, price_minor, original_price_minor, qty_total, qty_available, pickup_start, pickup_end, is_active, created_at, updated_at) VALUES
  ('seed-bag-qurum-surprise', 'seed-store-qurum', 'Bakery surprise bag', 'A mix of today''s bread and pastries. Contents change daily.', 'bakery', 1500, 4500, 5, 3, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+2 hours'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+3 hours', '+30 minutes'), 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-bag-qurum-sweet', 'seed-store-qurum', 'Sweet box', 'Cakes and cookies from the display counter.', 'bakery', 1200, 3500, 3, 2, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+2 hours'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+3 hours', '+30 minutes'), 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-bag-qurum-bread', 'seed-store-qurum', 'Bread-only bag', 'Two or three loaves from today.', 'bakery', 800, 2200, 4, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+2 hours'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+3 hours', '+30 minutes'), 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-bag-khuwair-hot', 'seed-store-khuwair', 'Hot meal bag', 'Two portions of today''s mains: majboos or shuwa rice.', 'meals', 2500, 7000, 3, 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+4 hours', '+30 minutes'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+5 hours'), 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-bag-khuwair-sandwich', 'seed-store-khuwair', 'Sandwich bag', 'Sandwiches and wraps.', 'meals', 1400, 4000, 4, 4, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+1 hours'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+2 hours'), 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-bag-shatti-groceries', 'seed-store-shatti', 'Grocery rescue box', 'Dairy, bread and pantry items near their date.', 'groceries', 2000, 6000, 6, 6, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+3 hours'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+5 hours'), 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-bag-qahwa-pastry', 'seed-store-qahwa', 'Qahwa & sweets bag', 'Pastries, dates and a bag of Omani coffee.', 'cafe', 1800, 5000, 2, 2, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+1 hours'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+2 hours'), 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-bag-qahwa-yesterday', 'seed-store-qahwa', 'Morning bag', 'Window already over.', 'cafe', 1000, 3000, 2, 2, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-3 hours'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-2 hours'), 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('seed-bag-ruwi-veg', 'seed-store-ruwi', 'Veg & fruit box', 'Seasonal produce, slightly imperfect.', 'produce', 1300, 4000, 5, 5, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+1 hours'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+3 hours'), 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

-- Aisha's pickup history (collected earlier today) and her reviews, so Discover shows ratings,
-- My orders has a Past tab and Profile has stats. They're counted in the bags' stock already.
INSERT INTO orders (id, user_id, bag_id, store_id, qty, unit_price_minor, unit_original_price_minor, code, status, created_at, collected_at, cancelled_at) VALUES
  ('seed-order-qurum', 'seed-customer-aisha', 'seed-bag-qurum-surprise', 'seed-store-qurum', 1, 1500, 4500, '4827', 'collected', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-5 hours'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-3 hours'), NULL),
  ('seed-order-khuwair', 'seed-customer-aisha', 'seed-bag-khuwair-hot', 'seed-store-khuwair', 1, 2500, 7000, '3150', 'collected', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-5 hours'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-2 hours'), NULL);

INSERT INTO reviews (order_id, store_id, user_id, overall, quality, variety, freshness, ease, text, created_at) VALUES
  ('seed-order-qurum', 'seed-store-qurum', 'seed-customer-aisha', 5, 5, 4, 5, 4, 'Khubz, a date cake and two croissants. All fresh — lovely value.', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-2 hours')),
  ('seed-order-khuwair', 'seed-store-khuwair', 'seed-customer-aisha', 4, 4, NULL, 5, NULL, 'Generous portions, still warm.', strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 hours'));
