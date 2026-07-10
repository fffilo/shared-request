import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { sharedRequest } from "./utils/setup.js";

test("deduplicates identical requests", async () => {
    let calls = 0;

    global.fetch = async () => {
        calls++;

        return new Response(JSON.stringify({
            value: 123,
        }), {
            headers: {
                "Content-Type": "application/json",
            },
        });
    };

    const a = sharedRequest("/test");
    const b = sharedRequest("/test");

    const [resultA, resultB] = await Promise.all([a, b]);

    assert.equal(calls, 1);
    assert.deepEqual(resultA, { value: 123 });
    assert.deepEqual(resultB, { value: 123 });
});



