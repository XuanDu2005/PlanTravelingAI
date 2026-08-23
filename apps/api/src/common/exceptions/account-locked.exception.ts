import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Thrown by AuthService when the account exists but is not ACTIVE.
 *
 * Uses a stable machine-readable code so the frontend can render a
 * tailored message (a localized banner instead of a generic 401 toast).
 */
export class AccountLockedException extends HttpException {
  static readonly code = 'ACCOUNT_LOCKED';

  constructor(reason?: string) {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Forbidden',
        code: AccountLockedException.code,
        message: 'Account locked',
        reason: reason ?? null,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
