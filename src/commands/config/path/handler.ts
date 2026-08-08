import pc from 'picocolors';

import { getStore } from '@/core/config';
import { io } from '@/ui/io';

interface ConfigPathOptions {
  raw?: boolean;
}

export async function configPathHandler(
  options: ConfigPathOptions,
): Promise<void> {
  const { path } = getStore();

  if (options.raw) {
    io.log(path);
    return;
  }

  io.info(`Configuration file: ${pc.bold(io.fileLink(path))}`);
}
