import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '../utils/constants';
import { getCookie } from '../utils/cookie';
import { TAdminCategory } from '../utils/types';

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  tagTypes: ['Categories'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrl }),
  endpoints: (builder) => ({
    fetchCategories: builder.query<TAdminCategory[], number>({
      query: () => ({
        url: '/categories',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Categories' as const, id })),
              { type: 'Categories', id: 'LIST' },
            ]
          : [{ type: 'Categories', id: 'LIST' }],
    }),
    addCategory: builder.mutation({
      query: (body: { name: string }) => ({
        url: '/categories',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
      invalidatesTags: [{ type: 'Categories' }],
    }),
    deleteCategory: builder.mutation({
      query: (categoryId) => ({
        url: `/categories/${categoryId}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${getCookie('accessToken')}`,
        },
      }),
      invalidatesTags: [{ type: 'Categories', id: 'LIST' }],
    }),
  }),
});

export const {
  useFetchCategoriesQuery,
  useAddCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
