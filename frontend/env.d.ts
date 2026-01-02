/// /<reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_SUPABASE_URL: string;
  readonly VITE_APP_SUPABASE_KEY: string;
  readonly VITE_BACKEND_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
