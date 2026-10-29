import { ObjectPageView } from '@/modules/site';

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return [{ id: 'car3n-community' }];
}

export default async function ObjectNewsfeedPage({ params }: Props) {
  const { id } = await params;
  return <ObjectPageView objectId={id} newsfeed />;
}
