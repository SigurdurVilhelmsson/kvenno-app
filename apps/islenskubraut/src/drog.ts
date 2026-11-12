import { useSearchParams } from 'react-router-dom';

import { DROG_BIRT } from './birting';

/**
 * `show`: whether draft content is shown here (live, or `?drog`). `marks`: whether the page says
 * what is a draft. While the drafts are live only `?drog` asks for that, so a teacher can still
 * see the page as a reviewer; with the switch off, a draft is marked wherever it shows, as before.
 */
export function useDrog(): { show: boolean; marks: boolean } {
  const [searchParams] = useSearchParams();
  const asked = searchParams.has('drog');
  return { show: DROG_BIRT || asked, marks: asked || !DROG_BIRT };
}
