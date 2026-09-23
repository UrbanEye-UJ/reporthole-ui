"use client";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useState } from "react";

import { createQueryPersister, shouldPersistQuery } from "@/lib/queryPersist";

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    const [persister] = useState(() => createQueryPersister("reporthole-query-cache"));

    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister, dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery } }}
        >
            {children}
        </PersistQueryClientProvider>
    );
}
