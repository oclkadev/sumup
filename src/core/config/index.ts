import { DEFAULTS } from './schema';
import { Store } from './store';

export const store = new Store(DEFAULTS as Record<string, unknown>);
