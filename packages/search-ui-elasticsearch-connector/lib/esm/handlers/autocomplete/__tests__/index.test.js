var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Searchkit from "@searchkit/sdk";
import handleRequest from "../index";
const mockSearchkitResponse = [
    {
        identifier: "suggestions-completion-results",
        suggestions: ["sweaters", "sweatpants"]
    },
    {
        identifier: "suggestions-hits-popularQueries",
        hits: [
            {
                id: "acadia",
                fields: {
                    query: "hello"
                },
                highlight: {
                    query: "hello"
                },
                rawHit: {
                    _id: "test"
                }
            }
        ]
    },
    {
        identifier: "hits-suggestions",
        hits: [
            {
                id: "test",
                fields: {
                    title: "hello",
                    description: "test"
                },
                highlight: {
                    title: "hello"
                },
                rawHit: {
                    _id: "test"
                }
            }
        ]
    }
];
jest.mock("@searchkit/sdk", () => {
    const originalModule = jest.requireActual("@searchkit/sdk");
    return Object.assign(Object.assign({ __esModule: true }, originalModule), { default: jest.fn((config) => {
            const sk = originalModule.default(config);
            sk.executeSuggestions = jest.fn(() => mockSearchkitResponse);
            return sk;
        }) });
});
const state = {
    searchTerm: "test"
};
const queryConfig = {
    results: {
        resultsPerPage: 5,
        search_fields: {
            title: {
                weight: 2
            }
        },
        result_fields: {
            title: {
                snippet: {
                    size: 100,
                    fallback: true
                }
            },
            nps_link: {
                raw: {}
            }
        }
    },
    suggestions: {
        types: {
            results: {
                fields: ["title"]
            },
            popularQueries: {
                queryType: "results",
                search_fields: {
                    title: {}
                },
                result_fields: {
                    title: {
                        raw: {}
                    }
                }
            }
        }
    }
};
describe("Autocomplete results", () => {
    it("success", () => __awaiter(void 0, void 0, void 0, function* () {
        const results = yield handleRequest({
            state,
            queryConfig,
            host: "http://localhost:9200",
            index: "test",
            connectionOptions: {
                apiKey: "test"
            }
        });
        const searchkitRequestInstance = Searchkit.mock.results[0]
            .value;
        expect(searchkitRequestInstance.executeSuggestions).toBeCalledWith("test");
        expect(results).toMatchInlineSnapshot(`
      Object {
        "autocompletedResults": Array [
          Object {
            "_meta": Object {
              "id": "test",
              "rawHit": Object {
                "_id": "test",
              },
            },
            "description": Object {
              "raw": "test",
            },
            "id": Object {
              "raw": "test",
            },
            "title": Object {
              "raw": "hello",
              "snippet": "hello",
            },
          },
        ],
        "autocompletedSuggestions": Object {
          "popularQueries": Array [
            Object {
              "queryType": "results",
              "result": Object {
                "_meta": Object {
                  "id": "test",
                  "rawHit": Object {
                    "_id": "test",
                  },
                },
                "id": Object {
                  "raw": "acadia",
                },
                "query": Object {
                  "raw": "hello",
                  "snippet": "hello",
                },
              },
            },
          ],
          "results": Array [
            Object {
              "suggestion": "sweaters",
            },
            Object {
              "suggestion": "sweatpants",
            },
          ],
        },
      }
    `);
    }));
    it("should pass cloud configuration to searchkit", () => __awaiter(void 0, void 0, void 0, function* () {
        Searchkit.mockClear();
        const results = yield handleRequest({
            state,
            queryConfig,
            cloud: {
                id: "cloudId"
            },
            index: "test",
            connectionOptions: {
                apiKey: "test"
            }
        });
        const searchkitRequestInstance = Searchkit.mock.results[0]
            .value;
        expect(searchkitRequestInstance.config.cloud).toEqual({
            id: "cloudId"
        });
        expect(searchkitRequestInstance.config.host).toBeUndefined();
    }));
    it("should pass additional headers to searchkit", () => __awaiter(void 0, void 0, void 0, function* () {
        Searchkit.mockClear();
        const results = yield handleRequest({
            state,
            queryConfig,
            host: "http://localhost:9200",
            index: "test",
            connectionOptions: {
                apiKey: "test",
                headers: {
                    Authorization: "Bearer 123"
                }
            }
        });
        const searchkitRequestInstance = Searchkit.mock.results[0]
            .value;
        expect(searchkitRequestInstance.config.connectionOptions).toEqual({
            apiKey: "test",
            headers: {
                Authorization: "Bearer 123"
            }
        });
    }));
});
