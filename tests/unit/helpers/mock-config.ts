import type { vi } from 'vitest';

export const DEFAULT_MOCK_DATA = {
  output: { format: 'markdown', mode: 'both' },
  naming: { pattern: '.sumup_<timestamp>.md' },
  git: { baseBranch: 'main' },
} as Record<string, unknown>;

export function createMockConfigClass(
  mockData: { data: Record<string, unknown> },
  mockSet: ReturnType<typeof vi.fn>,
  mockDelete: ReturnType<typeof vi.fn>,
) {
  return class MockConfig {
    path: string;
    set = mockSet;
    delete = mockDelete;

    constructor(options: {
      projectName?: string;
      configName?: string;
      defaults?: Record<string, unknown>;
    }) {
      this.path = `/mock/${options.projectName ?? 'app'}/${options.configName ?? 'config'}.json`;
      mockData.data = structuredClone(options.defaults ?? DEFAULT_MOCK_DATA);
    }

    get store() {
      return mockData.data;
    }
  };
}

export function resetMockData(mockData: {
  data: Record<string, unknown>;
}): void {
  mockData.data = structuredClone(DEFAULT_MOCK_DATA);
}
