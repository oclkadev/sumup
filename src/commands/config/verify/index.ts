import { Command } from 'commander';

import { OPTION_QUIET } from '@/commands/options';

import { configVerifyHandler } from './handler';

export const configVerifyCommand = new Command('verify')
  .description('Check the configuration file')
  .option(...OPTION_QUIET)
  .action(configVerifyHandler);
