import { createApp } from '../server/src/app.js';
import { loadConfig } from '../server/src/config.js';

const config = loadConfig({
  ...process.env,
  NODE_ENV: 'production',
});

const { app } = createApp({ config });

export default app;
