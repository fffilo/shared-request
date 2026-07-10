import { beforeEach, afterEach } from "node:test";
import sharedRequest, { hasCacheKey, clearCacheKey, clearCache } from "../../index.js";

beforeEach(() => {
    clearCache();
});

afterEach(() => {
    clearCache();

    delete global.fetch;
});

export {
    sharedRequest,
    hasCacheKey,
    clearCacheKey,
    clearCache,
};
