import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../utils/constants";
import { TCutitemWithCut, TGoodsCutItem } from "../utils/types";

export const cutitemApi = createApi({
  reducerPath: "cutitemApi",
  tagTypes: ["Cutitems"],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrl }),
  endpoints: (builder) => ({
    addCutitem: builder.mutation({
      query: (body: TGoodsCutItem) => ({
        url: "/cutitems",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      invalidatesTags: [{ type: "Cutitems" }],
    }),

    getCutitemByParameters: builder.query<
      TGoodsCutItem,
      { warehouseId: number; sizeNum: number }
    >({
      query: ({ warehouseId, sizeNum }) => ({
        // url: `/cutitems/warehouse/${warehouseId}/size/${sizeNum}`,
        url: `/cutitems/find?warehouseId=${warehouseId}&sizeNum=${sizeNum}`,
      }),
    }),
    // TODO сделать на бэке новый эндпоинт для получения всех cutitem, подходящих под параметры,
    // то есть выбрать все возможные варианты резки для данного размера и склада, а на фронте уже выбирать оптимальный
    getCutitemsByParameters: builder.query<
      TCutitemWithCut[],
      { warehouseId: number; sizeNum: number }
    >({
      query: ({ warehouseId, sizeNum }) => ({
        url: `/cutitems/findAll?warehouseId=${warehouseId}&sizeNum=${sizeNum}`,
      }),
    }),
  }),
});

export const {
  useAddCutitemMutation,
  useGetCutitemByParametersQuery,
  useGetCutitemsByParametersQuery,
} = cutitemApi;
