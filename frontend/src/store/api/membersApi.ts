import type { PoolMembership } from '@/types';
import { apiSlice } from './apiSlice';

const membersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPendingMembers: builder.query<PoolMembership[], string>({
      query: (poolId) => `/pools/${poolId}/members/pending`,
      providesTags: (_result, _error, poolId) => [{ type: 'Member', id: `pending-${poolId}` }],
    }),

    approveMember: builder.mutation<PoolMembership, { poolId: string; userId: string }>({
      query: ({ poolId, userId }) => ({
        url: `/pools/${poolId}/members/${userId}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, { poolId }) => [
        { type: 'Member', id: `pending-${poolId}` },
        { type: 'Pool', id: poolId },
      ],
    }),

    rejectMember: builder.mutation<void, { poolId: string; userId: string }>({
      query: ({ poolId, userId }) => ({
        url: `/pools/${poolId}/members/${userId}/reject`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, { poolId }) => [
        { type: 'Member', id: `pending-${poolId}` },
      ],
    }),
  }),
});

export const {
  useGetPendingMembersQuery,
  useApproveMemberMutation,
  useRejectMemberMutation,
} = membersApi;
