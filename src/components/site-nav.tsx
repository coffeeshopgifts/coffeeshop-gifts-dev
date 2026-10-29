'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NAV_LINKS } from '@/config/site';
import { useI18n } from '@/i18n';

const links = [{ href: '/', key: 'nav.home' }, ...NAV_LINKS] as const;

export function SiteNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav className="border-b border-border bg-surface">
      <ul className="mx-auto flex max-w-container-content gap-4 px-gutter py-3">
        {links.map((link) => {
          const active = pathname === link.href || pathname === link.href.replace(/\/$/, '');
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                suppressHydrationWarning
                className={`text-body-sm ${active ? 'text-fg font-semibold' : 'text-fg-secondary'}`}
              >
                {t(link.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
