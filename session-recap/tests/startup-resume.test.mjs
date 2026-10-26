// Pi reports a session reopened from the command line (`pi -c`, `pi -r`,
// `pi --session <file>`, terminal session restore) as session_start "startup";
// only an in-process switch such as /resume reports "resume". Reopening a
// session with history must draw a recap either way.
import assert from "node:assert/strict";
import test from "node:test";
import { registerApiProvider } from "@earendil-works/pi-ai/compat";
import sessionRecap from "../index.ts";

const API = "recap-startup-test";
let requests = 0;

function stubStream() {
	requests++;
	return {
		result: async () => ({
			role: "assistant",
			content: [{ type: "text", text: "Fixing the bridge integration. Next: rerun the suite." }],
			stopReason: "stop",
		}),
	};
}

registerApiProvider({ api: API, stream: stubStream, streamSimple: stubStream });

function makePi() {
	const handlers = new Map();
	const flags = new Map();
	return {
		emit(event, payload, ctx) {
			for (const handler of handlers.get(event) ?? []) handler(payload, ctx);
		},
		on(event, handler) {
			handlers.set(event, [...(handlers.get(event) ?? []), handler]);
		},
		registerCommand() {},
		registerFlag(name, options) {
			// Keep the test from touching the real terminal's focus reporting.
			flags.set(name, name === "recap-disable-focus" ? true : options.default);
		},
		getFlag(name) {
			return flags.get(name);
		},
	};
}

function makeCtx(branch) {
	const widgets = [];
	const ctx = {
		hasUI: true,
		model: {
			id: "recap-startup-model",
			name: "Recap startup model",
			api: API,
			provider: "recap-startup",
			baseUrl: "http://localhost.invalid",
			reasoning: false,
			input: ["text"],
			cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
			contextWindow: 100_000,
			maxTokens: 4096,
		},
		modelRegistry: {
			find: () => undefined,
			getAvailable: () => [],
			getApiKeyAndHeaders: async () => ({ ok: true, apiKey: "unused" }),
		},
		sessionManager: {
			buildSessionProjection: () => ({
				entries: branch.map((sourceEntry) => ({ sourceEntry, messages: [sourceEntry.message] })),
			}),
			getBranch: () => branch,
		},
		ui: {
			setStatus() {},
			notify() {},
			setWidget(_key, content) {
				if (typeof content === "function") {
					content({ mode: "regular", children: [] }, this.theme);
					return;
				}
				if (content !== undefined) widgets.push(content);
			},
			theme: { fg: (_n, t) => t, bold: (t) => t },
		},
	};
	return { ctx, widgets };
}

const history = [
	{ type: "message", message: { role: "user", content: "Please fix the bridge integration." } },
	{
		type: "message",
		message: {
			role: "assistant",
			content: [{ type: "toolCall", id: "call-1", name: "read", arguments: { path: "bridge.ts" } }],
		},
	},
];

const settle = () => new Promise((resolve) => setTimeout(resolve, 400));

test("reopening a session from the command line draws a recap", async () => {
	requests = 0;
	const pi = makePi();
	sessionRecap(pi);
	const { ctx, widgets } = makeCtx(history);

	pi.emit("session_start", { type: "session_start", reason: "startup" }, ctx);
	await settle();

	assert.equal(requests, 1);
	assert.deepEqual(widgets, [["✦ recap", "Fixing the bridge integration. Next: rerun the suite."]]);
	pi.emit("session_shutdown", { type: "session_shutdown" }, ctx);
});

test("starting a fresh session draws no recap", async () => {
	requests = 0;
	const pi = makePi();
	sessionRecap(pi);
	const { ctx, widgets } = makeCtx([]);

	pi.emit("session_start", { type: "session_start", reason: "startup" }, ctx);
	await settle();

	assert.equal(requests, 0);
	assert.deepEqual(widgets, []);
	pi.emit("session_shutdown", { type: "session_shutdown" }, ctx);
});

test("reopening with an initial prompt draws no recap", async () => {
	requests = 0;
	const pi = makePi();
	sessionRecap(pi);
	const { ctx, widgets } = makeCtx(history);

	// `pi -c "<prompt>"`: the agent starts before the recap timer fires.
	pi.emit("session_start", { type: "session_start", reason: "startup" }, ctx);
	pi.emit("agent_start", { type: "agent_start" }, ctx);
	await settle();

	assert.equal(requests, 0);
	assert.deepEqual(widgets, []);
	pi.emit("session_shutdown", { type: "session_shutdown" }, ctx);
});
