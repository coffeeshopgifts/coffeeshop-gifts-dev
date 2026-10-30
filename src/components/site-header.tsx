'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { SITE_LOGO_URL, SITE_NAME } from '@/config/site';
import { useWallet } from '@/modules/wallet';

export function SiteHeader() {
  const router = useRouter();
  const { username } = useWallet();
  const [query, setQuery] = useState('');

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    if (!q) {
      return;
    }
    router.push(`/explore?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="site-header">
      <Link href="/" className="site-brand" suppressHydrationWarning>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SITE_LOGO_URL} alt="" width={50} height={50} />
        <span>{SITE_NAME}</span>
      </Link>
      <form className="site-search" onSubmit={onSearch}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What are you looking for?"
          aria-label="What are you looking for?"
        />
      </form>
      <Link href={username ? `/@${username}` : '/explore'} className="site-login" suppressHydrationWarning>
        {username ? `@${username}` : 'Log in'}
      </Link>
    </header>
  );
}
