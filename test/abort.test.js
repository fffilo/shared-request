import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { sharedRequest } from "./utils/setup.js";

test("aborting one caller does not abort shared request", async () => {
    let resolveFetch;
    global.fetch = () => new Promise(resolve => {
        resolveFetch = resolve;
    });

    const controller = new AbortController();
    const abortedRequest = sharedRequest("/test", { signal: controller.signal });
    const normalRequest = sharedRequest("/test");

    controller.abort();
    resolveFetch(new Response("done"));

    await assert.rejects(abortedRequest, { name: "AbortError" });
    assert.equal(await normalRequest, "done");
});
