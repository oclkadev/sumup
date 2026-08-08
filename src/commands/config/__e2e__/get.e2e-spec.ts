import { runCli } from '@/tests/e2e/helpers/run-cli';

describe('config get (e2e)', () => {
  it.each([
    ['output.format', 'markdown'],
    ['output.mode', 'both'],
    ['naming.pattern', '.sumup_<timestamp>.md'],
    ['git.baseBranch', 'main'],
  ])(
    'outputs formatted %s with default value %s',
    async (key, expected) => {
      const { stdout, exitCode } = await runCli('config', 'get', key);

      expect(exitCode).toBe(0);
      expect(stdout).toContain(`${key}:`);
      expect(stdout).toContain(expected);
    },
    30_000,
  );

  it('outputs raw value with --raw flag', async () => {
    const { stdout, exitCode } = await runCli(
      'config',
      'get',
      'output.format',
      '--raw',
    );

    expect(exitCode).toBe(0);
    expect(String(stdout).trim()).toBe('markdown');
  });

  it('exits with error for unknown key', async () => {
    const { stderr, exitCode } = await runCli('config', 'get', 'unknown.key');

    expect(exitCode).toBe(1);
    expect(stderr).toMatch(/Unknown configuration key/);
  });

  it('exits with error for missing key argument', async () => {
    const { stderr, exitCode } = await runCli('config', 'get');

    expect(exitCode).toBe(1);
    expect(stderr).toMatch(/error/);
  });
});
