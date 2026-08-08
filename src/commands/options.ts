export const OPTION_DRY_RUN = [
  '--dry-run -n',
  'Show what would be done without actually doing it',
] as const;

export const OPTION_VERBOSE = [
  '--verbose -V',
  'Enable verbose logging',
] as const;

export const OPTION_QUIET = ['--quiet -q', 'Suppress all output'] as const;

export const OPTION_RAW = [
  '--raw',
  'Output raw values without formatting',
] as const;
