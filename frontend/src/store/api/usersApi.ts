import type { User } from '@/types';
import { apiSlice } from './apiSlice';

const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchUsers: builder.query<User[], string>({
      query: (q) => `/users/search?q=${encodeURIComponent(q)}`,
      keepUnusedDataFor: 30,
    }),
  }),
});

export const { useSearchUsersQuery, useLazySearchUsersQuery } = usersApi;
