import { HOME_OBJECT_ID } from '@/config/site';
import { ObjectPageView } from '@/modules/site';

export default function HomePage() {
  return <ObjectPageView objectId={HOME_OBJECT_ID} />;
}
