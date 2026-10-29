import { STATIC_PROFILE_NAMES } from '@/config/site';
import { ProfilePageView } from '@/modules/site';

type Props = {
  params: Promise<{ name: string }>;
};

export function generateStaticParams() {
  return STATIC_PROFILE_NAMES.map((name) => ({ name }));
}

export default async function ProfilePage({ params }: Props) {
  const { name } = await params;
  return <ProfilePageView name={name} />;
}
