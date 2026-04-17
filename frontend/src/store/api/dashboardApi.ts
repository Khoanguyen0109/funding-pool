import type { DashboardResponse } from '@/types';
import { apiSlice } from './apiSlice';

const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardResponse, void>({
      query: () => '/dashboard',
      providesTags: [{ type: 'Pool', id: 'LIST' }, 'Dashboard'],
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
