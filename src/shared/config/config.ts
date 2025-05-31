// src/lib/client/config.ts
import {
  PUBLIC_API_URL,
  PUBLIC_APP_NAME,
  PUBLIC_BASE_FILES_URL,
  PUBLIC_STRIPE_PUBLIC_KEY
} from '$env/static/public';

export const GlobalConfig = {
  apiUrl: PUBLIC_API_URL,
  appName: PUBLIC_APP_NAME,
  // Если нужно резервное значение, можно оставить оператор ??,
  // но обычно PUBLIC_BASE_FILES_URL всегда задана.
  baseFilesUrl: PUBLIC_BASE_FILES_URL ?? 'https://localhost:8000/api/files/download/',
  stripePublicKey: PUBLIC_STRIPE_PUBLIC_KEY
};
