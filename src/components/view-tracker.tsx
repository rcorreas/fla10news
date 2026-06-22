"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/app/actions/analytics";

export function ViewTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Skip tracking for admin pages to avoid skewing stats
        if (pathname && !pathname.startsWith('/admin')) {
            trackPageView().catch(console.error);
        }
    }, [pathname]);

    return null;
}
