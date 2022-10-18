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
Object.defineProperty(exports, "__esModule", { value: true });
function request(engineKey, method, path, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const headers = new Headers({
            "Content-Type": "application/json"
        });
        const response = yield fetch(`https://search-api.swiftype.com/api/v1/public/${path}`, {
            method,
            headers,
            body: JSON.stringify(Object.assign({ engine_key: engineKey }, params)),
            credentials: "include"
        });
        let json;
        try {
            json = yield response.json();
        }
        catch (error) {
            // Nothing to do here, certain responses won't have json
        }
        if (response.status >= 200 && response.status < 300) {
            return json;
        }
        else {
            const message = json && json.errors && Object.entries(json.errors).length > 0
                ? JSON.stringify(json.errors)
                : response.status;
            throw new Error(`${message}`);
        }
    });
}
exports.default = request;
