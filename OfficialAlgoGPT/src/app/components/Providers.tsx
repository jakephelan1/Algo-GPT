"use client";

import { FC, ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MessagesProvider } from "@/context/messages";

interface ProvidersProps {
  children: ReactNode;
}

const Providers: FC<ProvidersProps> = ({ children }) => {
  // ✅ Create `QueryClient` only once (persists across re-renders)
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <MessagesProvider>{children}</MessagesProvider>
    </QueryClientProvider>
  );
};

export default Providers;
