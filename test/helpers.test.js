import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { sharedRequest, hasCacheKey, clearCacheKey, clearCache } from "./utils/setup.js";

test("hasCacheKey works", async () => {
    global.fetch = async () => new Response("ok");

    await sharedRequest("/users");

    assert.equal(hasCacheKey("GET /users"), true);
    assert.equal(hasCacheKey("GET /missing"), false);
});

test("clearCacheKey removes one entry", async () => {
    global.fetch = async () => new Response("ok");

    await sharedRequest("/users");
    await sharedRequest("/posts");

    assert.equal(hasCacheKey("GET /users"), true);
    assert.equal(hasCacheKey("GET /posts"), true);

    clearCacheKey("GET /users");

    assert.equal(hasCacheKey("GET /users"), false);
    assert.equal(hasCacheKey("GET /posts"), true);
});

test("clearCache removes all entries", async () => {
    global.fetch = async () => new Response("ok");

    await sharedRequest("/users");
    await sharedRequest("/posts");

    assert.equal(hasCacheKey("GET /users"), true);
    assert.equal(hasCacheKey("GET /posts"), true);

    clearCache();

    assert.equal(hasCacheKey("GET /users"), false);
    assert.equal(hasCacheKey("GET /posts"), false);
});
