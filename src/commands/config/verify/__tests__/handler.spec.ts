import { configVerifyHandler } from '@/commands/config/verify/handler';
import { getStore } from '@/core/config';
import { AppError, ErrorCode } from '@/core/errors';
import { io } from '@/ui/io';

vi.mock('@/core/config');
vi.mock('@/ui/io');

describe('configVerifyHandler', () => {
  const store = {
    all: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getStore).mockReturnValue(store as never);
  });

  it('calls io.success when config is valid', async () => {
    store.all.mockReturnValue({});

    await configVerifyHandler();

    expect(io.success).toHaveBeenCalledWith('Configuration is valid.');
  });

  it('throws AppError with formatted error lines when CONFIG_INVALID', async () => {
    store.all.mockImplementation(() => {
      throw new AppError(ErrorCode.CONFIG_INVALID, 'Invalid', 500, {
        errors: [
          {
            field: 'output.format',
            message: 'expected one of "markdown"|"json"',
          },
          {
            field: 'output.mode',
            message: 'expected one of "both"|"copy"|"file"',
          },
        ],
      });
    });

    await expect(configVerifyHandler()).rejects.toThrow(
      'Invalid configuration file\n  - output.format: expected one of "markdown"|"json"\n  - output.mode: expected one of "both"|"copy"|"file"',
    );
    expect(io.success).not.toHaveBeenCalled();
  });

  it('throws AppError with only header when CONFIG_INVALID has no errors', async () => {
    store.all.mockImplementation(() => {
      throw new AppError(ErrorCode.CONFIG_INVALID, 'Invalid', 500);
    });

    await expect(configVerifyHandler()).rejects.toThrow(
      'Invalid configuration file',
    );
  });

  it('throws AppError with JSON message when SyntaxError', async () => {
    store.all.mockImplementation(() => {
      throw new SyntaxError(
        "Expected ',' or '}' after property value in JSON at position 149",
      );
    });

    await expect(configVerifyHandler()).rejects.toThrow(
      "Configuration file is not valid JSON: Expected ',' or '}' after property value in JSON at position 149",
    );
  });

  it('re-throws AppError with non-CONFIG_INVALID code unchanged', async () => {
    const original = new AppError(
      ErrorCode.CONFIG_KEY_UNKNOWN,
      'Unknown configuration key foo',
      400,
    );
    store.all.mockImplementation(() => {
      throw original;
    });

    await expect(configVerifyHandler()).rejects.toBe(original);
    expect(io.success).not.toHaveBeenCalled();
  });

  it('re-throws other errors unchanged', async () => {
    const original = new TypeError('Something went wrong');
    store.all.mockImplementation(() => {
      throw original;
    });

    await expect(configVerifyHandler()).rejects.toBe(original);
  });

  it('calls getStore and store.all', async () => {
    store.all.mockReturnValue({});

    await configVerifyHandler();

    expect(getStore).toHaveBeenCalled();
    expect(store.all).toHaveBeenCalled();
  });
});
