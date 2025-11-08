import { app } from './app.js';
import { ENV } from './utils/env.js';
import http from 'node:http';

const server = http.createServer(async (req, res) => {
  try {
    const protocol = (req.socket as any).encrypted ? 'https' : 'http';
    const host = req.headers.host ?? `localhost:${ENV.PORT}`;
    const url = `${protocol}://${host}${req.url ?? '/'}`;

    // Use the global Request constructor at runtime; cast to any to avoid TS type issues
    const RequestCtor: any = (globalThis as any).Request;
    const request = new RequestCtor(url, {
      method: req.method,
      headers: req.headers as any,
      // for non-GET/HEAD, forward the incoming socket stream as body
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : (req as any),
    });

    const response = await app.fetch(request);

    // Write status and headers
    res.writeHead(response.status, Object.fromEntries(response.headers));

    // Send body as a single buffer (simpler and reliable)
    const buffer = Buffer.from(await response.arrayBuffer());
    res.end(buffer);
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.listen(ENV.PORT, () => {
  console.log(`api.ansiversa listening on http://localhost:${ENV.PORT}`);
});
