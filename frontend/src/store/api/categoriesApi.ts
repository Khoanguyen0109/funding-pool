import type { Category } from '@/types';
import { apiSlice } from './apiSlice';

interface CreateCategoryPayload {
  poolId: string;
  name: string;
  icon?: string;
  budgetAmount: number;
  sortOrder?: number;
}

interface UpdateCategoryPayload {
  poolId: string;
  categoryId: string;
  name?: string;
  icon?: string;
  budgetAmount?: number;
  sortOrder?: number;
}

const categoriesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], string>({
      query: (poolId) => `/pools/${poolId}/categories`,
      providesTags: (_result, _error, poolId) => [{ type: 'Category', id: poolId }],
    }),
    createCategory: builder.mutation<Category, CreateCategoryPayload>({
      query: ({ poolId, ...body }) => ({
        url: `/pools/${poolId}/categories`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { poolId }) => [
        { type: 'Category', id: poolId },
        { type: 'Pool', id: poolId },
      ],
    }),
    updateCategory: builder.mutation<Category, UpdateCategoryPayload>({
      query: ({ poolId, categoryId, ...body }) => ({
        url: `/pools/${poolId}/categories/${categoryId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { poolId }) => [
        { type: 'Category', id: poolId },
        { type: 'Pool', id: poolId },
        'Dashboard',
      ],
    }),
    deleteCategory: builder.mutation<{ expenseCount: number }, { poolId: string; categoryId: string }>({
      query: ({ poolId, categoryId }) => ({
        url: `/pools/${poolId}/categories/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { poolId }) => [
        { type: 'Category', id: poolId },
        { type: 'Pool', id: poolId },
        { type: 'Transaction', id: poolId },
        'Dashboard',
      ],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
