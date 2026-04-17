import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Pool', 'User', 'Category', 'Contribution', 'Expense', 'Transaction', 'Dashboard', 'Invite', 'Member', 'PendingInvitation'],
  endpoints: () => ({}),
});
