var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import adaptRequest from "./requestAdapter";
import adaptResponse from "./responseAdapter";
import request from "./request";
function _get(engineKey, path, params) {
    const query = Object.entries(Object.assign({ engine_key: engineKey }, params))
        .map(([paramName, paramValue]) => {
        return `${paramName}=${encodeURIComponent(paramValue)}`;
    })
        .join("&");
    return fetch(`https://search-api.swiftype.com/api/v1/public/${path}?${query}`, {
        method: "GET",
        credentials: "include"
    });
}
class SiteSearchAPIConnector {
    constructor({ documentType, engineKey, beforeSearchCall = (queryOptions, next) => next(queryOptions), beforeAutocompleteResultsCall = (queryOptions, next) => next(queryOptions) }) {
        this.documentType = documentType;
        this.engineKey = engineKey;
        this.beforeSearchCall = beforeSearchCall;
        this.beforeAutocompleteResultsCall = beforeAutocompleteResultsCall;
        this.request = request.bind(this, engineKey);
        this._get = _get.bind(this, engineKey);
    }
    onResultClick({ query, documentId, tags }) {
        if (tags && tags.length > 0) {
            console.warn("search-ui-site-search-connector: Site Search does not support tags on click");
        }
        this._get("analytics/pc", {
            t: new Date().getTime(),
            q: query,
            doc_id: documentId
        });
    }
    onAutocompleteResultClick({ query, documentId, tags }) {
        if (tags) {
            console.warn("search-ui-site-search-connector: Site Search does not support tags on autocompleteClick");
        }
        this._get("analytics/pas", {
            t: new Date().getTime(),
            q: query,
            doc_id: documentId
        });
    }
    onSearch(requestState, queryConfig) {
        const options = adaptRequest(requestState, queryConfig, this.documentType);
        return this.beforeSearchCall(options, (newOptions) => this.request("POST", "engines/search.json", newOptions).then((json) => adaptResponse(json, this.documentType)));
    }
    onAutocomplete({ searchTerm }, queryConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            if (queryConfig.results) {
                const options = adaptRequest({ searchTerm }, queryConfig.results, this.documentType);
                return this.beforeAutocompleteResultsCall(options, (newOptions) => this.request("POST", "engines/suggest.json", newOptions).then((json) => ({
                    autocompletedResults: adaptResponse(json, this.documentType).results
                })));
            }
            if (queryConfig.suggestions) {
                console.warn("search-ui-site-search-connector: Site Search does support query suggestions on autocomplete");
            }
        });
    }
}
export default SiteSearchAPIConnector;
