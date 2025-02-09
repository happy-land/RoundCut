import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '../utils/constants';
import { getCookie } from '../utils/cookie';
import { TPriceItem, TPriceItemExtendedResponse, TPriceItemResponse } from '../utils/types';

export const priceApi = createApi({
  reducerPath: 'priceApi',
  tagTypes: ['Items'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrl }),
  endpoints: (builder) => ({
    fetchItems: builder.query<Array<TPriceItemExtendedResponse>, number>({
      query: (warehouseId = 202) => ({
        url: `/priceitems?warehouseId=${warehouseId}`,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Items' as const, id })),
              { type: 'Items', id: 'LIST' },
            ]
          : [{ type: 'Items', id: 'LIST' }],
    }),
    fetchItem: builder.query<TPriceItemExtendedResponse, number>({
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
    extractData: builder.mutation({
      query: () => ({
        url: '/csv/extract',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${getCookie('accessToken')}`,
        },
      }),
    }),
    // item() добавление нового товара в БД
    item: builder.mutation({
      query: (body: TPriceItem) => ({
        url: '/priceitems',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${getCookie('accessToken')}`,
        },
        body,
      }),
      invalidatesTags: [{ type: 'Items' }],
    }),
    // items() добавление всех товаров в БД
    items: builder.mutation({
      query: (body: TPriceItemResponse[]) => ({
        url: '/priceitems/all',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${getCookie('accessToken')}`,
        },
        body,
      }),
      invalidatesTags: [{ type: 'Items' }],
    }),
    // удалить fetchCsvPrice
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
  useExtractDataMutation,
  useFetchCsvPriceMutation,
  useItemMutation,
  useItemsMutation,
} = priceApi;
