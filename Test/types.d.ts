import type Game from "../Data/Game.js";
import "vitest";

declare global {
    var game: Game;
}

interface CustomMatchers<R = unknown> {
    toBeInvokedWith: (...args: any) => R;
}

declare module "vitest" {
    interface Matchers<T = any> extends CustomMatchers<T> {}
}

export {};
