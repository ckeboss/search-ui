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
import WorkplaceSearchAPIConnector from "..";
import { DEFAULT_STATE } from "@elastic/search-ui";
import exampleResponse from "./exampleResponse.json";
import { LIB_VERSION } from "../version";
jest.mock("../responseAdapter");
beforeEach(() => {
    localStorage.clear();
    window.location.hash = "";
    jest.clearAllMocks();
    window.fetch = jest.fn(() => Promise.resolve({
        status: 200,
        json: () => Promise.resolve(exampleResponse)
    }));
});
function getLastFetchCall() {
    const lastFetchCall = window.fetch.mock.calls[0];
    const [url, body] = lastFetchCall;
    return {
        url,
        body: JSON.parse(body.body),
        headers: body.headers,
        token: body.headers.Authorization
    };
}
const params = {
    kibanaBase: "https://search-ui-sandbox.kb.us-central1.gcp.cloud.es.io:9243",
    enterpriseSearchBase: "https://search-ui-sandbox.ent.us-central1.gcp.cloud.es.io",
    redirectUri: "http://localhost:3000",
    clientId: "8e495e40fc1e6acf515e557e534de39d4f727f7f60a3afed24a99ce3a6607c1e"
};
describe("WorkplaceSearchAPIConnector", () => {
    it("can be initialized", () => {
        const connector = new WorkplaceSearchAPIConnector(params);
        expect(connector).toBeInstanceOf(WorkplaceSearchAPIConnector);
    });
    it("will throw when missing required parameters", () => {
        expect(() => {
            new WorkplaceSearchAPIConnector({});
        }).toThrow();
    });
    describe("Result click Analytics Event", () => {
        function subject() {
            const connector = new WorkplaceSearchAPIConnector(Object.assign({}, params));
            return connector.onResultClick({
                documentId: "11111",
                requestId: "12345",
                page: 2,
                result: exampleResponse.results[0],
                resultsPerPage: 20,
                resultIndexOnPage: 4
            });
        }
        it("passes all the required params to the click endpoint", () => {
            subject();
            const { body } = getLastFetchCall();
            expect(body).toMatchInlineSnapshot(`
        Object {
          "content_source_id": "621581b6174a804659f9dc16",
          "document_id": "11111",
          "event": "search-ui-result-click",
          "page": 2,
          "query_id": "12345",
          "rank": 24,
          "type": "click",
        }
      `);
        });
    });
    describe("Autocomplete result click Analytics Event", () => {
        function subject() {
            const connector = new WorkplaceSearchAPIConnector(Object.assign({}, params));
            return connector.onAutocompleteResultClick({
                documentId: "11111",
                requestId: "12345",
                result: exampleResponse.results[0],
                resultIndex: 4
            });
        }
        it("passes all the required params to the click endpoint", () => {
            subject();
            const { body } = getLastFetchCall();
            expect(body).toMatchInlineSnapshot(`
        Object {
          "content_source_id": "621581b6174a804659f9dc16",
          "document_id": "11111",
          "event": "search-ui-autocomplete-result-click",
          "page": 1,
          "query_id": "12345",
          "rank": 4,
          "type": "click",
        }
      `);
        });
    });
    describe("performFetchRequest", () => {
        function subject() {
            const connector = new WorkplaceSearchAPIConnector(Object.assign({}, params));
            return connector.performFetchRequest("http://example.com", {});
        }
        it("will throw an error if there is no accessToken in localstorage or in url", () => __awaiter(void 0, void 0, void 0, function* () {
            window.location.hash = "";
            localStorage.clear();
            window.fetch = jest.fn(() => Promise.resolve({
                status: 401,
                json: () => Promise.resolve()
            }));
            yield expect(subject()).rejects.toThrow();
        }));
        it("will issue a request if access token is in the localstorage", () => __awaiter(void 0, void 0, void 0, function* () {
            window.location.hash = "";
            localStorage.setItem("SearchUIWorkplaceSearchAccessToken", "faketoken");
            yield subject();
            expect(fetch).toHaveBeenCalledTimes(1);
        }));
        it("will issue a request if access token is in the url", () => __awaiter(void 0, void 0, void 0, function* () {
            window.location.hash = "access_token=faketoken";
            localStorage.clear();
            yield subject();
            expect(fetch).toHaveBeenCalledTimes(1);
        }));
    });
    describe("onSearch", () => {
        function subject(state = Object.assign({}, DEFAULT_STATE), queryConfig = {}, beforeSearchCall) {
            return __awaiter(this, void 0, void 0, function* () {
                window.location.hash = "access_token=faketoken";
                if (!state.searchTerm)
                    state.searchTerm = "searchTerm";
                const connector = new WorkplaceSearchAPIConnector(Object.assign(Object.assign({}, params), { beforeSearchCall }));
                return yield connector.onSearch(state, queryConfig);
            });
        }
        it("will pass request state through to search endpoint", () => __awaiter(void 0, void 0, void 0, function* () {
            const state = Object.assign(Object.assign({}, DEFAULT_STATE), { resultsPerPage: 40, current: 2, sortField: "foo", sortDirection: "desc" });
            yield subject(state);
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(getLastFetchCall().body).toMatchInlineSnapshot(`
        Object {
          "page": Object {
            "current": 2,
            "size": 40,
          },
          "query": "searchTerm",
          "sort": Object {
            "foo": "desc",
          },
        }
      `);
        }));
        it("will pass queryConfig to search endpoint", () => __awaiter(void 0, void 0, void 0, function* () {
            const state = Object.assign({}, DEFAULT_STATE);
            const queryConfig = {
                facets: {
                    states: {
                        type: "value",
                        size: 30
                    }
                }
            };
            yield subject(state, queryConfig);
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(getLastFetchCall().body).toMatchInlineSnapshot(`
        Object {
          "facets": Object {
            "states": Object {
              "size": 30,
              "type": "value",
            },
          },
          "page": Object {
            "current": 1,
            "size": 20,
          },
          "query": "searchTerm",
        }
      `);
        }));
        it("will not pass empty facets or filter state to search endpoint", () => __awaiter(void 0, void 0, void 0, function* () {
            const state = Object.assign(Object.assign({}, DEFAULT_STATE), { searchTerm: "searchTerm", filters: [], facets: {} });
            const queryConfig = {
                filters: [],
                facets: {}
            };
            yield subject(state, queryConfig);
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(getLastFetchCall().body).toMatchInlineSnapshot(`
        Object {
          "page": Object {
            "current": 1,
            "size": 20,
          },
          "query": "searchTerm",
        }
      `);
        }));
        it("will pass request parameter state provided to queryConfig, overriding the same value provided in state", () => __awaiter(void 0, void 0, void 0, function* () {
            const state = Object.assign(Object.assign({}, DEFAULT_STATE), { searchTerm: "searchTerm", current: 1, resultsPerPage: 10, sortDirection: "desc", sortField: "name", filters: [
                    {
                        field: "title",
                        type: "all",
                        values: ["Acadia", "Grand Canyon"]
                    },
                    {
                        field: "world_heritage_site",
                        values: ["true"],
                        type: "all"
                    }
                ] });
            const queryConfig = {
                current: 2,
                resultsPerPage: 5,
                sortDirection: "asc",
                sortField: "title",
                filters: [
                    {
                        field: "date_made",
                        values: ["yesterday"],
                        type: "all"
                    }
                ]
            };
            yield subject(state, queryConfig);
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(getLastFetchCall().body).toMatchInlineSnapshot(`
        Object {
          "filters": Object {
            "all": Array [
              Object {
                "all": Array [
                  Object {
                    "date_made": "yesterday",
                  },
                ],
              },
            ],
          },
          "page": Object {
            "current": 2,
            "size": 5,
          },
          "query": "searchTerm",
          "sort": Object {
            "title": "asc",
          },
        }
      `);
        }));
        it("will include meta header information correct for the browser context", () => __awaiter(void 0, void 0, void 0, function* () {
            yield subject();
            expect(global.fetch).toHaveBeenCalledTimes(1);
            const metaHeader = getLastFetchCall().headers["x-elastic-client-meta"];
            expect(metaHeader).toEqual(`ent=${LIB_VERSION}-ws-connector,js=browser,t=${LIB_VERSION}-ws-connector,ft=universal`);
            const validHeaderRegex = 
            // eslint-disable-next-line no-useless-escape
            /^[a-z]{1,}=[a-z0-9\.\-]{1,}(?:,[a-z]{1,}=[a-z0-9\.\-]+)*$/;
            expect(metaHeader).toMatch(validHeaderRegex);
        }));
        it("will use the beforeSearchCall parameter to amend option parameters to the search endpoint call", () => __awaiter(void 0, void 0, void 0, function* () {
            const state = Object.assign(Object.assign({}, DEFAULT_STATE), { current: 2, searchTerm: "searchTerm" });
            const queryConfig = {
                sortDirection: "desc",
                sortField: "name",
                resultsPerPage: 5
            };
            const beforeSearchCall = (options, next) => {
                // Remove sort_direction and sort_field
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { sort } = options, rest = __rest(options, ["sort"]);
                return next(Object.assign(Object.assign({}, rest), { 
                    // Add test
                    test: "value" }));
            };
            yield subject(state, queryConfig, beforeSearchCall);
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(getLastFetchCall().body).toMatchInlineSnapshot(`
        Object {
          "page": Object {
            "current": 2,
            "size": 5,
          },
          "query": "searchTerm",
          "test": "value",
        }
      `);
        }));
    });
    describe("onAutocomplete", () => {
        function subject(state = { searchTerm: "searchTerm" }, queryConfig = {}, { beforeAutocompleteResultsCall, beforeAutocompleteSuggestionsCall } = {}) {
            window.location.hash = "access_token=faketoken";
            const connector = new WorkplaceSearchAPIConnector(Object.assign(Object.assign({}, params), { beforeAutocompleteResultsCall,
                beforeAutocompleteSuggestionsCall }));
            return connector.onAutocomplete(state, queryConfig);
        }
        describe("when 'results' type is requested", () => {
            it("will pass request state through to search endpoint", () => __awaiter(void 0, void 0, void 0, function* () {
                const state = {
                    searchTerm: "searchTerm",
                    resultsPerPage: 40,
                    current: 2,
                    sortField: "foo",
                    sortDirection: "desc"
                };
                yield subject(state, { results: {} });
                expect(global.fetch).toHaveBeenCalledTimes(1);
                expect(getLastFetchCall().body).toMatchInlineSnapshot(`
          Object {
            "page": Object {},
            "query": "searchTerm",
          }
        `);
                expect(getLastFetchCall().headers["x-elastic-client-meta"]).toEqual(`ent=${LIB_VERSION}-ws-connector,js=browser,t=${LIB_VERSION}-ws-connector,ft=universal`);
            }));
            it("will pass queryConfig to search endpoint", () => __awaiter(void 0, void 0, void 0, function* () {
                const queryConfig = {
                    facets: {
                        states: {
                            type: "value",
                            size: 30
                        }
                    }
                };
                yield subject(undefined, { results: queryConfig });
                expect(global.fetch).toHaveBeenCalledTimes(1);
                expect(getLastFetchCall().body).toMatchInlineSnapshot(`
          Object {
            "facets": Object {
              "states": Object {
                "size": 30,
                "type": "value",
              },
            },
            "page": Object {},
            "query": "searchTerm",
          }
        `);
            }));
            it("will not pass empty facets or filter state to search endpoint", () => __awaiter(void 0, void 0, void 0, function* () {
                const state = Object.assign(Object.assign({}, DEFAULT_STATE), { searchTerm: "searchTerm", filters: [], facets: {} });
                const queryConfig = {
                    filters: [],
                    facets: {}
                };
                yield subject(state, { results: queryConfig });
                expect(global.fetch).toHaveBeenCalledTimes(1);
                expect(getLastFetchCall().body).toMatchInlineSnapshot(`
          Object {
            "page": Object {},
            "query": "searchTerm",
          }
        `);
            }));
            it("will pass request parameter state provided to queryConfig, overriding the same value provided in state", () => __awaiter(void 0, void 0, void 0, function* () {
                const state = Object.assign(Object.assign({}, DEFAULT_STATE), { searchTerm: "searchTerm", current: 1, resultsPerPage: 10, sortDirection: "desc", sortField: "name", filters: [
                        {
                            field: "title",
                            type: "all",
                            values: ["Acadia", "Grand Canyon"]
                        },
                        {
                            field: "world_heritage_site",
                            values: ["true"],
                            type: "all"
                        }
                    ] });
                const queryConfig = {
                    current: 2,
                    resultsPerPage: 5,
                    sortDirection: "asc",
                    sortField: "title",
                    filters: [
                        {
                            field: "date_made",
                            values: ["yesterday"],
                            type: "all"
                        }
                    ]
                };
                yield subject(state, { results: queryConfig });
                expect(global.fetch).toHaveBeenCalledTimes(1);
                expect(getLastFetchCall().body).toMatchInlineSnapshot(`
          Object {
            "filters": Object {
              "all": Array [
                Object {
                  "all": Array [
                    Object {
                      "date_made": "yesterday",
                    },
                  ],
                },
              ],
            },
            "page": Object {
              "current": 2,
              "size": 5,
            },
            "query": "searchTerm",
            "sort": Object {
              "title": "asc",
            },
          }
        `);
            }));
            it("will use the beforeSearchCall parameter to amend option parameters to the search endpoint call", () => __awaiter(void 0, void 0, void 0, function* () {
                const state = Object.assign(Object.assign({}, DEFAULT_STATE), { current: 2, searchTerm: "searchTerm" });
                const queryConfig = {
                    sortDirection: "desc",
                    sortField: "name",
                    resultsPerPage: 5
                };
                const beforeAutocompleteResultsCall = (options, next) => {
                    // Remove sort_direction and sort_field
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { sort } = options, rest = __rest(options, ["sort"]);
                    return next(Object.assign(Object.assign({}, rest), { 
                        // Add test
                        test: "value" }));
                };
                yield subject(state, { results: queryConfig }, { beforeAutocompleteResultsCall });
                expect(global.fetch).toHaveBeenCalledTimes(1);
                expect(getLastFetchCall().body).toMatchInlineSnapshot(`
          Object {
            "page": Object {
              "size": 5,
            },
            "query": "searchTerm",
            "test": "value",
          }
        `);
            }));
        });
        describe("when 'suggestions' type is requested", () => {
            it("returns an empty state", () => __awaiter(void 0, void 0, void 0, function* () {
                const autocompletedState = yield subject(undefined, {
                    suggestions: {}
                });
                expect(autocompletedState).toEqual({});
            }));
        });
        describe("when 'results' and 'suggestions' type are both requested", () => {
            it("returns only the results part of the state", () => __awaiter(void 0, void 0, void 0, function* () {
                const autocompletedState = yield subject(undefined, {
                    suggestions: {},
                    results: {}
                });
                expect(autocompletedState).toMatchInlineSnapshot(`
          Object {
            "autocompletedResults": Array [],
            "autocompletedResultsRequestId": "W6qPJzEBS0eoUnVG4FZTnw",
          }
        `);
            }));
        });
        describe("when no type is requested", () => {
            it("returns an empty state", () => __awaiter(void 0, void 0, void 0, function* () {
                const autocompletedState = yield subject(undefined, {});
                expect(autocompletedState).toEqual({});
            }));
        });
    });
});
