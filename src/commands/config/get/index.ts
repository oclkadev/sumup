import { Command } from 'commander';

import { OPTION_RAW } from '@/commands/options';

import { configGetHandler } from './handler';

export const configGetCommand = new Command('get')
  .description('Get the value of a configuration key')
  .argument('<key>', 'Configuration key (e.g. output.format)')
  .option(...OPTION_RAW)
  .action(configGetHandler);
