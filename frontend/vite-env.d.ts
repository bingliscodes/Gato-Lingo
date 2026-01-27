// Source - https://stackoverflow.com/a
// Posted by Menial Orchestra
// Retrieved 2026-01-26, License - CC BY-SA 4.0

interface ImportMetaEnv {
  readonly VITE_YOUR_URL: string;
  readonly VITE_REALM: string;
  readonly VITE_CLIENT_ID: string;
  readonly VITE_API_BASE_URL: string;
 
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
