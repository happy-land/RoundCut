import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '../utils/constants';
import { TAdminCut } from '../utils/types';

export const adminCutApi = createApi({
  reducerPath: 'adminCutApi',
  tagTypes: ['AdminCuts'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrl }),
  endpoints: (builder) => ({
    fetchAdminCuts: builder.query<TAdminCut[], number>({
      query: () => ({
        url: '/cuts',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'AdminCuts' as const, id })),
              { type: 'AdminCuts', id: 'LIST' },
            ]
          : [{ type: 'AdminCuts', id: 'LIST' }],
    }),
    addAdminCut: builder.mutation({
      query: (body: { name: string }) => ({
        url: '/cuts',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
      invalidatesTags: [{ type: 'AdminCuts' }],
    }),
  }),
});

export const { useFetchAdminCutsQuery, useAddAdminCutMutation } = adminCutApi;
