import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrl } from '../utils/constants';
import { TPriceItem } from '../utils/types';

export const csvApi = createApi({
  reducerPath: 'csvApi',
  tagTypes: ['Csv'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrl }),
  endpoints: (builder) => ({
    // fetchCsvPrice: builder.mutation<Array<TPriceItem>, void>({
    //   query: () => ({
    //     url: '/csv',
    //     method: 'POST',
    //   }),
    // }),
  }),
});

// export const { useFetchCsvPriceMutation } = csvApi;
