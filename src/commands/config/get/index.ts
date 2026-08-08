import { Command } from 'commander';

import { OPTION_QUIET, OPTION_RAW, OPTION_VERBOSE } from '@/commands/options';

import { configGetHandler } from './handler';

export const configGetCommand = new Command('get')
  .description('Get the value of a configuration key')
  .argument('<key>', 'Configuration key (e.g. output.format)')
  .option(...OPTION_QUIET)
  .option(...OPTION_VERBOSE)
  .option(...OPTION_RAW)
  .action(configGetHandler);
