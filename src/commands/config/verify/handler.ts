import { getStore } from '@/core/config';
import { AppError, ErrorCode } from '@/core/errors';
import { io } from '@/ui/io';

export async function configVerifyHandler(): Promise<void> {
  try {
    getStore().all();
  } catch (error) {
    if (error instanceof AppError && error.code === ErrorCode.CONFIG_INVALID) {
      const errors = error.context?.['errors'] as
        { field: string; message: string }[] | undefined;

      const lines = ['Invalid configuration file'];
      if (errors) {
        for (const { field, message } of errors) {
          lines.push(`  - ${field}: ${message}`);
        }
      }
      throw new AppError(ErrorCode.CONFIG_INVALID, lines.join('\n'), 1);
    }
    if (error instanceof SyntaxError) {
      throw new AppError(
        ErrorCode.CONFIG_INVALID,
        `Configuration file is not valid JSON: ${error.message}`,
        1,
      );
    }
    throw error;
  }

  io.success('Configuration is valid.');
}
