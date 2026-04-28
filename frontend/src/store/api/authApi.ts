import type { User, AuthResponse, LoginPayload, SignupPayload } from '@/types';
import { apiSlice } from './apiSlice';
import { setCredentials, setUser } from '@/store/authSlice';

const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginPayload>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials({ token: data.accessToken, user: data.user }));
      },
    }),

    signup: builder.mutation<AuthResponse, SignupPayload>({
      query: (data) => ({
        url: '/auth/signup',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials({ token: data.accessToken, user: data.user }));
      },
    }),

    getMe: builder.query<User, void>({
      query: () => '/auth/me',
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setUser(data));
      },
      providesTags: ['User'],
    }),

    patchMe: builder.mutation<User, { defaultPoolId?: string | null }>({
      query: (body) => ({
        url: '/auth/me',
        method: 'PATCH',
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setUser(data));
      },
      invalidatesTags: ['User', 'Dashboard'],
    }),
  }),
});

export const { useLoginMutation, useSignupMutation, useGetMeQuery, usePatchMeMutation } = authApi;
