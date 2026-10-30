import { SITE_BANNER_URL, SITE_NAME } from '@/config/site';

export function SiteBanner() {
  return (
    <div className="site-banner">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={SITE_BANNER_URL} alt={`Promotional banner for ${SITE_NAME}`} />
    </div>
  );
}
