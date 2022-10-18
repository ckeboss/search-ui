import type { AutocompleteQueryConfig, AutocompleteResponseState, RequestState } from "@elastic/search-ui";
import { CloudHost } from "../../types";
interface AutocompleteHandlerConfiguration {
    state: RequestState;
    queryConfig: AutocompleteQueryConfig;
    cloud?: CloudHost;
    host?: string;
    index: string;
    connectionOptions?: {
        apiKey?: string;
        headers?: Record<string, string>;
    };
}
export default function handleRequest(configuration: AutocompleteHandlerConfiguration): Promise<AutocompleteResponseState>;
export {};
