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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = __importDefault(require("@searchkit/sdk"));
const Configuration_1 = __importStar(require("./Configuration"));
const Request_1 = __importDefault(require("./Request"));
const Response_1 = __importDefault(require("./Response"));
function handleRequest(configuration) {
    return __awaiter(this, void 0, void 0, function* () {
        const { state, queryConfig, host, cloud, index, connectionOptions, postProcessRequestBodyFn } = configuration;
        const { apiKey, headers } = connectionOptions || {};
        const searchkitConfig = (0, Configuration_1.default)({
            state,
            queryConfig,
            cloud,
            host,
            index,
            apiKey,
            headers,
            postProcessRequestBodyFn
        });
        const request = (0, sdk_1.default)(searchkitConfig);
        const searchkitVariables = (0, Request_1.default)(state, queryConfig);
        const baseFilters = (0, Configuration_1.buildBaseFilters)(queryConfig.filters);
        const results = yield request
            .query(searchkitVariables.query)
            .setFilters(searchkitVariables.filters)
            .setSortBy(searchkitVariables.sort)
            .execute({
            facets: queryConfig.facets && Object.keys(queryConfig.facets).length > 0,
            hits: {
                from: searchkitVariables.from,
                size: searchkitVariables.size,
                includeRawHit: true
            }
        }, baseFilters);
        return (0, Response_1.default)(results);
    });
}
exports.default = handleRequest;
