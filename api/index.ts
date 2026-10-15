import app, { ensureInitialized } from '../server/app.js';

export default async function handler(req: any, res: any) {
  // Ensure database and accounts are initialized in serverless context
  await ensureInitialized().catch(() => {});
  return app(req, res);
}
