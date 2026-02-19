import { createGameViteConfig } from '../../shared-vite-config';

export default createGameViteConfig({
  gameName: 'thermodynamics-predictor',
  yearDir: '3-ar',
  gameDir: __dirname,
});
