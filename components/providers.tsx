"use client";

import "@/lib/polyfills";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";
import { Web3Provider } from "./providers/Web3Provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      enabled: typeof window !== "undefined",
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      disableTransitionOnChange
      enableSystem
      attribute="class"
      defaultTheme="dark"
    >
      <QueryClientProvider client={queryClient}>
        <Web3Provider>
          <Toaster />
          {children}
        </Web3Provider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
