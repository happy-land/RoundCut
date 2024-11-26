import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '../utils/constants';
import { TGoodsCutItem } from '../utils/types';

export const cutitemApi = createApi({
  reducerPath: 'cutitemApi',
  tagTypes: ['Cutitems'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrl }),
  endpoints: (builder) => ({
    addCutitem: builder.mutation({
      query: (body: TGoodsCutItem) => ({
        url: '/cutitems',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
      invalidatesTags: [{ type: 'Cutitems' }],
    }),
  }),
});

export const { useAddCutitemMutation } = cutitemApi;
