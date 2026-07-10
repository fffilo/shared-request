import { test } from "node:test";
import assert from "node:assert/strict";
import { createSharedRequest } from "./utils/setup.js";

test("default instance deduplicates requests", async () => {
    let calls = 0;
    global.fetch = async () => {
        calls++;

        return new Response("ok");
    };

    const api = createSharedRequest();
    await Promise.all([
        api("/test"),
        api("/test"),
    ]);

    assert.equal(calls, 1);
});

test("different instances use independent caches", async () => {
    let calls = 0;
    global.fetch = async () => {
        calls++;

        return new Response("ok");
    };

    const api1 = createSharedRequest();
    const api2 = createSharedRequest();

    await Promise.all([
        api1("/test"),
        api2("/test"),
    ]);

    assert.equal(calls, 2);
});

test("helper methods operate on their own instance", async () => {
    global.fetch = async () => new Response("ok");

    const api1 = createSharedRequest();
    const api2 = createSharedRequest();

    await api1("/test");

    assert.equal(api1.hasCacheKey("GET /test"), true);
    assert.equal(api2.hasCacheKey("GET /test"), false);

    api1.clearCache();

    assert.equal(api1.hasCacheKey("GET /test"), false);
    assert.equal(api2.hasCacheKey("GET /test"), false);
});

test("clearing one instance does not affect another", async () => {
    global.fetch = async () => new Response("ok");

    const api1 = createSharedRequest();
    const api2 = createSharedRequest();

    await api1("/one");
    await api2("/two");

    api1.clearCache();

    assert.equal(api1.hasCacheKey("GET /one"), false);
    assert.equal(api2.hasCacheKey("GET /two"), true);
});
