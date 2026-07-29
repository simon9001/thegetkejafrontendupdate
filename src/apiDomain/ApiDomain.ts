const isProd = import.meta.env.PROD;

export const apiDomain = isProd
    ? 'https://getkejaupdate.onrender.com/api'
    : 'http://localhost:8000/api';
