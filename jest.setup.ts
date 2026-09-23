import "@testing-library/jest-dom";
import "fake-indexeddb/auto";

// jest-environment-jsdom doesn't expose structuredClone on the global scope —
// fake-indexeddb needs it to clone values on put/add. The stored values here are always
// plain JSON (strings/numbers/plain objects), so a JSON round-trip is a fine substitute.
if (typeof global.structuredClone === "undefined") {
    global.structuredClone = (v: unknown) => JSON.parse(JSON.stringify(v));
}

// jsdom doesn't implement matchMedia at all — polyfill it so components that
// check display-mode/theme media queries (e.g. useInstallPrompt) don't throw.
if (typeof window !== "undefined" && !window.matchMedia) {
    window.matchMedia = (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
