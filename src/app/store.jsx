import { configureStore } from "@reduxjs/toolkit";
import { prayertimingsApi } from "./clientQuery";
const store = configureStore({
  reducer: {
    [prayertimingsApi.reducerPath]: prayertimingsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(prayertimingsApi.middleware),
});

export default store;
