import {readdir, unlink} from "node:fs/promises";

export async function clearAllFiles() {
  const dir = await readdir("./__tests__/data");
  console.log(dir)

  for (const name of dir) {
    await unlink(`./__tests__/data/${name}`);
  }
}