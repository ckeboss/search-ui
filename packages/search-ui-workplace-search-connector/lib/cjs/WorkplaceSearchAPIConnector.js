"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const query_string_1 = __importDefault(require("query-string"));
const responseAdapter_1 = require("./responseAdapter");
const requestAdapters_1 = require("./requestAdapters");
const buildResponseAdapterOptions_1 = __importDefault(require("./buildResponseAdapterOptions"));
const search_ui_1 = require("@elastic/search-ui");
const version_1 = require("./version");
// The API will error out if empty facets or filters objects are sent,
// or if disjunctiveFacets or disjunctiveFacetsAnalyticsTags are sent.
function removeInvalidFields(options) {
    const { facets, filters, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    disjunctiveFacets, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    disjunctiveFacetsAnalyticsTags } = options, rest = __rest(options, ["facets", "filters", "disjunctiveFacets", "disjunctiveFacetsAnalyticsTags"]);
    if (disjunctiveFacets) {
        console.warn("search-ui-workplace-search-connector: disjunctiveFacets are not supported by Workplace Search");
    }
    if (disjunctiveFacetsAnalyticsTags) {
        console.warn("search-ui-workplace-search-connector: disjunctiveFacetsAnalyticsTags are not supported by Workplace Search");
    }
    return Object.assign(Object.assign(Object.assign({}, (facets && Object.entries(facets).length > 0 && { facets })), (filters && Object.entries(filters).length > 0 && { filters })), rest);
}
class WorkplaceSearchAPIConnector {
    /**
     * @param {Options} options
     */
    constructor({ kibanaBase, enterpriseSearchBase, redirectUri, clientId, beforeSearchCall = (queryOptions, next) => next(queryOptions), beforeAutocompleteResultsCall = (queryOptions, next) => next(queryOptions), beforeAutocompleteSuggestionsCall = (queryOptions, next) => next(queryOptions) }) {
        if (!kibanaBase || !enterpriseSearchBase || !redirectUri || !clientId) {
            throw Error("Missing a required parameter. Please provide kibanaBase, enterpriseSearchBase, redirectUri, and clientId.");
        }
        const authorizeUrl = `${kibanaBase}/app/enterprise_search/workplace_search/p/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token`;
        // We need to logout from both application: Kibana, because a user can get a new access token with it,
        // and Enterprise Search, because it serves the default search experience with the same data.
        // There are 2 logout urls: [kibanaBase]/logout and [enterpriseSearchBase]/logout
        // Hitting the Kibana logout only logs out of Kibana, but hitting the Enterprise Search logout logs out of both Entperise Search and Kibana.
        // That's why we use [enterpriseSearchBase]/logout as the logout url.
        const logoutUrl = `${enterpriseSearchBase}/logout`;
        // There are 3 ways the initial load might happen:
        // 1) First load: there is no accessToken in localStorage
        // 2) Second+ load: there is an accessToken in localStorage
        // 3) Returning from OAuth: the new accessToken is in the URL, the old one is not relevant anymore
        // First, we get the accessToken from the URL
        const parsedUrlHash = query_string_1.default.parse(window.location.hash);
        const accessTokenFromUrl = Array.isArray(parsedUrlHash.access_token)
            ? "" // we don't expect multiple access tokens
            : parsedUrlHash.access_token;
        // TODO: maybe clear the URL afterwards?
        // If access_token is in url, that means we're returning from OAuth, so we add new accessToken to localStorage
        if (accessTokenFromUrl) {
            this.accessToken = accessTokenFromUrl;
        }
        // Now we can work with only localStorage
        // Setting loggedIn based on whether we have an accessToken there
        this.state = {
            authorizeUrl,
            isLoggedIn: !!this.accessToken || false
        };
        this.actions = {
            logout: () => {
                this.accessToken = null;
                this.state.isLoggedIn = false;
                window.location.href = logoutUrl;
            }
        };
        this.enterpriseSearchBase = enterpriseSearchBase;
        this.beforeSearchCall = beforeSearchCall;
        this.beforeAutocompleteResultsCall = beforeAutocompleteResultsCall;
        this.beforeAutocompleteSuggestionsCall = beforeAutocompleteSuggestionsCall;
    }
    // get accessToken from localStorage
    get accessToken() {
        return localStorage.getItem("SearchUIWorkplaceSearchAccessToken");
    }
    // save accessToken to localStorage
    set accessToken(token) {
        if (token) {
            localStorage.setItem("SearchUIWorkplaceSearchAccessToken", token);
        }
        else {
            localStorage.removeItem("SearchUIWorkplaceSearchAccessToken");
        }
    }
    onResultClick({ documentId, requestId, result, page, resultsPerPage, resultIndexOnPage }) {
        const apiUrl = `${this.enterpriseSearchBase}/api/ws/v1/analytics/event`;
        this.performFetchRequest(apiUrl, {
            type: "click",
            document_id: documentId,
            query_id: requestId,
            content_source_id: result === null || result === void 0 ? void 0 : result._meta.content_source_id,
            page: page,
            rank: (page - 1) * resultsPerPage + resultIndexOnPage,
            event: "search-ui-result-click"
        });
    }
    onAutocompleteResultClick({ documentId, requestId, result, resultIndex }) {
        const apiUrl = `${this.enterpriseSearchBase}/api/ws/v1/analytics/event`;
        this.performFetchRequest(apiUrl, {
            type: "click",
            document_id: documentId,
            query_id: requestId,
            content_source_id: result === null || result === void 0 ? void 0 : result._meta.content_source_id,
            page: 1,
            rank: resultIndex,
            event: "search-ui-autocomplete-result-click"
        });
    }
    performFetchRequest(apiUrl, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const jsVersion = "browser";
            const metaHeader = `ent=${version_1.LIB_VERSION}-ws-connector,js=${jsVersion},t=${version_1.LIB_VERSION}-ws-connector,ft=universal`;
            const searchResponse = yield fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.accessToken}`,
                    "x-elastic-client-meta": metaHeader
                },
                body: JSON.stringify(payload)
            });
            if (searchResponse.status === 401) {
                this.state.isLoggedIn = false; // Remove the token to trigger the Log in dialog
                throw new Error(search_ui_1.INVALID_CREDENTIALS);
            }
            const responseJson = yield searchResponse.json();
            return responseJson;
        });
    }
    onSearch(state, queryConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            // Do not perform a search if not logged in
            if (!this.state.isLoggedIn) {
                return Promise.reject(new Error(search_ui_1.INVALID_CREDENTIALS));
            }
            const { current, filters, resultsPerPage, sortDirection, sortField, sortList } = queryConfig, restOfQueryConfig = __rest(queryConfig, ["current", "filters", "resultsPerPage", "sortDirection", "sortField", "sortList"]);
            const _a = (0, requestAdapters_1.adaptRequest)(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, state), (current !== undefined && { current })), (filters !== undefined && { filters })), (resultsPerPage !== undefined && { resultsPerPage })), (sortDirection !== undefined && { sortDirection })), (sortField !== undefined && { sortField })), (sortList !== undefined && { sortList }))), { query } = _a, optionsFromState = __rest(_a, ["query"]);
            const withQueryConfigOptions = Object.assign(Object.assign({}, restOfQueryConfig), optionsFromState);
            const options = Object.assign({}, removeInvalidFields(withQueryConfigOptions));
            return this.beforeSearchCall(options, (newOptions) => __awaiter(this, void 0, void 0, function* () {
                const apiUrl = `${this.enterpriseSearchBase}/api/ws/v1/search`;
                const responseJson = yield this.performFetchRequest(apiUrl, Object.assign({ query }, newOptions));
                return (0, responseAdapter_1.adaptResponse)(responseJson, (0, buildResponseAdapterOptions_1.default)(queryConfig));
            }));
        });
    }
    onAutocomplete({ searchTerm }, queryConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const autocompletedState = {};
            if (queryConfig.suggestions) {
                console.warn("search-ui-workplace-search-connector: Workplace Search does not support query suggestions on autocomplete");
            }
            if (queryConfig.results) {
                const _a = queryConfig.results, { current, filters, resultsPerPage, sortDirection, sortField, sortList } = _a, restOfQueryConfig = __rest(_a, ["current", "filters", "resultsPerPage", "sortDirection", "sortField", "sortList"]);
                const _b = (0, requestAdapters_1.adaptRequest)({
                    current,
                    searchTerm,
                    filters,
                    resultsPerPage,
                    sortDirection,
                    sortField,
                    sortList
                }), { query } = _b, optionsFromState = __rest(_b, ["query"]);
                const withQueryConfigOptions = Object.assign(Object.assign({}, restOfQueryConfig), optionsFromState);
                const options = removeInvalidFields(withQueryConfigOptions);
                yield this.beforeAutocompleteResultsCall(options, (newOptions) => {
                    return this.performFetchRequest(`${this.enterpriseSearchBase}/api/ws/v1/search`, Object.assign({ query }, newOptions)).then((responseJson) => {
                        var _a;
                        autocompletedState.autocompletedResults =
                            ((_a = (0, responseAdapter_1.adaptResponse)(responseJson)) === null || _a === void 0 ? void 0 : _a.results) || [];
                        autocompletedState.autocompletedResultsRequestId =
                            responseJson.meta.request_id;
                    });
                });
            }
            return autocompletedState;
        });
    }
}
exports.default = WorkplaceSearchAPIConnector;
