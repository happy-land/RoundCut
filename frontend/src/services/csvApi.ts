import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../utils/constants";

export const csvApi = createApi({
  reducerPath: "csvApi",
  tagTypes: ["Csv"],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrl }),
  endpoints: () => ({}),
});
