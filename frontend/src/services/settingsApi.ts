import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '../utils/constants';
import { getCookie } from '../utils/cookie';

export const settingsApi = createApi({
  reducerPath: 'settingsApi',
  tagTypes: ['Settings'],
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getSettings: builder.query<Record<string, string>, void>({
      query: () => '/settings',
      providesTags: ['Settings'],
    }),
    updateSetting: builder.mutation<void, { key: string; value: string }>({
      query: ({ key, value }) => ({
        url: `/settings/${key}`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getCookie('accessToken')}`,
        },
        body: { value },
      }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingMutation } = settingsApi;
