import { configGetHandler } from '@/commands/config/get/handler';
import { store } from '@/core/config';
import { io } from '@/ui/io';

vi.mock('@/core/config');
vi.mock('@/ui/io');
vi.mock('picocolors', () => ({
  default: { bold: (value: string) => value },
}));

describe('configGetHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls store.get with the provided key', async () => {
    vi.mocked(store.get).mockReturnValue('markdown');

    await configGetHandler('output.format', {});

    expect(store.get).toHaveBeenCalledWith('output.format');
  });

  it('calls io.info with formatted key and value when raw is false', async () => {
    vi.mocked(store.get).mockReturnValue('markdown');

    await configGetHandler('output.format', { raw: false });

    expect(io.info).toHaveBeenCalledWith('output.format: markdown');
  });

  it('calls io.info with formatted key and value when raw is undefined', async () => {
    vi.mocked(store.get).mockReturnValue('both');

    await configGetHandler('output.mode', {});

    expect(io.info).toHaveBeenCalledWith('output.mode: both');
  });

  it('calls io.log with raw value when raw is true', async () => {
    vi.mocked(store.get).mockReturnValue('markdown');

    await configGetHandler('output.format', { raw: true });

    expect(io.log).toHaveBeenCalledWith('markdown');
    expect(io.info).not.toHaveBeenCalled();
  });

  it('does not call io.log when raw is false', async () => {
    vi.mocked(store.get).mockReturnValue('markdown');

    await configGetHandler('output.format', { raw: false });

    expect(io.log).not.toHaveBeenCalled();
  });

  it('propagates error from store.get for unknown key', async () => {
    vi.mocked(store.get).mockImplementation(() => {
      throw new Error('Unknown configuration key foo');
    });

    await expect(configGetHandler('foo', {})).rejects.toThrow(
      'Unknown configuration key foo',
    );
  });

  it('converts non-string value to string in formatted output', async () => {
    vi.mocked(store.get).mockReturnValue(42);

    await configGetHandler('some.number', {});

    expect(io.info).toHaveBeenCalledWith('some.number: 42');
  });

  it('calls io.log with non-string value as-is when raw is true', async () => {
    vi.mocked(store.get).mockReturnValue(42);

    await configGetHandler('some.number', { raw: true });

    expect(io.log).toHaveBeenCalledWith(42);
  });
});
