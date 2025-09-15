import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';

const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: () => ({}),
});

export default api;
