import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../utils/constants";
import { TAdminCut } from "../utils/types";

export const adminCutApi = createApi({
  reducerPath: "adminCutApi",
  tagTypes: ["AdminCuts"],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrl }),
  endpoints: (builder) => ({
    fetchAdminCuts: builder.query<TAdminCut[], number>({
      query: () => ({
        url: "/cuts",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "AdminCuts" as const, id })),
              { type: "AdminCuts", id: "LIST" },
            ]
          : [{ type: "AdminCuts", id: "LIST" }],
    }),
    addAdminCut: builder.mutation({
      query: (body: { name: string; code?: string; profile?: string }) => ({
        url: "/cuts",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      invalidatesTags: [{ type: "AdminCuts" }],
    }),
    updateAdminCut: builder.mutation({
      query: ({
        id,
        body,
      }: {
        id: number;
        body: { name: string; profile?: string; code?: string };
      }) => ({
        url: `/cuts/${id}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      invalidatesTags: [{ type: "AdminCuts" }],
    }),
    deleteAdminCut: builder.mutation({
      query: (id: number) => ({
        url: `/cuts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "AdminCuts" }],
    }),
  }),
});

export const {
  useFetchAdminCutsQuery,
  useAddAdminCutMutation,
  useUpdateAdminCutMutation,
  useDeleteAdminCutMutation,
} = adminCutApi;
