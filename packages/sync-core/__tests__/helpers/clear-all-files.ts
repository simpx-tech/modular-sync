import {readdir, unlink} from "node:fs/promises";

export async function clearAllFiles() {
  const dir = await readdir("./__tests__/data");

  for (const name of dir) {
    await unlink(`./__tests__/data/${name}`);
  }
}