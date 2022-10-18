"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.DEFAULT_STATE = void 0;
const URLManager_1 = __importDefault(require("./URLManager"));
const RequestSequencer_1 = __importDefault(require("./RequestSequencer"));
const DebounceManager_1 = __importDefault(require("./DebounceManager"));
const actions = __importStar(require("./actions"));
const Events_1 = __importDefault(require("./Events"));
const helpers_1 = require("./helpers");
const _1 = require(".");
const a11y = __importStar(require("./A11yNotifications"));
function filterSearchParameters({ current, filters, resultsPerPage, searchTerm, sortDirection, sortField, sortList }) {
    return {
        current,
        filters,
        resultsPerPage,
        searchTerm,
        sortDirection,
        sortField,
        sortList
    };
}
exports.DEFAULT_STATE = {
    // Search Parameters -- This is state that represents the input state.
    current: 1,
    filters: [],
    resultsPerPage: 20,
    searchTerm: "",
    sortDirection: "",
    sortField: "",
    sortList: [],
    // Result State -- This state represents state that is updated automatically
    // as the result of changing input state.
    autocompletedResults: [],
    autocompletedResultsRequestId: "",
    autocompletedSuggestions: {},
    autocompletedSuggestionsRequestId: "",
    error: "",
    isLoading: false,
    facets: {},
    requestId: "",
    results: [],
    resultSearchTerm: "",
    totalPages: 0,
    totalResults: 0,
    pagingStart: 0,
    pagingEnd: 0,
    wasSearched: false,
    rawResponse: {}
};
function removeConditionalFacets(facets = {}, conditionalFacets = {}, filters = []) {
    return Object.entries(facets).reduce((acc, [facetKey, facet]) => {
        if (conditionalFacets[facetKey] &&
            typeof conditionalFacets[facetKey] === "function" &&
            !conditionalFacets[facetKey]({ filters })) {
            return acc;
        }
        acc[facetKey] = facet;
        return acc;
    }, {});
}
/*
 * The Driver is a framework agnostic search state manager that is capable
 * syncing state to the url.
 */
class SearchDriver {
    constructor({ apiConnector, autocompleteQuery = {}, plugins = [], debug, initialState, onSearch, onAutocomplete, onResultClick, onAutocompleteResultClick, searchQuery = {}, trackUrlState = true, routingOptions = {}, urlPushDebounceLength = 500, hasA11yNotifications = false, a11yNotificationMessages = {}, alwaysSearchOnInitialLoad = false }) {
        this.state = exports.DEFAULT_STATE;
        /**
         * This method is used to update state and trigger a new autocomplete search.
         *
         * @param {string} searchTerm
         * @param {Object=} Object
         * @param {boolean|Object} options.autocompleteResults - Should autocomplete results
         * @param {boolean|Object} options.autocompleteSuggestions - Should autocomplete suggestions
         */
        this._updateAutocomplete = (searchTerm, 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { autocompleteResults, autocompleteSuggestions } = {}) => {
            const requestId = this.autocompleteRequestSequencer.next();
            const queryConfig = Object.assign(Object.assign({}, (autocompleteResults && {
                results: this.autocompleteQuery.results || {}
            })), (autocompleteSuggestions && {
                suggestions: this.autocompleteQuery.suggestions || {}
            }));
            return this.events
                .autocomplete({ searchTerm }, queryConfig)
                .then((autocompleted) => {
                if (this.autocompleteRequestSequencer.isOldRequest(requestId))
                    return;
                this.autocompleteRequestSequencer.completed(requestId);
                this._setState(autocompleted);
            });
        };
        /**
         * This method is used to update state and trigger a new search.
         *
         * @typedef {Object} RequestState
         * @property {number} current
         * @property {number} resultsPerPage
         * @property {string} searchTerm
         * @property {string} sortDirection
         * @property {string} sortField
         * @property {Array} sortList
         *
         * @param {RequestState} searchParameters - RequestState
         * @param {Object=} Object
         * @param {boolean} options.skipPushToUrl - Skip pushing the updated to the URL
         * @param {boolean} options.replaceUrl - When pushing state to the URL, use history 'replace'
         * rather than 'push' to avoid adding a new history entry
         */
        this._updateSearchResults = (searchParameters, { skipPushToUrl = false, replaceUrl = false } = {}) => {
            const { current, filters, resultsPerPage, searchTerm, sortDirection, sortField, sortList } = Object.assign(Object.assign({}, this.state), searchParameters);
            // State updates should always be applied in the order that they are made. This function, _updateSearchResults,
            // makes state updates.
            // In the case where a call to "_updateSearchResults" was made and delayed for X amount of time using
            // `debounceManager.runWithDebounce`, and a subsequent call is made _updateSearchResults before that delay ends, we
            // want to make sure that outstanding call to "_updateSearchResults" is cancelled, as it would apply state updates
            // out of order.
            this.debounceManager.cancelByName("_updateSearchResults");
            this._setState({
                current,
                error: "",
                filters,
                resultsPerPage,
                searchTerm,
                sortDirection,
                sortField,
                sortList
            });
            this._makeSearchRequest({
                skipPushToUrl,
                replaceUrl
            });
        };
        /**
         * This method is separated out from _updateSearchResults so that it
         * can be debounced.
         *
         * By debouncing our API calls, we can effectively allow action chaining.
         *
         * For Ex:
         *
         * If a user needs to make multiple filter updates at once, they could
         * do so by calling an action 3 times in a row:
         *
         *   addFilter("states", "California");
         *   addFilter("states", "Nebraska");
         *   addFilter("states", "Pennsylvania");
         *
         * We don't want to make 3 separate API calls like that in quick succession,
         * so we debounce the API calls.
         *
         * Application state updates are performed in _updateSearchResults, but we
         * wait to make the actual API calls until all actions have been called.
         *
         * @param {Object} options
         * @param {boolean} options.skipPushToUrl - Skip pushing the updated to the URL
         * @param {boolean} options.replaceUrl - When pushing state to the URL, use history 'replace'
         * rather than 'push' to avoid adding a new history entry
         */
        this._makeSearchRequest = DebounceManager_1.default.debounce(0, ({ skipPushToUrl, replaceUrl }) => {
            const { current, filters, resultsPerPage, searchTerm, sortDirection, sortField, sortList } = this.state;
            this._setState({
                isLoading: true
            });
            const requestId = this.searchRequestSequencer.next();
            const _a = this.searchQuery, { conditionalFacets } = _a, restOfSearchQuery = __rest(_a, ["conditionalFacets"]);
            const queryConfig = Object.assign(Object.assign({}, restOfSearchQuery), { facets: removeConditionalFacets(this.searchQuery.facets, conditionalFacets, filters) });
            const requestState = Object.assign(Object.assign({}, filterSearchParameters(this.state)), { filters: (0, helpers_1.mergeFilters)(filters, this.searchQuery.filters) });
            return this.events.search(requestState, queryConfig).then((resultState) => {
                if (this.searchRequestSequencer.isOldRequest(requestId))
                    return;
                this.searchRequestSequencer.completed(requestId);
                const { totalResults } = resultState;
                this.events.emit({
                    type: "SearchQuery",
                    query: this.state.searchTerm,
                    totalResults: totalResults
                });
                // Results paging start & end
                const start = totalResults === 0 ? 0 : (current - 1) * resultsPerPage + 1;
                const end = totalResults < start + resultsPerPage
                    ? totalResults
                    : start + resultsPerPage - 1;
                this._setState(Object.assign(Object.assign({ isLoading: false, resultSearchTerm: searchTerm, pagingStart: start, pagingEnd: end }, resultState), { wasSearched: true }));
                if (this.hasA11yNotifications) {
                    const messageArgs = { start, end, totalResults, searchTerm };
                    this.actions.a11yNotify("searchResults", messageArgs);
                }
                if (!skipPushToUrl && this.trackUrlState) {
                    // We debounce here so that we don't get a lot of intermediary
                    // URL state if someone is updating a UI really fast, like typing
                    // in a live search box for instance.
                    this.debounceManager.runWithDebounce(this.urlPushDebounceLength, "pushStateToURL", this.URLManager.pushStateToURL.bind(this.URLManager), {
                        current,
                        filters,
                        resultsPerPage,
                        searchTerm,
                        sortDirection,
                        sortField,
                        sortList
                    }, { replaceUrl });
                }
            }, (error) => {
                var _a;
                if (error.message === _1.INVALID_CREDENTIALS) {
                    // The connector should have invalidated the credentials in its state by now
                    // Getting the latest state from the connector
                    this._setState(Object.assign({}, (((_a = this.apiConnector) === null || _a === void 0 ? void 0 : _a.state) && Object.assign({}, this.apiConnector.state))));
                    // Stop execution of request
                    // and let the consuming application handle the missing credentials
                    return;
                }
                this._setState({
                    error: `An unexpected error occurred: ${error.message}`
                });
            });
        });
        this.actions = Object.entries(actions).reduce((acc, [actionName, action]) => {
            return Object.assign(Object.assign({}, acc), { [actionName]: action.bind(this) });
        }, {});
        this.actions = Object.assign(Object.assign({}, this.actions), ((apiConnector === null || apiConnector === void 0 ? void 0 : apiConnector.actions) && Object.assign({}, apiConnector.actions)));
        Object.assign(this, this.actions);
        this.events = new Events_1.default({
            apiConnector,
            onSearch,
            onAutocomplete,
            onResultClick,
            onAutocompleteResultClick,
            plugins: plugins
        });
        this.debug = debug;
        if (this.debug) {
            console.warn("Search UI Debugging is enabled. This should be turned off in production deployments.");
            if (typeof window !== "undefined")
                window["searchUI"] = this;
        }
        this.autocompleteRequestSequencer = new RequestSequencer_1.default();
        this.searchRequestSequencer = new RequestSequencer_1.default();
        this.debounceManager = new DebounceManager_1.default();
        this.autocompleteQuery = autocompleteQuery;
        this.searchQuery = searchQuery;
        this.subscriptions = [];
        this.trackUrlState = trackUrlState;
        this.urlPushDebounceLength = urlPushDebounceLength;
        this.alwaysSearchOnInitialLoad = alwaysSearchOnInitialLoad;
        this.apiConnector = apiConnector;
        let urlState;
        if (trackUrlState) {
            this.URLManager = new URLManager_1.default(routingOptions);
            urlState = this.URLManager.getStateFromURL();
            this.URLManager.onURLStateChange((urlState) => {
                this._updateSearchResults(Object.assign(Object.assign({}, exports.DEFAULT_STATE), urlState), { skipPushToUrl: true });
            });
        }
        else {
            urlState = {};
        }
        // Manage screen reader accessible notifications
        this.hasA11yNotifications = hasA11yNotifications;
        if (this.hasA11yNotifications)
            a11y.getLiveRegion();
        this.a11yNotificationMessages = Object.assign(Object.assign({}, a11y.defaultMessages), a11yNotificationMessages);
        // Remember the state this application is initialized into, so that we can
        // reset to it later.
        this.startingState = Object.assign(Object.assign({}, this.state), initialState);
        // We filter these here to disallow anything other than valid search
        // parameters to be passed in initial state, or url state. `results`, etc,
        // should not be allowed to be passed in, that should be generated based on
        // the results of the query
        const searchParameters = filterSearchParameters(Object.assign(Object.assign({}, this.startingState), urlState));
        // Initialize the state without calling _setState, because we don't
        // want to trigger an update callback, we're just initializing the state
        // to the correct default values for the initial UI render
        this.state = Object.assign(Object.assign(Object.assign({}, this.state), ((apiConnector === null || apiConnector === void 0 ? void 0 : apiConnector.state) && Object.assign({}, apiConnector.state))), searchParameters);
        // We'll trigger an initial search if initial parameters contain
        // a search term or filters, or if alwaysSearchOnInitialLoad is set.
        // Otherwise, we'll just save their selections in state as initial values.
        if (searchParameters.searchTerm ||
            searchParameters.filters.length > 0 ||
            this.alwaysSearchOnInitialLoad) {
            this._updateSearchResults(searchParameters, { replaceUrl: true });
        }
    }
    _setState(newState) {
        const state = Object.assign(Object.assign({}, this.state), newState);
        // eslint-disable-next-line no-console
        if (this.debug)
            console.log("Search UI: State Update", newState, state);
        this.state = state;
        this.subscriptions.forEach((subscription) => subscription(state));
    }
    /**
     * Dynamically update the searchQuery configuration in this driver.
     * This will issue a new query after being updated.
     *
     * @param Object searchQuery
     */
    setSearchQuery(searchQuery) {
        this.searchQuery = searchQuery;
        this._updateSearchResults({});
    }
    /**
     * @param Object autocompleteQuery
     */
    setAutocompleteQuery(autocompleteQuery) {
        this.autocompleteQuery = autocompleteQuery;
    }
    /**
     * Any time state is updated in this Driver, the provided callback
     * will be executed with the updated state.
     *
     * @param onStateChange Function
     */
    subscribeToStateChanges(onStateChange) {
        this.subscriptions.push(onStateChange);
    }
    /**
     * @param onStateChange Function
     */
    unsubscribeToStateChanges(onStateChange) {
        this.subscriptions = this.subscriptions.filter((sub) => sub !== onStateChange);
    }
    /**
     * Remove all listeners
     */
    tearDown() {
        this.subscriptions = [];
        this.URLManager && this.URLManager.tearDown();
    }
    /**
     * Retrieves all available actions
     *
     * @returns Object All actions
     */
    getActions() {
        return this.actions;
    }
    /**
     * Retrieve current state. Typically used on app initialization. Subsequent
     * state updates should come through subscription.
     *
     * @returns Object Current state
     */
    getState() {
        // We return a copy of state here, because we want to ensure the state
        // inside of this object remains immutable.
        return Object.assign({}, this.state);
    }
}
exports.default = SearchDriver;
