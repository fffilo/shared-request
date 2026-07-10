import { beforeEach, afterEach } from "node:test";
import sharedRequest from "../../index.js";

beforeEach(() => {
    sharedRequest.clearCache();
});

afterEach(() => {
    sharedRequest.clearCache();

    delete global.fetch;
});

export {
    sharedRequest,
};
