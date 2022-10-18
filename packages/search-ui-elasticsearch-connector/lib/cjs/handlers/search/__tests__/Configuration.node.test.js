"use strict";
/**
 * @jest-environment node
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Configuration_1 = __importDefault(require("../Configuration"));
jest.mock("@searchkit/sdk");
const version_1 = require("../../../version");
describe("Search - Configuration within node context", () => {
    describe("buildConfiguration", () => {
        const queryConfig = {
            search_fields: {
                title: {
                    weight: 2
                },
                description: {}
            },
            result_fields: {
                title: {
                    snippet: {}
                },
                description: {
                    snippet: {}
                },
                url: {
                    raw: {}
                }
            },
            facets: {
                category: {
                    type: "value",
                    size: 20
                },
                type: {
                    type: "value",
                    size: 20,
                    sort: "value"
                }
            },
            disjunctiveFacets: ["category"]
        };
        const host = "http://localhost:9200";
        const index = "test_index";
        const apiKey = "apiKey";
        it("builds configuration", () => {
            const state = {
                searchTerm: "test"
            };
            const nodeVersion = process.version;
            const configuration = (0, Configuration_1.default)({
                state,
                queryConfig,
                host,
                index,
                apiKey
            });
            const validHeaderRegex = 
            // eslint-disable-next-line no-useless-escape
            /^[a-z]{1,}=[a-z0-9\.\-]{1,}(?:,[a-z]{1,}=[a-z0-9\.\-]+)*$/;
            expect(configuration.connectionOptions.headers["x-elastic-client-meta"]).toMatch(validHeaderRegex);
            expect(configuration.connectionOptions.headers["x-elastic-client-meta"]).toEqual(`ent=${version_1.LIB_VERSION}-es-connector,js=${nodeVersion},t=${version_1.LIB_VERSION}-es-connector,ft=universal`);
        });
    });
});
