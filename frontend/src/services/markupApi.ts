import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '../utils/constants';
import { TMarkup } from '../utils/types';

export const markupApi = createApi({
  reducerPath: 'markupApi',
  tagTypes: ['Markups'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrl }),
  endpoints: (builder) => ({
    fetchMarkups: builder.query<Array<TMarkup>, number>({
      query: () => ({
        url: '/markups',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Warehouses' as const, id })),
              { type: 'Warehouses', id: 'LIST' },
            ]
          : [{ type: 'Warehouses', id: 'LIST' }],
    }),

    addMarkup: builder.mutation({
      query: (body: TMarkup) => ({
        url: '/markups',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
      invalidatesTags: [{ type: 'Markups' }],
    }),

    getMarkupByWarehouseId: builder.query<TMarkup, number>({
      query: (warehouseId: number) => ({
        url: `/markups/warehouse/${warehouseId}`,
      }),
    }),

  }),
});

export const {
  useFetchMarkupsQuery,
  useGetMarkupByWarehouseIdQuery,
  useAddMarkupMutation,
} = markupApi;
