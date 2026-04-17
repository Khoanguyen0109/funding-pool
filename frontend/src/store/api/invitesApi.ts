import type { Invite, InvitePreview, InviteType, PendingInvitation, PoolMembership } from '@/types';
import { apiSlice } from './apiSlice';

interface CreateInvitePayload {
  poolId: string;
  type: InviteType;
  inviteeId?: string;
}

const invitesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createInvite: builder.mutation<Invite, CreateInvitePayload>({
      query: ({ poolId, ...body }) => ({
        url: `/pools/${poolId}/invites`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { poolId }) => [{ type: 'Invite', id: poolId }],
    }),

    getInvites: builder.query<Invite[], string>({
      query: (poolId) => `/pools/${poolId}/invites`,
      providesTags: (_result, _error, poolId) => [{ type: 'Invite', id: poolId }],
    }),

    revokeInvite: builder.mutation<void, { poolId: string; inviteId: string }>({
      query: ({ poolId, inviteId }) => ({
        url: `/pools/${poolId}/invites/${inviteId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { poolId }) => [{ type: 'Invite', id: poolId }],
    }),

    getInvitePreview: builder.query<InvitePreview, string>({
      query: (token) => `/invites/${token}`,
    }),

    redeemInvite: builder.mutation<PoolMembership, string>({
      query: (token) => ({
        url: `/invites/${token}/redeem`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Pool', id: 'LIST' }, 'Dashboard', 'PendingInvitation'],
    }),

    getMyInvitations: builder.query<PendingInvitation[], void>({
      query: () => '/users/me/invitations',
      providesTags: ['PendingInvitation'],
    }),
  }),
});

export const {
  useCreateInviteMutation,
  useGetInvitesQuery,
  useRevokeInviteMutation,
  useGetInvitePreviewQuery,
  useRedeemInviteMutation,
  useGetMyInvitationsQuery,
} = invitesApi;
