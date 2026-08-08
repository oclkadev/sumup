import pc from 'picocolors';

import { store } from '@/core/config';
import { io } from '@/ui/io';

interface ConfigPathOptions {
  raw?: boolean;
}

export async function configPathHandler(
  options: ConfigPathOptions,
): Promise<void> {
  const { path } = store;

  if (options.raw) {
    io.log(path);
    return;
  }

  io.info(`Configuration file: ${pc.bold(io.fileLink(path))}`);
}
