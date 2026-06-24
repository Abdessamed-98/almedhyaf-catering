/** Tiny className combiner — filters falsy values and joins with spaces. */
export const cn = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ');
