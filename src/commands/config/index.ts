import { Command } from 'commander';

import { configGetCommand } from '@/commands/config/get';

export const configCommand = new Command('config')
  .description('Manage configuration')
  .addCommand(configGetCommand);
