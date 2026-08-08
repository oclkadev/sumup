import { Store } from '@/core/config/store';
import { AppError } from '@/core/errors';
import {
  DEFAULT_MOCK_DATA,
  resetMockData,
} from '@/tests/unit/helpers/mock-config';

const mockSet = vi.hoisted(() => vi.fn());
const mockDelete = vi.hoisted(() => vi.fn());
const mockData = vi.hoisted(() => ({
  data: {} as Record<string, unknown>,
}));

vi.mock('conf', async () => {
  const { createMockConfigClass } =
    await import('@/tests/unit/helpers/mock-config');
  return { default: createMockConfigClass(mockData, mockSet, mockDelete) };
});

function catchError(function_: () => unknown): AppError {
  try {
    function_();
    throw new Error('Expected function to throw, but it did not');
  } catch (error) {
    if (error instanceof AppError) return error;
    throw error;
  }
}

describe('Store', () => {
  let store: Store;

  beforeEach(() => {
    resetMockData(mockData);
    vi.clearAllMocks();
    store = new Store(DEFAULT_MOCK_DATA);
  });

  describe('constructor', () => {
    it('initializes with provided defaults', () => {
      const customDefaults = {
        output: { format: 'json', mode: 'file' },
        naming: { pattern: 'custom.md' },
        git: { baseBranch: 'develop' },
      };
      const customStore = new Store(customDefaults);

      expect(customStore.all()).toEqual(customDefaults);
    });

    it('uses projectName and configName in path', () => {
      expect(store.path).toBe('/mock/sumup/sumup-config.json');
    });
  });

  describe('all', () => {
    it('returns the full config with defaults', () => {
      const result = store.all();

      expect(result).toEqual({
        output: { format: 'markdown', mode: 'both' },
        naming: { pattern: '.sumup_<timestamp>.md' },
        git: { baseBranch: 'main' },
      });
    });

    it('throws AppError when config is invalid', () => {
      mockData.data = { output: 'invalid' };

      expect(() => store.all()).toThrow(AppError);
      expect(() => store.all()).toThrow(/Invalid configuration/);
    });

    it('includes error details in context when config is invalid', () => {
      mockData.data = { output: 'invalid' };

      const error = catchError(() => store.all());

      expect(error.context).toHaveProperty('errors');
      expect(Array.isArray(error.context?.['errors'])).toBe(true);
    });

    it('reports multiple validation errors', () => {
      mockData.data = { output: 'invalid', naming: 'invalid', git: 'invalid' };

      const error = catchError(() => store.all());
      const errors = error.context?.['errors'] as {
        field: string;
        message: string;
      }[];

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.field.includes('output'))).toBe(true);
    });

    it('formats error fields with dot separator not empty string', () => {
      mockData.data = { output: { format: 'invalid' } };

      const error = catchError(() => store.all());
      const errors = error.context?.['errors'] as {
        field: string;
        message: string;
      }[];
      const outputError = errors.find((error) =>
        error.field.startsWith('output'),
      );

      expect(outputError?.field).toContain('.');
      expect(outputError?.field).toMatch(/^output\./);
    });

    it('includes message from formatMessage in errors', () => {
      mockData.data = { output: 'invalid' };

      const error = catchError(() => store.all());
      const errors = error.context?.['errors'] as {
        field: string;
        message: string;
      }[];

      expect(errors.every((error) => error.message.length > 0)).toBe(true);
      expect(errors.every((error) => typeof error.message === 'string')).toBe(
        true,
      );
    });

    it('includes field and message in error message string', () => {
      mockData.data = { output: { format: 'invalid' } };

      const error = catchError(() => store.all());

      expect(error.message).toContain('output.format:');
      expect(error.message).toMatch(/output\.format: \S+/);
    });

    it('joins multiple errors with semicolon separator', () => {
      mockData.data = {
        output: { format: 'invalid' },
        naming: { pattern: 123 },
      };

      const error = catchError(() => store.all());

      expect(error.message).toContain('; ');
      expect(error.message).toMatch(/; \S+/);
    });

    it('strips Invalid option prefix from zod messages', () => {
      mockData.data = { output: { format: 'invalid' } };

      const error = catchError(() => store.all());

      expect(error.message).not.toContain('Invalid option:');
      expect(error.message).toContain('expected');
      expect(error.message).not.toContain('Stryker');
    });

    it('returns message unchanged when it does not start with Invalid option', () => {
      mockData.data = { output: 'invalid' };

      const error = catchError(() => store.all());
      const errors = error.context?.['errors'] as {
        field: string;
        message: string;
      }[];

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]!.message).toMatch(/^Invalid input/);
    });
  });

  describe('get', () => {
    it.each([
      ['output.format', 'markdown'],
      ['output.mode', 'both'],
      ['naming.pattern', '.sumup_<timestamp>.md'],
      ['git.baseBranch', 'main'],
    ])('returns %s as %j', (key, expected) => {
      const result = store.get(key);

      expect(result).toBe(expected);
    });

    it('throws AppError for unknown nested key with context', () => {
      const error = catchError(() => store.get('output.unknown'));

      expect(error.message).toBe('Unknown configuration key output.unknown');
      expect(error.context).toHaveProperty('key');
      expect(error.context?.['key']).toBe('output.unknown');
    });

    it('throws AppError for unknown top-level key with context', () => {
      const error = catchError(() => store.get('unknown'));

      expect(error.message).toBe('Unknown configuration key unknown');
      expect(error.context).toHaveProperty('key');
      expect(error.context?.['key']).toBe('unknown');
    });

    it('throws AppError when config is invalid', () => {
      mockData.data = { output: 'invalid' };

      expect(() => store.get('output.format')).toThrow(AppError);
      expect(() => store.get('output.format')).toThrow(/Invalid configuration/);
    });
  });

  describe('set', () => {
    it.each([
      ['output.format', 'json'],
      ['output.mode', 'copy'],
      ['naming.pattern', '.custom_<timestamp>.md'],
      ['git.baseBranch', 'develop'],
    ])('calls conf.set with %s and %j', (key, value) => {
      store.set(key, value);

      expect(mockSet).toHaveBeenCalledWith(key, value);
    });

    it('throws AppError for invalid enum value and does not call conf.set', () => {
      expect(() => store.set('output.format', 'invalid')).toThrow(AppError);
      expect(() => store.set('output.format', 'invalid')).toThrow(
        /Invalid configuration/,
      );

      expect(mockSet).not.toHaveBeenCalled();
    });

    it('throws AppError for unknown key and does not call conf.set', () => {
      const error = catchError(() => store.set('unknown.key', 'value'));

      expect(error.message).toBe('Unknown configuration key: unknown.key');
      expect(error.context).toHaveProperty('key');
      expect(error.context?.['key']).toBe('unknown.key');
      expect(mockSet).not.toHaveBeenCalled();
    });

    it('throws AppError for empty key and does not call conf.set', () => {
      const error = catchError(() => store.set('', 'value'));

      expect(error.context).toHaveProperty('key');
      expect(error.context?.['key']).toBe('');
      expect(mockSet).not.toHaveBeenCalled();
    });

    it('calls conf.set for top-level key', () => {
      mockData.data = {
        output: { format: 'markdown', mode: 'both' },
        naming: { pattern: '.sumup_<timestamp>.md' },
        git: { baseBranch: 'main' },
        topLevel: 'value',
      };
      const topStore = new Store(mockData.data);

      topStore.set('topLevel', 'newValue');

      expect(mockSet).toHaveBeenCalledWith('topLevel', 'newValue');
    });
  });

  describe('delete', () => {
    it.each([
      ['output.format'],
      ['output.mode'],
      ['naming.pattern'],
      ['git.baseBranch'],
    ])('calls conf.delete with %s', (key) => {
      store.delete(key);

      expect(mockDelete).toHaveBeenCalledWith(key);
    });

    it('does not throw for unknown path', () => {
      expect(() => store.delete('unknown.key')).not.toThrow();

      expect(mockDelete).toHaveBeenCalledWith('unknown.key');
    });

    it('throws AppError when deletion results in invalid config', () => {
      mockData.data = { output: { format: 'markdown' } };

      expect(() => store.delete('output.format')).toThrow(AppError);
    });

    it('actually removes the property from candidate before validation', () => {
      mockData.data = {
        output: { format: 'markdown', mode: 'both', extra: 'value' },
        naming: { pattern: '.sumup_<timestamp>.md' },
        git: { baseBranch: 'main' },
      };

      store.delete('output.extra');

      expect(mockDelete).toHaveBeenCalledWith('output.extra');
    });
  });
});
