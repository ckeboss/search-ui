import type { QueryConfig, RequestState, ResponseState } from "@elastic/search-ui";
import { CloudHost, PostProcessRequestBodyFn } from "../../types";
interface SearchHandlerConfiguration {
    state: RequestState;
    queryConfig: QueryConfig;
    cloud?: CloudHost;
    host?: string;
    index: string;
    connectionOptions?: {
        apiKey?: string;
        headers?: Record<string, string>;
    };
    postProcessRequestBodyFn?: PostProcessRequestBodyFn;
}
export default function handleRequest(configuration: SearchHandlerConfiguration): Promise<ResponseState>;
export {};
