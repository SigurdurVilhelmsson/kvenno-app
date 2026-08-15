import { createGameViteConfig } from '../../shared-vite-config';

export default createGameViteConfig({
  gameName: 'intermolecular-forces',
  yearDir: '2-ar',
  gameDir: __dirname,
  // Three.js game: opt out of single-file so the lazy 3D chunk stays deferred.
  singleFile: false,
});
