export function convertId(id: string | number) {
  return typeof id === "string"
    ? /^\d+$/.test(String(id))
      ? parseInt(id, 10)
      : id
    : id;
}