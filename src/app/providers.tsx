"use client";

import React from 'react';
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const LineaSepolia = {
  chainId: 59141, // Linea Sepolia chain ID
  rpc: ["https://rpc.sepolia.linea.build"],
  nativeCurrency: {
    name: "Linea Ether",
    symbol: "ETH",
    decimals: 18,
  },
  shortName: "linea-sepolia",
  slug: "linea-sepolia",
  testnet: true,
  chain: "Linea Sepolia",
  name: "Linea Sepolia Testnet"
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider
        clientId={process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
        activeChain={LineaSepolia}
      >
        {children}
      </ThirdwebProvider>
    </QueryClientProvider>
  );
} 