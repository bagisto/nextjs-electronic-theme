"use client";

import { ReactNode } from "react";
import { ApolloWrapper } from "./ApolloWrapper";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { SessionProvider } from './SessionProvider';
import { SessionSync } from "./SessionSync";
import { ToastProvider } from "./ToastProvider";
import { GlobalContextProvider } from "./GlobalContextProvider";

const MainProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider>
      <Provider store={store}>
        <SessionSync />
        <GlobalContextProvider>
          <ToastProvider>
            <ApolloWrapper>{children}</ApolloWrapper>
          </ToastProvider>
        </GlobalContextProvider>
      </Provider>
    </SessionProvider>
  );
};

export { MainProvider };
