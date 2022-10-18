"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
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
const search_1 = __importDefault(require("./handlers/search"));
const autocomplete_1 = __importDefault(require("./handlers/autocomplete"));
__exportStar(require("./types"), exports);
class ElasticsearchAPIConnector {
    constructor(config, postProcessRequestBodyFn) {
        this.config = config;
        this.postProcessRequestBodyFn = postProcessRequestBodyFn;
        if (!config.host && !config.cloud) {
            throw new Error("Either host or cloud configuration must be provided");
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onResultClick() { }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onAutocompleteResultClick() { }
    onSearch(state, queryConfig) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return (0, search_1.default)({
                state,
                queryConfig,
                cloud: this.config.cloud,
                host: this.config.host,
                index: this.config.index,
                connectionOptions: {
                    apiKey: this.config.apiKey,
                    headers: (_a = this.config.connectionOptions) === null || _a === void 0 ? void 0 : _a.headers
                },
                postProcessRequestBodyFn: this.postProcessRequestBodyFn
            });
        });
    }
    onAutocomplete(state, queryConfig) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return (0, autocomplete_1.default)({
                state,
                queryConfig,
                cloud: this.config.cloud,
                host: this.config.host,
                index: this.config.index,
                connectionOptions: {
                    apiKey: this.config.apiKey,
                    headers: (_a = this.config.connectionOptions) === null || _a === void 0 ? void 0 : _a.headers
                }
            });
        });
    }
}
exports.default = ElasticsearchAPIConnector;
