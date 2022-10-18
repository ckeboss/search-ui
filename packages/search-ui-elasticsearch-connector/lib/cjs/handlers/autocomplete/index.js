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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = __importStar(require("@searchkit/sdk"));
const common_1 = require("../common");
const Configuration_1 = require("../search/Configuration");
function handleRequest(configuration) {
    return __awaiter(this, void 0, void 0, function* () {
        const { state, queryConfig, host, cloud, index, connectionOptions } = configuration;
        const { apiKey, headers } = connectionOptions || {};
        const suggestionConfigurations = [];
        if (queryConfig.results) {
            const { hitFields, highlightFields } = (0, Configuration_1.getResultFields)(queryConfig.results.result_fields);
            const queryFields = (0, Configuration_1.getQueryFields)(queryConfig.results.search_fields);
            suggestionConfigurations.push(new sdk_1.HitsSuggestor({
                identifier: "hits-suggestions",
                hits: {
                    fields: hitFields,
                    highlightedFields: highlightFields
                },
                query: new sdk_1.PrefixQuery({ fields: queryFields }),
                size: queryConfig.results.resultsPerPage || 5
            }));
        }
        if (queryConfig.suggestions && queryConfig.suggestions.types) {
            const configs = Object.keys(queryConfig.suggestions.types).map((type) => {
                const configuration = queryConfig.suggestions.types[type];
                const suggestionsSize = queryConfig.suggestions.size || 5;
                if (configuration.queryType === "results") {
                    const { hitFields, highlightFields } = (0, Configuration_1.getResultFields)(configuration.result_fields);
                    const queryFields = (0, Configuration_1.getQueryFields)(configuration.search_fields);
                    return new sdk_1.HitsSuggestor({
                        identifier: `suggestions-hits-${type}`,
                        index: configuration.index,
                        hits: {
                            fields: hitFields,
                            highlightedFields: highlightFields
                        },
                        query: new sdk_1.PrefixQuery({ fields: queryFields }),
                        size: suggestionsSize
                    });
                }
                else if (!configuration.queryType ||
                    configuration.queryType === "suggestions") {
                    const { fields } = configuration;
                    return new sdk_1.CompletionSuggester({
                        identifier: `suggestions-completion-${type}`,
                        field: fields[0],
                        size: suggestionsSize
                    });
                }
            });
            suggestionConfigurations.push(...configs);
        }
        const searchkitConfig = {
            host,
            cloud,
            index,
            connectionOptions: {
                apiKey,
                headers
            },
            suggestions: suggestionConfigurations
        };
        const response = yield (0, sdk_1.default)(searchkitConfig).executeSuggestions(state.searchTerm);
        const results = response.reduce((sum, suggestion) => {
            const { identifier } = suggestion;
            if (identifier === "hits-suggestions") {
                return Object.assign(Object.assign({}, sum), { autocompletedResults: suggestion.hits.map(common_1.fieldResponseMapper) });
            }
            else if (identifier.startsWith("suggestions-completion-")) {
                const name = identifier.replace("suggestions-completion-", "");
                return Object.assign(Object.assign({}, sum), { autocompletedSuggestions: Object.assign(Object.assign({}, sum.autocompletedSuggestions), { [name]: suggestion.suggestions.map((suggestion) => {
                            return {
                                suggestion: suggestion
                            };
                        }) }) });
            }
            else if (identifier.startsWith("suggestions-hits-")) {
                const name = identifier.replace("suggestions-hits-", "");
                const config = queryConfig.suggestions.types[name];
                return Object.assign(Object.assign({}, sum), { autocompletedSuggestions: Object.assign(Object.assign({}, sum.autocompletedSuggestions), { [name]: suggestion.hits.map((hit) => ({
                            queryType: config.queryType,
                            result: (0, common_1.fieldResponseMapper)(hit)
                        })) }) });
            }
        }, {
            autocompletedSuggestions: {}
        });
        return results;
    });
}
exports.default = handleRequest;
