"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../index"));
describe("elasticsearch connector interface", () => {
    it("should throw an exception when host or cloud not specified", () => {
        expect(() => {
            new index_1.default({
                index: "test"
            });
        }).toThrowError("Either host or cloud configuration must be provided");
    });
});
