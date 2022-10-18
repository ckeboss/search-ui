export default function AnalyticsPlugin(options = { client: undefined }) {
    const client = options.client ||
        (typeof window !== "undefined" && window["elasticAnalytics"]);
    if (!client) {
        throw new Error("Analytics client not found. Please provide a client or install the Elastic Analytics library.");
    }
    return {
        subscribe: (event) => {
            const eventTypeMap = {
                AutocompleteSuggestionSelected: "click",
                FacetFilterRemoved: "click",
                FacetFilterSelected: "click",
                ResultSelected: "click",
                SearchQuery: "search"
            };
            client.trackEvent(eventTypeMap[event.type], event);
        }
    };
}
