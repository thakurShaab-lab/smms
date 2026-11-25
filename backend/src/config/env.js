import 'dotenv/config';

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === null || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function list(name, fallback = '') {
  return String(process.env[name] ?? fallback)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT || 4000),
  apiBasePath: process.env.API_BASE_PATH || '/api/v1',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  db: {
    host: required('DB_HOST', '127.0.0.1'),
    port: Number(process.env.DB_PORT || 3306),
    user: required('DB_USER', 'root'),
    password: process.env.DB_PASSWORD || '',
    database: required('DB_NAME', 'smms'),
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 20)
  },

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },

  argon2: {
    memoryCost: Number(process.env.ARGON2_MEMORY_COST || 19456),
    timeCost: Number(process.env.ARGON2_TIME_COST || 2),
    parallelism: Number(process.env.ARGON2_PARALLELISM || 1)
  },

  localStorage: {
    uploadDir: process.env.LOCAL_STORAGE_DIR || 'uploads',
    // Base URL other services (Python AI) and the browser use to reach this
    // backend's file-serving route. Must be resolvable by whichever process
    // is fetching the file, not just the backend itself.
    publicBaseUrl: process.env.LOCAL_STORAGE_PUBLIC_BASE_URL || `http://127.0.0.1:${process.env.PORT || 4000}`,
    signingSecret: required('LOCAL_STORAGE_SIGNING_SECRET'),
    signedUrlExpiresIn: Number(process.env.LOCAL_STORAGE_SIGNED_URL_EXPIRES_IN || 3600)
  },

  pythonAi: {
    baseUrl: process.env.PYTHON_AI_BASE_URL || 'http://127.0.0.1:8000',
    timeoutMs: Number(process.env.PYTHON_AI_TIMEOUT_MS || 120000),
    apiKey: process.env.PYTHON_AI_API_KEY || ''
  },

  uploads: {
    maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB || 500),
    allowedImageTypes: list('ALLOWED_IMAGE_TYPES', 'image/jpeg,image/png,image/webp'),
    allowedVideoTypes: list('ALLOWED_VIDEO_TYPES', 'video/mp4,video/quicktime,video/x-matroska'),
    allowedDocumentTypes: list(
      'ALLOWED_DOCUMENT_TYPES',
      'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ),
    allowedAudioTypes: list('ALLOWED_AUDIO_TYPES', 'audio/mpeg,audio/mp4,audio/wav,audio/x-m4a')
  }
};