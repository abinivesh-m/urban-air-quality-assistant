/**
 * Public surface of the air quality domain.
 *
 * Consumers import from `@/lib/air-quality` only. Splitting the internals into
 * focused modules keeps each file single-purpose while this barrel keeps the
 * import surface stable.
 */

export * from "./categories";
export * from "./cities";
export * from "./format";
export * from "./pollutants";
export * from "./recommendations";
export * from "./types";
