import type { Contribution } from '@/types';
import { apiSlice } from './apiSlice';

interface CreateContributionPayload {
  poolId: string;
  amount: number;
  note?: string;
  transactionDate?: string;
}

const contributionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getContributions: builder.query<Contribution[], string>({
      query: (poolId) => `/pools/${poolId}/contributions`,
      providesTags: (_result, _error, poolId) => [{ type: 'Contribution', id: poolId }],
    }),
    createContribution: builder.mutation<Contribution, CreateContributionPayload>({
      query: ({ poolId, ...body }) => ({
        url: `/pools/${poolId}/contributions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { poolId }) => [
        { type: 'Contribution', id: poolId },
        { type: 'Transaction', id: poolId },
        { type: 'Pool', id: poolId },
        { type: 'Pool', id: 'LIST' },
        'Dashboard',
      ],
    }),
  }),
});

export const { useGetContributionsQuery, useCreateContributionMutation } = contributionsApi;
