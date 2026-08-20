"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/app/actions/analytics";

function Tracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Skip tracking for admin pages to avoid skewing stats
        if (pathname && !pathname.startsWith('/admin')) {
            trackPageView().catch(console.error);
        }
    }, [pathname, searchParams]);

    return null;
}

export function ViewTracker() {
    return (
        <Suspense fallback={null}>
            <Tracker />
        </Suspense>
    );
}
