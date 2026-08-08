import { Store } from '@/core/config/store';
import { AppError } from '@/core/errors';

const mockSet = vi.hoisted(() => vi.fn());
const mockDelete = vi.hoisted(() => vi.fn());
const mockData = vi.hoisted(() => ({
  data: {
    output: { format: 'markdown', mode: 'both' },
    naming: { pattern: '.sumup_<timestamp>.md' },
    git: { baseBranch: 'main' },
  } as Record<string, unknown>,
}));

vi.mock('conf', () => ({
  default: class MockConfig {
    path: string;
    set = mockSet;
    delete = mockDelete;

    constructor(options: {
      configName?: string;
      defaults?: Record<string, unknown>;
    }) {
      this.path = `/mock/${options.configName ?? 'config'}.json`;
      mockData.data = structuredClone(
        options.defaults ?? {
          output: { format: 'markdown', mode: 'both' },
          naming: { pattern: '.sumup_<timestamp>.md' },
          git: { baseBranch: 'main' },
        },
      );
    }

    get store() {
      return mockData.data;
    }
  },
}));

describe('Store', () => {
  let store: Store;

  beforeEach(() => {
    mockData.data = {
      output: { format: 'markdown', mode: 'both' },
      naming: { pattern: '.sumup_<timestamp>.md' },
      git: { baseBranch: 'main' },
    };
    vi.clearAllMocks();
    store = new Store(mockData.data);
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

    it('uses configName sumup-config in path', () => {
      expect(store.path).toBe('/mock/sumup-config.json');
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

      try {
        store.all();
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).context).toHaveProperty('errors');
        expect(Array.isArray((error as AppError).context?.['errors'])).toBe(
          true,
        );
      }
    });

    it('reports multiple validation errors', () => {
      mockData.data = { output: 'invalid', naming: 'invalid', git: 'invalid' };

      try {
        store.all();
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        const errors = (error as AppError).context?.['errors'] as {
          field: string;
          message: string;
        }[];
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((error) => error.field.includes('output'))).toBe(
          true,
        );
      }
    });

    it('formats error fields with dot separator not empty string', () => {
      mockData.data = { output: { format: 'invalid' } };

      try {
        store.all();
      } catch (error) {
        const errors = (error as AppError).context?.['errors'] as {
          field: string;
          message: string;
        }[];
        const outputError = errors.find((error) =>
          error.field.startsWith('output'),
        );
        expect(outputError?.field).toContain('.');
        expect(outputError?.field).toMatch(/^output\./);
      }
    });

    it('includes message from formatMessage in errors', () => {
      mockData.data = { output: 'invalid' };

      try {
        store.all();
      } catch (error) {
        const errors = (error as AppError).context?.['errors'] as {
          field: string;
          message: string;
        }[];
        expect(errors.every((error) => error.message.length > 0)).toBe(true);
        expect(errors.every((error) => typeof error.message === 'string')).toBe(
          true,
        );
      }
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

    it('returns undefined for unknown nested key', () => {
      const result = store.get('output.unknown');

      expect(result).toBeUndefined();
    });

    it('returns undefined for unknown top-level key', () => {
      const result = store.get('unknown');

      expect(result).toBeUndefined();
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
      try {
        store.set('unknown.key', 'value');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).message).toBe(
          'Unknown configuration key: unknown.key',
        );
        expect((error as AppError).context).toHaveProperty('key');
        expect((error as AppError).context?.['key']).toBe('unknown.key');
      }

      expect(mockSet).not.toHaveBeenCalled();
    });

    it('throws AppError for empty key and does not call conf.set', () => {
      try {
        store.set('', 'value');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).context).toHaveProperty('key');
        expect((error as AppError).context?.['key']).toBe('');
      }

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
