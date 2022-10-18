"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../index"));
describe("analytics plugin", () => {
    it("should detect elastic analytics presence", () => {
        window["elasticAnalytics"] = jest.fn();
        expect(() => {
            (0, index_1.default)();
        }).not.toThrowError();
    });
    it("should not detect elastic analytics presence", () => {
        window["elasticAnalytics"] = undefined;
        expect(() => {
            (0, index_1.default)();
        }).toThrowError();
    });
    it("should allow elastic analytics to be passed in as argument", () => {
        window["elasticAnalytics"] = { trackEvent: jest.fn() };
        const internalClient = { trackEvent: jest.fn() };
        const eaPlugin = (0, index_1.default)({
            client: internalClient
        });
        eaPlugin.subscribe({
            type: "SearchQuery",
            query: "test",
            totalResults: 0
        });
        expect(window["elasticAnalytics"].trackEvent).not.toBeCalled();
        expect(internalClient.trackEvent).toBeCalled();
    });
    it("should dispatch event to elastic analytics client", () => {
        window["elasticAnalytics"] = { trackEvent: jest.fn() };
        const eaPlugin = (0, index_1.default)();
        eaPlugin.subscribe({
            type: "SearchQuery",
            query: "test",
            totalResults: 0
        });
        expect(window["elasticAnalytics"].trackEvent).toBeCalledWith("search", {
            type: "SearchQuery",
            query: "test",
            totalResults: 0
        });
    });
});
