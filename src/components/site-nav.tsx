'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NAV_LINKS } from '@/config/site';
import { useI18n } from '@/i18n';

export function SiteNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav className="site-menu">
      <ul>
        {NAV_LINKS.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <li key={link.href}>
              <Link href={link.href} suppressHydrationWarning className={active ? 'is-active' : undefined}>
                {t(link.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
