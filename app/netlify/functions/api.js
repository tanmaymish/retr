import serverless from 'serverless-http';
import express from 'express';
import { createApp } from '../../../server/src/app.js';
import { loadConfig } from '../../../server/src/config.js';

const config = loadConfig({
  ...process.env,
  NODE_ENV: 'production',
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_ThZNva4tybP0@ep-plain-dew-axuyme1t-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require",
});

const { app: mainApp } = createApp({ config });

const wrapper = express();
wrapper.use((req, _res, next) => {
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  next();
});
wrapper.use(mainApp);

export const handler = serverless(wrapper);
