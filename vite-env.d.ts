/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PLANT_ID_API_KEY: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_KEY: string
  readonly PORT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Allow importing image files
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
