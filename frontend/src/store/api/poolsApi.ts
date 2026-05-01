import type { Pool } from '@/types';
import { apiSlice } from './apiSlice';

interface CreatePoolPayload {
  name: string;
  description?: string;
  icon: string;
  color: string;
  currency: string;
  type: 'private' | 'shared';
  requireApproval?: boolean;
  approvalThreshold?: number;
}

const poolsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPools: builder.query<Pool[], void>({
      query: () => '/pools',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Pool' as const, id })),
              { type: 'Pool', id: 'LIST' },
            ]
          : [{ type: 'Pool', id: 'LIST' }],
    }),

    getPool: builder.query<Pool, string>({
      query: (id) => `/pools/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Pool', id }],
    }),

    createPool: builder.mutation<Pool, CreatePoolPayload>({
      query: (body) => ({
        url: '/pools',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Pool', id: 'LIST' }, 'Dashboard'],
    }),

    deletePool: builder.mutation<{ deleted: boolean }, string>({
      query: (id) => ({
        url: `/pools/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Pool', id: 'LIST' }, { type: 'Pool', id }, 'Dashboard'],
    }),
  }),
});

export const { useGetPoolsQuery, useGetPoolQuery, useCreatePoolMutation, useDeletePoolMutation } =
  poolsApi;
