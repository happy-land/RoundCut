import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '../utils/constants';
import { getCookie } from '../utils/cookie';

export const authApi = createApi({
  reducerPath: 'authApi',
  tagTypes: ['Auth'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrl }),
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (body: { email: string; username: string; password: string }) => ({
        url: '/auth/signup',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
    }),
    fetchToken: builder.mutation({
      query: (body: { username: string; password: string }) => ({
        url: '/auth/signin',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
      invalidatesTags: [{ type: 'Auth' }],
    }),
    fetchUser: builder.mutation({
      query: () => ({
        url: '/users/me',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${getCookie('accessToken')}`,
        },
      }),
      // providesTags
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useFetchTokenMutation,
  useFetchUserMutation,
} = authApi;
