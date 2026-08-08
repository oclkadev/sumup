import { Command } from 'commander';

import { configGetCommand } from '@/commands/config/get';
import { configPathCommand } from '@/commands/config/path';

export const configCommand = new Command('config')
  .description('Manage configuration')
  .addCommand(configGetCommand)
  .addCommand(configPathCommand);
