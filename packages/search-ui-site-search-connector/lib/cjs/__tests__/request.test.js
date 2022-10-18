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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = __importDefault(require("../request"));
const responseJson = {};
function fetchResponse(response, statusCode) {
    return Promise.resolve({
        status: statusCode,
        json: () => {
            if (response) {
                return Promise.resolve(response);
            }
            else {
                throw new Error("Couldn't parse");
            }
        }
    });
}
beforeEach(() => {
    global.Headers = jest.fn();
    global.fetch = jest.fn().mockReturnValue(fetchResponse(responseJson, 200));
});
function respondWithSuccess(json) {
    global.fetch = jest.fn().mockReturnValue(fetchResponse(json, 200));
}
function respondWithError(json) {
    global.fetch = jest.fn().mockReturnValue(fetchResponse(json, 401));
}
function subject() {
    return (0, request_1.default)("engine", "GET", "test", {});
}
it("will return json on successful request with json", () => __awaiter(void 0, void 0, void 0, function* () {
    respondWithSuccess(responseJson);
    const response = yield subject();
    expect(response).toEqual(responseJson);
}));
it("will return undefined on successful request without json", () => __awaiter(void 0, void 0, void 0, function* () {
    respondWithSuccess();
    const response = yield subject();
    expect(response).toBeUndefined();
}));
it("will throw with status on unsuccessful request without json", () => __awaiter(void 0, void 0, void 0, function* () {
    respondWithError();
    let error;
    try {
        error = yield subject();
    }
    catch (e) {
        error = e;
    }
    expect(error.message).toEqual("401");
}));
it("will throw with message on unsuccessful request with json and message", () => __awaiter(void 0, void 0, void 0, function* () {
    respondWithError({
        errors: { some_parameter: ["I am a server error message"] }
    });
    let error;
    try {
        error = yield subject();
    }
    catch (e) {
        error = e;
    }
    expect(error.message).toEqual('{"some_parameter":["I am a server error message"]}');
}));
it("will throw with message on unsuccessful request with json but no message", () => __awaiter(void 0, void 0, void 0, function* () {
    respondWithError({});
    let error;
    try {
        error = yield subject();
    }
    catch (e) {
        error = e;
    }
    expect(error.message).toEqual("401");
}));
