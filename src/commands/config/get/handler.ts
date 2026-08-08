import pc from 'picocolors';

import { store } from '@/core/config';
import { io } from '@/ui/io';

interface ConfigGetOptions {
  raw?: boolean;
}

export async function configGetHandler(
  key: string,
  options: ConfigGetOptions,
): Promise<void> {
  const value = store.get(key);

  if (options.raw) {
    io.log(value);
    return;
  }

  io.info(`${key}: ${pc.bold(String(value))}`);
}
