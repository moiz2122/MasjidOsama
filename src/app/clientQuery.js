import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const prayertimingsApi = createApi({
  reducerPath: "prayertimingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/",
  }),
  endpoints: (builder) => ({
    getPrayerTime: builder.query({
      query: (city) => `${city}`,
    }),
  }),
});

export const { useGetPrayerTimeQuery } = prayertimingsApi;
