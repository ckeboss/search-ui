var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import handleSearchRequest from "./handlers/search";
import handleAutocompleteRequest from "./handlers/autocomplete";
export * from "./types";
class ElasticsearchAPIConnector {
    constructor(config, postProcessRequestBodyFn) {
        this.config = config;
        this.postProcessRequestBodyFn = postProcessRequestBodyFn;
        if (!config.host && !config.cloud) {
            throw new Error("Either host or cloud configuration must be provided");
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onResultClick() { }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onAutocompleteResultClick() { }
    onSearch(state, queryConfig) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return handleSearchRequest({
                state,
                queryConfig,
                cloud: this.config.cloud,
                host: this.config.host,
                index: this.config.index,
                connectionOptions: {
                    apiKey: this.config.apiKey,
                    headers: (_a = this.config.connectionOptions) === null || _a === void 0 ? void 0 : _a.headers
                },
                postProcessRequestBodyFn: this.postProcessRequestBodyFn
            });
        });
    }
    onAutocomplete(state, queryConfig) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return handleAutocompleteRequest({
                state,
                queryConfig,
                cloud: this.config.cloud,
                host: this.config.host,
                index: this.config.index,
                connectionOptions: {
                    apiKey: this.config.apiKey,
                    headers: (_a = this.config.connectionOptions) === null || _a === void 0 ? void 0 : _a.headers
                }
            });
        });
    }
}
export default ElasticsearchAPIConnector;
