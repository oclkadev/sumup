import { version } from '@/../package.json';
import { runCli } from '@/tests/e2e/helpers/run-cli';

describe('CLI e2e', () => {
  describe('--version', () => {
    it.each(['-v', '--version'])(
      'outputs version with %s',
      async (flag) => {
        const { stdout, exitCode } = await runCli(flag);

        expect(exitCode).toBe(0);
        expect(String(stdout).trim()).toBe(version);
      },
      30_000,
    );
  });

  describe('--help', () => {
    it.each(['-h', '--help'])(
      'outputs root help with %s',
      async (flag) => {
        const { stdout, exitCode } = await runCli(flag);

        expect(exitCode).toBe(0);
        expect(stdout).toMatch(/Usage: cli \[options\] \[command\]/);
        expect(stdout).toMatch(/Options:/);
        expect(stdout).toMatch(/-v, --version/);
        expect(stdout).toMatch(/-h, --help/);
        expect(stdout).toMatch(/Commands:/);
      },
      30_000,
    );

    it('outputs subcommand help with config -h', async () => {
      const { stdout, exitCode } = await runCli('config', '-h');

      expect(exitCode).toBe(0);
      expect(stdout).toMatch(/Usage: cli config \[options\] \[command\]/);
      expect(stdout).toMatch(/Manage configuration/);
      expect(stdout).toMatch(/Commands:/);
    }, 30_000);
  });
});
