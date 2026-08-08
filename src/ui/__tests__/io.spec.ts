import path from 'node:path';

import { io } from '@/ui/io';

import { mockTTY } from '../../../tests/unit/helpers/mock-tty';

afterEach(() => {
  io.reset();
});

describe('configure', () => {
  it('sets all flags from options', () => {
    io.configure({ quiet: true, verbose: true, dryRun: true });

    expect(io.quiet).toBe(true);
    expect(io.verbose).toBe(true);
    expect(io.dryRun).toBe(true);
  });

  it.each([
    [{ quiet: true }, { quiet: true, verbose: false, dryRun: false }],
    [{ verbose: true }, { quiet: false, verbose: true, dryRun: false }],
    [{ dryRun: true }, { quiet: false, verbose: false, dryRun: true }],
    [{}, { quiet: false, verbose: false, dryRun: false }],
  ])('sets flags correctly for %j', (input, expected) => {
    io.configure(input);

    expect(io.quiet).toBe(expected.quiet);
    expect(io.verbose).toBe(expected.verbose);
    expect(io.dryRun).toBe(expected.dryRun);
  });
});

describe('reset', () => {
  it('resets all flags to false', () => {
    io.configure({ quiet: true, verbose: true, dryRun: true });

    io.reset();

    expect(io.quiet).toBe(false);
    expect(io.verbose).toBe(false);
    expect(io.dryRun).toBe(false);
  });
});

describe('log', () => {
  it('calls console.log with message when not quiet', () => {
    const spy = vi.spyOn(console, 'log');

    io.log('hello', 'extra');

    expect(spy).toHaveBeenCalledWith('hello', 'extra');
  });

  it('does not call console.log when quiet', () => {
    const spy = vi.spyOn(console, 'log');
    io.configure({ quiet: true });

    io.log('hello');

    expect(spy).not.toHaveBeenCalled();
  });
});

describe('info', () => {
  it('calls console.log with info icon prefix when not quiet', () => {
    const spy = vi.spyOn(console, 'log');

    io.info('message');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('message'));
  });

  it('does not call console.log when quiet', () => {
    const spy = vi.spyOn(console, 'log');
    io.configure({ quiet: true });

    io.info('message');

    expect(spy).not.toHaveBeenCalled();
  });
});

describe('success', () => {
  it('calls console.log with tick icon prefix when not quiet', () => {
    const spy = vi.spyOn(console, 'log');

    io.success('done');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('done'));
  });

  it('does not call console.log when quiet', () => {
    const spy = vi.spyOn(console, 'log');
    io.configure({ quiet: true });

    io.success('done');

    expect(spy).not.toHaveBeenCalled();
  });
});

describe('warn', () => {
  it('calls console.warn with warning icon prefix when not quiet', () => {
    const spy = vi.spyOn(console, 'warn');

    io.warn('caution');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('caution'));
  });

  it('does not call console.warn when quiet', () => {
    const spy = vi.spyOn(console, 'warn');
    io.configure({ quiet: true });

    io.warn('caution');

    expect(spy).not.toHaveBeenCalled();
  });
});

describe('error', () => {
  it('calls console.error with cross icon prefix', () => {
    const spy = vi.spyOn(console, 'error');

    io.error('boom');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('boom'));
  });

  it('calls console.error even when quiet', () => {
    const spy = vi.spyOn(console, 'error');
    io.configure({ quiet: true });

    io.error('boom');

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('debug', () => {
  it('does not call console.log when not verbose', () => {
    const spy = vi.spyOn(console, 'log');

    io.debug('details');

    expect(spy).not.toHaveBeenCalled();
  });

  it('calls console.log with pointer icon prefix when verbose', () => {
    const spy = vi.spyOn(console, 'log');
    io.configure({ verbose: true });

    io.debug('details');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('details'));
  });
});

describe('table', () => {
  it('calls console.log with formatted table when not quiet', () => {
    const spy = vi.spyOn(console, 'log');

    io.table([
      ['a', 'b'],
      ['c', 'd'],
    ]);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('a'));
  });

  it('passes separator as hsep to text-table', () => {
    const spy = vi.spyOn(console, 'log');

    io.table([['a', 'b']], { separator: ' | ' });

    expect(spy).toHaveBeenCalledWith(expect.stringContaining('a | b'));
  });

  it('does not call console.log when quiet', () => {
    const spy = vi.spyOn(console, 'log');
    io.configure({ quiet: true });

    io.table([['a', 'b']]);

    expect(spy).not.toHaveBeenCalled();
  });
});

describe('json', () => {
  it('calls console.log with stringified value when not quiet', () => {
    const spy = vi.spyOn(console, 'log');

    io.json({ key: 'value' });

    expect(spy).toHaveBeenCalledWith(
      JSON.stringify({ key: 'value' }, undefined, 2),
    );
  });

  it('does not call console.log when quiet', () => {
    const spy = vi.spyOn(console, 'log');
    io.configure({ quiet: true });

    io.json({ key: 'value' });

    expect(spy).not.toHaveBeenCalled();
  });
});

describe('link', () => {
  it('returns plain text when stdout is not TTY', () => {
    mockTTY(false);

    const result = io.link('click here', 'https://example.com');

    expect(result).toBe('click here');
  });

  it('returns ANSI escape sequence when stdout is TTY', () => {
    mockTTY(true);

    const result = io.link('click here', 'https://example.com');

    expect(result).toContain('click here');
    expect(result).toContain('https://example.com');
    expect(result).toContain('\u{1B}]8;;');
  });
});

describe('fileLink', () => {
  it('returns absolute path as link text when not TTY', () => {
    mockTTY(false);

    const absolutePath = path.join(process.cwd(), 'src', 'index.ts');
    const result = io.fileLink(absolutePath);

    expect(result).toBe(absolutePath);
  });

  it('returns ANSI link with file:// protocol when TTY', () => {
    mockTTY(true);

    const absolutePath = path.join(process.cwd(), 'src', 'index.ts');
    const result = io.fileLink(absolutePath);

    expect(result).toContain(absolutePath);
    expect(result).toContain(`file://${absolutePath}`);
  });
});
