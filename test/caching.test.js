import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { sharedRequest } from "./utils/setup.js";

test("uses cached response", async () => {
    let calls = 0;

    global.fetch = async () => {
        calls++;

        return new Response("hello", {
            headers: {
                "Content-Type": "text/plain",
            },
        });
    };


    const first = await sharedRequest("/test");
    const second = await sharedRequest("/test");

    assert.equal(calls, 1);
    assert.equal(first, "hello");
    assert.equal(second, "hello");
});

test("removes failed requests from cache", async () => {
    let calls = 0;

    global.fetch = async () => {
        calls++;
        if (calls === 1)
            throw new Error("network failed");

        return new Response("ok");
    };


    await assert.rejects(sharedRequest("/test"), /network failed/);

    const result = await sharedRequest("/test");
    assert.equal(result, "ok");
    assert.equal(calls, 2);
});

test("removes cached response after TTL", async () => {
    let calls = 0;
    global.fetch = async () => {
        calls++;

        return new Response("ok");
    };

    await sharedRequest("/test", { ttl: 20 });
    await new Promise(resolve => setTimeout(resolve, 50));
    await sharedRequest("/test", { ttl: 20 });

    assert.equal(calls, 2);
});

test("rejects failed HTTP responses", async () => {
    global.fetch = async () => {
        return new Response(null, {
            status: 500,
        });
    };

    await assert.rejects(sharedRequest("/test"), /HTTP 500/);
});
