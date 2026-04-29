/// <reference types="astro/client" />

type Runtime = import('@astrojs/cloudflare').Runtime<{
  DB: import('./lib/db').D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}>;

declare namespace App {
  interface Locals extends Runtime {
    user?: import('./lib/auth').User | null;
  }
}
