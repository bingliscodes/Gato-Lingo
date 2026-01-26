import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import { ChakraProvider } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";
import { system } from "./theme";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ChakraProvider value={system}>
        <ThemeProvider attribute="class" disableTransitionOnChange>
          <App />
        </ThemeProvider>
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
