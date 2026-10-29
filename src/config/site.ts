export const HOME_OBJECT_ID = '3v3mde-coffee-recipes';

export const NAV_LINKS = [
  { href: '/object/3v3mde-coffee-recipes', key: 'nav.recipes' },
  { href: '/object/car3n-community/newsfeed', key: 'nav.talk' },
  { href: '/object/2x9p9j-shop', key: 'nav.shop' },
  { href: '/object/vbd-coffee-shops', key: 'nav.map' },
  { href: '/object/ljc-legal', key: 'nav.legal' },
] as const;

export const CRAWL_SEED_IDS = [
  HOME_OBJECT_ID,
  '2x9p9j-shop',
  'vbd-coffee-shops',
  'car3n-community',
  'ljc-legal',
] as const;

export const STATIC_PROFILE_NAMES = ['coffee.time'] as const;
