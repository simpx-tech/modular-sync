export function isBooleanStringNumber (data: unknown): data is number | string | boolean {
  return ["boolean", "string", "number"].includes(typeof data);
}