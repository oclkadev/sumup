import { runCli } from '@/tests/e2e/helpers/run-cli';

describe('config path (e2e)', () => {
  it('outputs formatted path by default', async () => {
    const { stdout, exitCode } = await runCli('config', 'path');

    expect(exitCode).toBe(0);
    expect(stdout).toContain('Configuration file:');
    expect(stdout).toMatch(/sumup-config\.json/);
  });

  it('outputs raw path with --raw flag', async () => {
    const { stdout, exitCode } = await runCli('config', 'path', '--raw');

    expect(exitCode).toBe(0);
    expect(String(stdout).trim()).toMatch(/sumup-config\.json$/);
  });
});
