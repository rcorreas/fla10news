"use server";

import { incrementDailyViews } from "@/data/analytics";

export async function trackPageView() {
    await incrementDailyViews();
}
