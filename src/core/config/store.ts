import Conf from 'conf';
import { get, has, set as lodashSet, unset } from 'lodash-es';
import type { ZodError } from 'zod';

import { AppError, ErrorCode } from '../errors';
import { type Config, configSchema } from './schema';

interface ValidationError {
  field: string;
  message: string;
}

export class Store {
  private readonly conf: Conf<Record<string, unknown>>;

  constructor(defaults: Record<string, unknown> = {}) {
    this.conf = new Conf<Record<string, unknown>>({
      projectName: 'sumup',
      configName: 'sumup-config',
      defaults,
    });
  }

  private validate(data: Record<string, unknown>): Config {
    const result = configSchema.safeParse(data);
    if (!result.success) {
      const errors: ValidationError[] = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: this.formatMessage(issue),
      }));

      const details = errors
        .map((error) => `${error.field}: ${error.message}`)
        .join('; ');

      throw new AppError(
        ErrorCode.CONFIG_INVALID,
        `Invalid configuration: ${details}`,
        400,
        { errors },
      );
    }
    return result.data;
  }

  private formatMessage(issue: ZodError['issues'][number]): string {
    const prefix = 'Invalid option: ';
    if (issue.message.startsWith(prefix)) {
      return issue.message.slice(prefix.length);
    }
    return issue.message;
  }

  all(): Config {
    return this.validate(this.conf.store);
  }

  get(key: string): unknown {
    const config = this.validate(this.conf.store);
    if (!has(config, key)) {
      throw new AppError(
        ErrorCode.CONFIG_KEY_UNKNOWN,
        `Unknown configuration key ${key}`,
        400,
        { key },
      );
    }
    return get(config, key);
  }

  set(key: string, value: unknown): void {
    if (!has(this.conf.store, key)) {
      throw new AppError(
        ErrorCode.CONFIG_KEY_UNKNOWN,
        `Unknown configuration key: ${key}`,
        400,
        { key },
      );
    }

    const candidate = structuredClone(this.conf.store);
    lodashSet(candidate, key, value);
    this.validate(candidate);

    this.conf.set(key, value);
  }

  delete(key: string): void {
    const candidate = structuredClone(this.conf.store);
    unset(candidate, key);

    this.validate(candidate);

    this.conf.delete(key);
  }

  get path(): string {
    return this.conf.path;
  }
}
