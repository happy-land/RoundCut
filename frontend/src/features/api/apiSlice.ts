import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl, testUser } from '../../utils/constants';
import { getCookie } from '../../utils/cookie';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: baseUrl }),
  endpoints: (builder) => ({
    getPriceitems: builder.query({
      query: () => '/priceitems',
    }),
    getPriceItem: builder.query({
      query: (itemId) => `/priceitems/${itemId}`,
    }),
    signin: builder.mutation({
      query: () => ({
        url: '/signin',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: testUser,
      }),
    }),
    getOwnUser: builder.query({
      query: () => ({
        url: '/users/me',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${getCookie('accessToken')}`,
        },
      }),
    }),
    getUsers: builder.query({
      query: () => '/users',
    }),
  }),
});

export const {
  useGetPriceitemsQuery,
  useGetPriceItemQuery,
  useSigninMutation,
  useGetOwnUserQuery,
  useGetUsersQuery,
} = apiSlice;
