import type { Event } from "@elastic/search-ui";
export declare type EventType = "search" | "click" | "pageview";
export declare type AnalyticsClient = {
    trackEvent: (eventType: EventType, payload: Record<string, any>) => void;
};
export interface AnalyticsPluginOptions {
    client?: AnalyticsClient;
}
export default function AnalyticsPlugin(options?: {
    client: any;
}): {
    subscribe: (event: Event) => void;
};
