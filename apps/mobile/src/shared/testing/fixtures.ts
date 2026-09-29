// API-shaped test data for component tests. Each builder takes overrides.
import type {
  Me,
  NearbyBag,
  OrderDetail,
  ShopBag,
  ShopBagsResponse,
  StoreDetail,
  StoreOrder,
} from '@leftover/shared';

export const customer: Me = {
  id: 'u1',
  email: 'olena@example.com',
  firstName: 'Olena',
  role: 'customer',
  createdAt: '2026-09-29T10:00:00.000Z',
  storeId: null,
};

export const shopOwnerUser: Me = {
  ...customer,
  id: 'u2',
  email: 'taras@example.com',
  firstName: 'Taras',
  role: 'store',
  storeId: 's1',
};

export const crumbStore: StoreDetail['store'] = {
  id: 's1',
  name: 'Crumb & Co. Bakery',
  category: 'bakery',
  address: 'vul. Doroshenka 32',
  lat: 49.8393,
  lng: 24.0325,
  opensAt: '08:00',
  closesAt: '20:00',
  timezone: 'Europe/Kyiv',
};

export const nearbyBag = (over: Partial<NearbyBag> & Pick<NearbyBag, 'id'>): NearbyBag => ({
  title: 'Bakery surprise bag',
  category: 'bakery',
  priceMinor: 14900,
  originalPriceMinor: 45000,
  qtyAvailable: 3,
  pickupStart: '2026-09-29T15:00:00.000Z',
  pickupEnd: '2026-09-29T16:30:00.000Z',
  store: { id: 's1', name: 'Crumb & Co. Bakery', timezone: 'Europe/Kyiv' },
  distanceKm: 0.8,
  rating: null,
  isFavorite: false,
  ...over,
});

export const storeBag = (
  id: string,
  title: string,
  qtyAvailable: number,
  priceMinor = 14900,
): StoreDetail['bags'][number] => ({
  id,
  title,
  description: 'A mix of today’s bread and pastries.',
  category: 'bakery',
  priceMinor,
  originalPriceMinor: 45000,
  qtyAvailable,
  pickupStart: '2026-09-29T15:00:00.000Z',
  pickupEnd: '2026-09-29T16:30:00.000Z',
});

export const storeDetail = (over: Partial<StoreDetail> = {}): StoreDetail => ({
  store: crumbStore,
  distanceKm: 0.8,
  openStatus: 'open',
  bags: [
    storeBag('b1', 'Bakery surprise bag', 3),
    storeBag('b2', 'Sweet box', 2, 10900),
    storeBag('b3', 'Bread-only bag', 0, 6900),
  ],
  counts: { available: 2, total: 3 },
  rating: null,
  recentReviews: [],
  isFavorite: false,
  ...over,
});

export const orderDetail = (over: Partial<OrderDetail> = {}): OrderDetail => ({
  id: 'o1',
  bagId: 'b1',
  storeId: 's1',
  qty: 1,
  unitPriceMinor: 14900,
  unitOriginalPriceMinor: 45000,
  code: '4827',
  status: 'reserved',
  displayStatus: 'reserved',
  createdAt: '2026-09-29T13:00:00.000Z',
  collectedAt: null,
  cancelledAt: null,
  bag: {
    id: 'b1',
    title: 'Bakery surprise bag',
    category: 'bakery',
    pickupStart: '2026-09-29T15:00:00.000Z',
    pickupEnd: '2026-09-29T16:30:00.000Z',
  },
  store: {
    id: 's1',
    name: 'Crumb & Co. Bakery',
    address: 'vul. Doroshenka 32',
    lat: 49.8393,
    lng: 24.0325,
    timezone: 'Europe/Kyiv',
  },
  rating: null,
  ...over,
});

export const shopBag = (over: Partial<ShopBag> & Pick<ShopBag, 'id'>): ShopBag => ({
  storeId: 's1',
  title: 'Bakery surprise bag',
  description: 'Bread and pastries.',
  category: 'bakery',
  priceMinor: 14900,
  originalPriceMinor: 45000,
  qtyTotal: 5,
  qtyAvailable: 3,
  pickupStart: '2026-09-29T15:00:00.000Z',
  pickupEnd: '2026-09-29T16:30:00.000Z',
  isActive: true,
  reservedCount: 2,
  ...over,
});

export const shopBags = (
  bags: ShopBag[],
  over: Partial<ShopBagsResponse> = {},
): ShopBagsResponse => ({
  storeName: 'Crumb & Co. Bakery',
  timezone: 'Europe/Kyiv',
  bags,
  stats: { liveNow: 2, reservedToday: 5 },
  ...over,
});

export const storeOrder = (over: Partial<StoreOrder> & Pick<StoreOrder, 'id'>): StoreOrder => ({
  code: '4827',
  customerName: 'Olena',
  qty: 1,
  bagTitle: 'Bakery surprise bag',
  pickupStart: '2026-09-29T15:00:00.000Z',
  pickupEnd: '2026-09-29T16:30:00.000Z',
  displayStatus: 'reserved',
  totalMinor: 14900,
  collectedAt: null,
  ...over,
});
