import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '../utils/constants';
import { getCookie } from '../utils/cookie';

export const authApi = createApi({
  reducerPath: 'authApi',
  tagTypes: ['Auth'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrl }),
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (body: { email: string; password: string }) => ({
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
    sendResetPasswordLinkByEmail: builder.mutation({
      query: (body: { email: string }) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
      invalidatesTags: [{ type: 'Auth' }],
    }),
    resetPassword: builder.mutation({
      query: (body: { password: string, token: string }) => ({
        url: '/auth/reset-password',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
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
    }),

    updateMe: builder.mutation({
      query: (body: { about?: string; username?: string }) => ({
        url: '/users/me',
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${getCookie('accessToken')}`,
        },
        body,
      }),
    }),

  }),
});

export const {
  useRegisterUserMutation,
  useFetchTokenMutation,
  useSendResetPasswordLinkByEmailMutation,
  useResetPasswordMutation,
  useFetchUserMutation,
  useUpdateMeMutation,
} = authApi;
