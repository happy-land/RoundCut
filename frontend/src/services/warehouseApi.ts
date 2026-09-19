import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '../utils/constants';
import { getCookie } from '../utils/cookie';
import { TWarehouse } from '../utils/types';

export const warehouseApi = createApi({
  reducerPath: 'warehouseApi',
  tagTypes: ['Warehouses'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrl }), 
  endpoints: (builder) => ({
    fetchWarehouses: builder.query<Array<TWarehouse>, number>({
      query: () => ({
        url: `/warehouses`
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Warehouses' as const, id })),
              { type: 'Warehouses', id: 'LIST' },
            ]
          : [{ type: 'Warehouses', id: 'LIST' }],
    }),
    fetchWarehouseById: builder.query<TWarehouse, number>({
      query: (warehouseId) => ({
        url: `/warehouses/${warehouseId}`,
      })
    }),
    addWarehouse: builder.mutation({
      query: (body: { name: string }) => ({
        url: '/warehouses',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
      invalidatesTags: [{ type: 'Warehouses' }],
    }),
    deleteWarehouse: builder.mutation({
      query: (warehouseId) => ({
        url: `/warehouses/${warehouseId}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${getCookie('accessToken')}`,
        }
      }),
      invalidatesTags: [{ type: 'Warehouses', id: 'LIST' }],
    })
  })
});

export const {
  useFetchWarehousesQuery,
  useFetchWarehouseByIdQuery,
  useAddWarehouseMutation,
  useDeleteWarehouseMutation,
} = warehouseApi;