export interface Track {
  id: string;
  /** URL path (internal SPA route or external app path) */
  path: string;
  title: string;
  description: string;
  icon: string;
  /** If true, the track is a separate SPA — uses <a> for full page navigation */
  isExternal?: boolean;
}

export const tracks: Track[] = [
  {
    id: 'efnafraedi',
    path: '/efnafraedi',
    title: 'Efnafræði',
    description: 'Gagnvirk verkfæri fyrir efnafræðikennslu',
    icon: '🧪',
  },
  {
    id: 'islenskubraut',
    path: '/islenskubraut/',
    title: 'Íslenskubraut',
    description: 'Kennsluspjöld og verkfæri fyrir íslensku sem annað tungumál',
    icon: '📚',
    isExternal: true,
  },
];
