// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";

import { ChakraProvider } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";
import { system } from "./theme";
import App from "./App";

import { UserContextProvider } from "@/contexts/UserContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UserContextProvider>
      <ChakraProvider value={system}>
        <ThemeProvider attribute="class" disableTransitionOnChange>
          <App />
        </ThemeProvider>
      </ChakraProvider>
    </UserContextProvider>
  </React.StrictMode>,
);
