import "../styles/globals.css";

import React from "react";
import { NextAdapter } from "next-query-params";
import { QueryParamProvider } from "use-query-params";

function MyApp({ Component, pageProps }) {
  return (
    <QueryParamProvider adapter={NextAdapter}>
      <Component {...pageProps} />
    </QueryParamProvider>
  );
}

export default MyApp;
