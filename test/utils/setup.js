import { beforeEach, afterEach } from "node:test";
import sharedRequest, { createSharedRequest } from "../../index.js";

beforeEach(() => {
    sharedRequest.clearCache();
});

afterEach(() => {
    sharedRequest.clearCache();

    delete global.fetch;
});

export {
    sharedRequest,
    createSharedRequest,
};
