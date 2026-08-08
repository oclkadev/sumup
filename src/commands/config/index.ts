import { Command } from 'commander';

import { configGetCommand } from '@/commands/config/get';
import { configPathCommand } from '@/commands/config/path';
import { configVerifyCommand } from '@/commands/config/verify';

export const configCommand = new Command('config')
  .description('Manage configuration')
  .addCommand(configGetCommand)
  .addCommand(configPathCommand)
  .addCommand(configVerifyCommand);
