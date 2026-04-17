import type { Expense } from '@/types';
import { apiSlice } from './apiSlice';

interface CreateExpensePayload {
  poolId: string;
  amount: number;
  description: string;
  categoryId: string;
  transactionDate?: string;
  receiptUrl?: string;
}

const expensesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query<Expense[], string>({
      query: (poolId) => `/pools/${poolId}/expenses`,
      providesTags: (_result, _error, poolId) => [{ type: 'Expense', id: poolId }],
    }),
    createExpense: builder.mutation<Expense, CreateExpensePayload>({
      query: ({ poolId, ...body }) => ({
        url: `/pools/${poolId}/expenses`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { poolId }) => [
        { type: 'Expense', id: poolId },
        { type: 'Transaction', id: poolId },
        { type: 'Pool', id: poolId },
        { type: 'Pool', id: 'LIST' },
        'Dashboard',
      ],
    }),
  }),
});

export const { useGetExpensesQuery, useCreateExpenseMutation } = expensesApi;
