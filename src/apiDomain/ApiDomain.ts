const isProd = import.meta.env.PROD;

export const apiDomain = isProd
    ? 'https://houserentbackend-h6xy.onrender.com/api'
    : 'http://localhost:8000/api';
