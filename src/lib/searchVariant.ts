/**
 * Design exploration: which variant a query param asks for (`?about=a`), or
 * null for anything else, no param, or no window. Read once at module load,
 * never during render.
 */
export function searchVariant<T extends string>(
  search: string,
  param: string,
  allowed: readonly T[],
): T | null {
  const value = new URLSearchParams(search).get(param);
  return allowed.find((v) => v === value) ?? null;
}
