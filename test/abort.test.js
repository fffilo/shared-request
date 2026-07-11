import { test  } from "node:test";
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

test("abort rejects immediately without waiting for the shared request", async () => {
    let resolveFetch;
    global.fetch = () =>
        new Promise(resolve => {
            resolveFetch = () => resolve(new Response("ok"));
        });

    const controller = new AbortController();
    const request = sharedRequest("/test", {
        signal: controller.signal,
    });

    controller.abort();
    await assert.rejects(request, {
        name: "AbortError",
    });

    // The shared request should still complete successfully.
    resolveFetch();
});

test("already aborted signal rejects immediately", async () => {
    global.fetch = async () => {
        assert.fail("fetch should not be called");
    };

    const controller = new AbortController();
    controller.abort();

    await assert.rejects(
        sharedRequest("/test", {
            signal: controller.signal,
        }),
        {
            name: "AbortError",
        }
    );
});
