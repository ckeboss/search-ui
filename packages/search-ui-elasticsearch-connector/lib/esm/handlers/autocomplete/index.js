var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Searchkit, { CompletionSuggester, HitsSuggestor, PrefixQuery } from "@searchkit/sdk";
import { fieldResponseMapper } from "../common";
import { getQueryFields, getResultFields } from "../search/Configuration";
export default function handleRequest(configuration) {
    return __awaiter(this, void 0, void 0, function* () {
        const { state, queryConfig, host, cloud, index, connectionOptions } = configuration;
        const { apiKey, headers } = connectionOptions || {};
        const suggestionConfigurations = [];
        if (queryConfig.results) {
            const { hitFields, highlightFields } = getResultFields(queryConfig.results.result_fields);
            const queryFields = getQueryFields(queryConfig.results.search_fields);
            suggestionConfigurations.push(new HitsSuggestor({
                identifier: "hits-suggestions",
                hits: {
                    fields: hitFields,
                    highlightedFields: highlightFields
                },
                query: new PrefixQuery({ fields: queryFields }),
                size: queryConfig.results.resultsPerPage || 5
            }));
        }
        if (queryConfig.suggestions && queryConfig.suggestions.types) {
            const configs = Object.keys(queryConfig.suggestions.types).map((type) => {
                const configuration = queryConfig.suggestions.types[type];
                const suggestionsSize = queryConfig.suggestions.size || 5;
                if (configuration.queryType === "results") {
                    const { hitFields, highlightFields } = getResultFields(configuration.result_fields);
                    const queryFields = getQueryFields(configuration.search_fields);
                    return new HitsSuggestor({
                        identifier: `suggestions-hits-${type}`,
                        index: configuration.index,
                        hits: {
                            fields: hitFields,
                            highlightedFields: highlightFields
                        },
                        query: new PrefixQuery({ fields: queryFields }),
                        size: suggestionsSize
                    });
                }
                else if (!configuration.queryType ||
                    configuration.queryType === "suggestions") {
                    const { fields } = configuration;
                    return new CompletionSuggester({
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
        const response = yield Searchkit(searchkitConfig).executeSuggestions(state.searchTerm);
        const results = response.reduce((sum, suggestion) => {
            const { identifier } = suggestion;
            if (identifier === "hits-suggestions") {
                return Object.assign(Object.assign({}, sum), { autocompletedResults: suggestion.hits.map(fieldResponseMapper) });
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
                            result: fieldResponseMapper(hit)
                        })) }) });
            }
        }, {
            autocompletedSuggestions: {}
        });
        return results;
    });
}
