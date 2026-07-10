import { test } from "node:test";
import assert from "node:assert/strict";
import { sharedRequest } from "./utils/setup.js";

test("supports custom parser", async () => {
    global.fetch = async () => new Response("123");

    const result = await sharedRequest("/test", {
        parser: response => response.text().then(Number),
    });

    assert.equal(result, 123);
});
