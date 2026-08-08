import { Command } from 'commander';

import { OPTION_RAW } from '@/commands/options';

import { configPathHandler } from './handler';

export const configPathCommand = new Command('path')
  .description('Get the path to the configuration file')
  .option(...OPTION_RAW)
  .action(configPathHandler);
