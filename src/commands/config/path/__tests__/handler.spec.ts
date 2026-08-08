import { configPathHandler } from '@/commands/config/path/handler';
import { store } from '@/core/config';
import { io } from '@/ui/io';

vi.mock('@/core/config');
vi.mock('@/ui/io');
vi.mock('picocolors', () => ({
  default: { bold: (value: string) => value },
}));

describe('configPathHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(store, 'path', {
      get: () => '/mock/config.json',
      configurable: true,
    });
  });

  it('calls io.log with store path when raw is true', async () => {
    await configPathHandler({ raw: true });

    expect(io.log).toHaveBeenCalledWith('/mock/config.json');
    expect(io.info).not.toHaveBeenCalled();
  });

  it('calls io.info with formatted file link when raw is false', async () => {
    vi.mocked(io.fileLink).mockReturnValue('/mock/config.json');

    await configPathHandler({ raw: false });

    expect(io.fileLink).toHaveBeenCalledWith('/mock/config.json');
    expect(io.info).toHaveBeenCalledWith(
      'Configuration file: /mock/config.json',
    );
    expect(io.log).not.toHaveBeenCalled();
  });

  it('calls io.info with formatted file link when raw is undefined', async () => {
    vi.mocked(io.fileLink).mockReturnValue('/mock/config.json');

    await configPathHandler({});

    expect(io.info).toHaveBeenCalledWith(
      'Configuration file: /mock/config.json',
    );
    expect(io.log).not.toHaveBeenCalled();
  });

  it('does not call io.log when raw is false', async () => {
    vi.mocked(io.fileLink).mockReturnValue('/mock/config.json');

    await configPathHandler({ raw: false });

    expect(io.log).not.toHaveBeenCalled();
  });

  it('does not call io.info when raw is true', async () => {
    await configPathHandler({ raw: true });

    expect(io.info).not.toHaveBeenCalled();
  });
});
