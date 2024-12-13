import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '../utils/constants';
import { getCookie } from '../utils/cookie';
import { TPriceItem, TPriceItemExtended } from '../utils/types';

export const priceApi = createApi({
  reducerPath: 'priceApi',
  tagTypes: ['Items'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrl }),
  endpoints: (builder) => ({
    fetchItems: builder.query<Array<TPriceItemExtended>, string>({
      query: (query = '') => ({
        url: `/priceitems?${query}`
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Items' as const, id })),
              { type: 'Items', id: 'LIST' },
            ]
          : [{ type: 'Items', id: 'LIST' }],
    }),
    fetchItem: builder.query({
      query: (itemId) => `/priceitems/${itemId}`,
    }),
    deleteItem: builder.mutation({
      query: (itemId) => ({
        url: `/priceitems/${itemId}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${getCookie('accessToken')}`,
        },
      }),
      invalidatesTags: [{ type: 'Items', id: 'LIST' }],
    }),
    deleteAllItems: builder.mutation({
      query: () => ({
        url: '/priceitems/all',
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${getCookie('accessToken')}`,
        },
      }),
      invalidatesTags: [{ type: 'Items', id: 'LIST' }],
    }),
    fetchCsvPrice: builder.mutation({
      query: () => ({
        url: '/csv',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${getCookie('accessToken')}`,
        },
      }),
      invalidatesTags: [{ type: 'Items', id: 'LIST' }],
    }),
  }),
});

export const {
  useFetchItemsQuery,
  useFetchItemQuery,
  useDeleteItemMutation,
  useDeleteAllItemsMutation,
  useFetchCsvPriceMutation,
} = priceApi;
