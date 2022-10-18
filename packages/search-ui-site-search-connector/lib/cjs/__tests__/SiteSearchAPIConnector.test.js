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
const __1 = __importDefault(require(".."));
const example_response_json_1 = __importDefault(require("./example-response.json"));
function fetchResponse(response) {
    return Promise.resolve({
        status: 200,
        json: () => Promise.resolve(response)
    });
}
beforeEach(() => {
    global.Headers = jest.fn();
    global.fetch = jest.fn().mockReturnValue(fetchResponse(example_response_json_1.default));
});
const engineKey = "12345";
const documentType = "national-parks";
const params = {
    documentType,
    engineKey
};
it("can be initialized", () => {
    const connector = new __1.default(params);
    expect(connector).toBeInstanceOf(__1.default);
});
describe("#onSearch", () => {
    function subject({ beforeSearchCall = undefined, state, queryConfig = {} }) {
        const connector = new __1.default(Object.assign(Object.assign({}, params), { beforeSearchCall }));
        return connector.onSearch(state, queryConfig);
    }
    it("will correctly format an API response", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield subject({ state: {}, queryConfig: {} });
        expect(response).toMatchSnapshot();
    }));
    it("will pass request state through to search endpoint", () => __awaiter(void 0, void 0, void 0, function* () {
        const state = {
            searchTerm: "searchTerm",
            current: 1,
            resultsPerPage: 10,
            sortDirection: "desc",
            sortField: "name",
            filters: [
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
            ]
        };
        yield subject({ state });
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({
            engine_key: engineKey,
            page: 1,
            per_page: 10,
            filters: {
                [documentType]: {
                    title: {
                        type: "and",
                        values: ["Acadia", "Grand Canyon"]
                    },
                    world_heritage_site: {
                        type: "and",
                        values: ["true"]
                    }
                }
            },
            sort_direction: {
                "national-parks": "desc"
            },
            sort_field: {
                "national-parks": "name"
            },
            q: "searchTerm"
        });
    }));
    it("will pass queryConfig to search endpoint", () => __awaiter(void 0, void 0, void 0, function* () {
        const state = {
            searchTerm: "searchTerm"
        };
        const queryConfig = {
            facets: {
                states: {
                    type: "value",
                    size: 30
                }
            },
            result_fields: {
                title: { raw: {}, snippet: { size: 20, fallback: true } }
            },
            search_fields: {
                title: {},
                description: {},
                states: {}
            }
        };
        yield subject({ state, queryConfig });
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({
            engine_key: engineKey,
            facets: {
                "national-parks": ["states"]
            },
            fetch_fields: {
                [documentType]: ["title"]
            },
            search_fields: {
                [documentType]: ["title", "description", "states"]
            },
            highlight_fields: {
                [documentType]: {
                    title: { size: 20, fallback: true }
                }
            },
            q: "searchTerm"
        });
    }));
    it("will pass request parameter state provided to queryConfig, overriding the same value provided in state", () => __awaiter(void 0, void 0, void 0, function* () {
        const state = {
            searchTerm: "searchTerm",
            current: 1,
            resultsPerPage: 10,
            sortDirection: "desc",
            sortField: "name",
            filters: [
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
            ]
        };
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
        yield subject({ state, queryConfig });
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({
            engine_key: engineKey,
            page: 2,
            per_page: 5,
            filters: {
                [documentType]: {
                    date_made: {
                        type: "and",
                        values: ["yesterday"]
                    }
                }
            },
            sort_direction: {
                "national-parks": "asc"
            },
            sort_field: {
                "national-parks": "title"
            },
            q: "searchTerm"
        });
    }));
    it("will use the beforeSearchCall parameter to to amend option parameters to the search endpoint call", () => __awaiter(void 0, void 0, void 0, function* () {
        const searchTerm = "searchTerm";
        const queryConfig = {
            sortDirection: "desc",
            sortField: "name",
            resultsPerPage: 5
        };
        const beforeSearchCall = (options, next) => {
            // Remove sort_direction and sort_field
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { sort_direction, sort_field } = options, rest = __rest(options, ["sort_direction", "sort_field"]);
            return next(Object.assign(Object.assign({}, rest), { 
                // Add group
                group: { field: "title" } }));
        };
        yield subject({
            beforeSearchCall,
            state: { searchTerm },
            queryConfig
        });
        expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({
            per_page: 5,
            engine_key: engineKey,
            q: "searchTerm",
            group: { field: "title" }
        });
    }));
});
describe("#onAutocomplete", () => {
    function subject({ beforeAutocompleteResultsCall = undefined, state, queryConfig = {
        results: {}
    } }) {
        const connector = new __1.default(Object.assign({ beforeAutocompleteResultsCall }, params));
        return connector.onAutocomplete(state, queryConfig);
    }
    it("will correctly format an API response", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield subject({
            state: {},
            queryConfig: {
                results: {}
            }
        });
        expect(response).toMatchSnapshot();
    }));
    it("will pass searchTerm from state through to search endpoint", () => __awaiter(void 0, void 0, void 0, function* () {
        const state = {
            searchTerm: "searchTerm"
        };
        yield subject({ state });
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({
            engine_key: engineKey,
            q: "searchTerm"
        });
    }));
    it("will pass queryConfig to search endpoint", () => __awaiter(void 0, void 0, void 0, function* () {
        const state = {
            searchTerm: "searchTerm"
        };
        const queryConfig = {
            results: {
                result_fields: {
                    title: { raw: {}, snippet: { size: 20, fallback: true } }
                },
                search_fields: {
                    title: {},
                    description: {},
                    states: {}
                }
            }
        };
        yield subject({ state, queryConfig });
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({
            engine_key: engineKey,
            q: "searchTerm",
            fetch_fields: {
                [documentType]: ["title"]
            },
            search_fields: {
                [documentType]: ["title", "description", "states"]
            },
            highlight_fields: {
                [documentType]: {
                    title: { size: 20, fallback: true }
                }
            }
        });
    }));
    it("will pass request parameter state provided to queryConfig", () => __awaiter(void 0, void 0, void 0, function* () {
        const state = {
            searchTerm: "searchTerm"
        };
        const queryConfig = {
            results: {
                current: 2,
                resultsPerPage: 5,
                filters: [
                    {
                        field: "world_heritage_site",
                        values: ["true"],
                        type: "all"
                    }
                ],
                sortDirection: "desc",
                sortField: "name"
            }
        };
        yield subject({ state, queryConfig });
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({
            engine_key: engineKey,
            q: "searchTerm",
            page: 2,
            per_page: 5,
            filters: {
                [documentType]: {
                    world_heritage_site: {
                        type: "and",
                        values: ["true"]
                    }
                }
            },
            sort_direction: {
                "national-parks": "desc"
            },
            sort_field: {
                "national-parks": "name"
            }
        });
    }));
    it("will use the beforeAutocompleteResultsCall parameter to amend option parameters to the search endpoint call", () => __awaiter(void 0, void 0, void 0, function* () {
        const state = {
            searchTerm: "searchTerm"
        };
        const queryConfig = {
            results: {
                sortDirection: "desc",
                sortField: "name",
                resultsPerPage: 5
            }
        };
        const beforeAutocompleteResultsCall = (options, next) => {
            // Remove sort_direction and sort_field
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { sort_direction, sort_field } = options, rest = __rest(options, ["sort_direction", "sort_field"]);
            return next(Object.assign(Object.assign({}, rest), { 
                // Add group
                group: { field: "title" } }));
        };
        yield subject({ beforeAutocompleteResultsCall, state, queryConfig });
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({
            engine_key: engineKey,
            q: "searchTerm",
            per_page: 5,
            group: { field: "title" }
        });
    }));
});
describe("#onResultClick", () => {
    function subject(clickData) {
        const connector = new __1.default(params);
        return connector.onResultClick(clickData);
    }
    it("will call the API with the correct body params", () => __awaiter(void 0, void 0, void 0, function* () {
        const query = "test";
        const documentId = "12345";
        yield subject({
            query,
            documentId
        });
        expect(global.fetch).toHaveBeenCalledTimes(1);
        const url = global.fetch.mock.calls[0][0];
        const urlWithoutTimestamp = url.replace(/&t=\d*/, "").replace(/t=\d*&/, "");
        expect(urlWithoutTimestamp).toEqual(`https://search-api.swiftype.com/api/v1/public/analytics/pc?engine_key=${engineKey}&q=${query}&doc_id=${documentId}`);
    }));
});
describe("#onAutocompleteResultClick", () => {
    function subject(clickData) {
        const connector = new __1.default(params);
        return connector.onAutocompleteResultClick(clickData);
    }
    it("will call the API with the correct body params", () => __awaiter(void 0, void 0, void 0, function* () {
        const query = "test";
        const documentId = "12345";
        yield subject({
            query,
            documentId
        });
        expect(global.fetch).toHaveBeenCalledTimes(1);
        const url = global.fetch.mock.calls[0][0];
        const urlWithoutTimestamp = url.replace(/&t=\d*/, "").replace(/t=\d*&/, "");
        expect(urlWithoutTimestamp).toEqual(`https://search-api.swiftype.com/api/v1/public/analytics/pas?engine_key=${engineKey}&q=${query}&doc_id=${documentId}`);
    }));
});
