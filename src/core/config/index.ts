import { DEFAULTS } from './schema';
import { Store } from './store';

export function getStore(): Store {
  return new Store(DEFAULTS as Record<string, unknown>);
}
