const isProd = import.meta.env.PROD;

export const apiDomain = isProd
    ? 'https://your-production-backend.com/api' // Replace when ready
    : 'http://localhost:8000/api';
