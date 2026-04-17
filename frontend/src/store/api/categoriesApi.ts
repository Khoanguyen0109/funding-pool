import type { Category } from '@/types';
import { apiSlice } from './apiSlice';

interface CreateCategoryPayload {
  poolId: string;
  name: string;
  icon?: string;
  budgetAmount: number;
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
  }),
});

export const { useGetCategoriesQuery, useCreateCategoryMutation } = categoriesApi;
