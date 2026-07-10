import { test } from "node:test";
import assert from "node:assert/strict";
import { sharedRequest } from "./utils/setup.js";

test("hasCacheKey works", async () => {
    global.fetch = async () => new Response("ok");

    await sharedRequest("/users");

    assert.equal(sharedRequest.hasCacheKey("GET /users"), true);
    assert.equal(sharedRequest.hasCacheKey("GET /missing"), false);
});

test("clearCacheKey removes one entry", async () => {
    global.fetch = async () => new Response("ok");

    await sharedRequest("/users");
    await sharedRequest("/posts");

    assert.equal(sharedRequest.hasCacheKey("GET /users"), true);
    assert.equal(sharedRequest.hasCacheKey("GET /posts"), true);

    sharedRequest.clearCacheKey("GET /users");

    assert.equal(sharedRequest.hasCacheKey("GET /users"), false);
    assert.equal(sharedRequest.hasCacheKey("GET /posts"), true);
});

test("clearCache removes all entries", async () => {
    global.fetch = async () => new Response("ok");

    await sharedRequest("/users");
    await sharedRequest("/posts");

    assert.equal(sharedRequest.hasCacheKey("GET /users"), true);
    assert.equal(sharedRequest.hasCacheKey("GET /posts"), true);

    sharedRequest.clearCache();

    assert.equal(sharedRequest.hasCacheKey("GET /users"), false);
    assert.equal(sharedRequest.hasCacheKey("GET /posts"), false);
});
