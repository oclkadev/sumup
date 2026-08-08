import figures from 'figures';
import pc from 'picocolors';
import textTable from 'text-table';

export const io = {
  quiet: false,
  verbose: false,
  dryRun: false,

  configure(options: { quiet?: boolean; verbose?: boolean; dryRun?: boolean }) {
    io.quiet = options.quiet ?? false;
    io.verbose = options.verbose ?? false;
    io.dryRun = options.dryRun ?? false;
  },

  reset() {
    io.quiet = false;
    io.verbose = false;
    io.dryRun = false;
  },

  log: (message: unknown, ...arguments_: unknown[]) => {
    if (io.quiet) return;
    console.log(message, ...arguments_);
  },

  info: (message: string, ...arguments_: unknown[]) => {
    if (io.quiet) return;
    console.log(`${pc.cyan(figures.info)} ${message}`, ...arguments_);
  },

  success: (message: string, ...arguments_: unknown[]) => {
    if (io.quiet) return;
    console.log(`${pc.green(figures.tick)} ${message}`, ...arguments_);
  },

  warn: (message: string, ...arguments_: unknown[]) => {
    if (io.quiet) return;
    console.warn(`${pc.yellow(figures.warning)} ${message}`, ...arguments_);
  },

  error: (message: string, ...arguments_: unknown[]) => {
    console.error(`${pc.red(figures.cross)} ${message}`, ...arguments_);
  },

  debug: (message: string, ...arguments_: unknown[]) => {
    if (!io.verbose) return;
    console.log(`${pc.dim(figures.pointerSmall)} ${message}`, ...arguments_);
  },

  table: (
    rows: string[][],
    options?: {
      align?: ('l' | 'r' | 'c' | '.')[];
      separator?: string;
      stringLength?: (s: string) => number;
    },
  ) => {
    if (io.quiet) return;
    const { separator, ...rest } = options ?? {};
    console.log(
      textTable(rows, separator ? { ...rest, hsep: separator } : rest),
    );
  },

  json: (value: unknown) => {
    if (io.quiet) return;
    console.log(JSON.stringify(value, undefined, 2));
  },

  link: (text: string, target: string): string => {
    if (!process.stdout.isTTY) return text;
    return `\u{1B}]8;;${target}\u{7}${text}\u{1B}]8;;\u{7}`;
  },

  fileLink: (absolutePath: string): string => {
    return io.link(absolutePath, `file://${absolutePath}`);
  },
};
