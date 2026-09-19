export const normalizeText = (value: string | null | undefined): string => {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[_\s]+/g, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim();
};

export const normalizeProductGroup = (value: string | null | undefined): string => {
  return normalizeText(value);
};

export const isProductGroup = (
  value: string | null | undefined,
  group: string,
): boolean => {
  return normalizeProductGroup(value).startsWith(normalizeText(group));
};