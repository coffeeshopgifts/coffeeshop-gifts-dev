import { crawlObjectIds, ObjectPageView } from '@/modules/site';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const ids = await crawlObjectIds();
  return ids.map((id) => ({ id }));
}

export default async function ObjectPage({ params }: Props) {
  const { id } = await params;
  return <ObjectPageView objectId={id} />;
}
