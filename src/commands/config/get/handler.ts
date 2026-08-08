import pc from 'picocolors';

import { getStore } from '@/core/config';
import { io } from '@/ui/io';

interface ConfigGetOptions {
  raw?: boolean;
}

export async function configGetHandler(
  key: string,
  options: ConfigGetOptions,
): Promise<void> {
  const value = getStore().get(key);

  if (options.raw) {
    io.log(value);
    return;
  }

  io.info(`${key}: ${pc.bold(String(value))}`);
}
