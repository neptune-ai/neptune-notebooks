
import pathLib from 'path-browserify';
import { PlatformNotebook } from "types/platform";

export async function findNonExistantPath(path: string, platformNotebook: PlatformNotebook) {

  const ext = pathLib.extname(path);
  const filename = pathLib.basename(path, ext);

  let counter = 0;
  let newPath = `${filename}${ext}`;

  while (true) {
    try {
      await platformNotebook.assertNotebook(newPath);
    }
    catch (error) {
      // file does not exist
      break;
    }

    // file exists - check another name
    newPath = `${filename}${++counter}${ext}`;
  }

  return newPath; 
}

