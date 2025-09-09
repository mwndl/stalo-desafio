import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ERROR_MESSAGES } from '../enums/error-codes.enum';

export class AppException extends HttpException {
  public readonly errorCode: ErrorCode;
  public readonly description?: string;

  constructor(errorCode: ErrorCode, customMessage?: string) {
    const errorDetails = ERROR_MESSAGES[errorCode];
    
    super(
      {
        message: customMessage || errorDetails.message,
        errorCode: errorCode,
        statusCode: errorDetails.statusCode,
        description: errorDetails.description,
      },
      errorDetails.statusCode,
    );

    this.errorCode = errorCode;
    this.description = errorDetails.description;
  }

  static invalidCredentials(customMessage?: string): AppException {
    return new AppException(ErrorCode.INVALID_CREDENTIALS, customMessage);
  }

  static emailAlreadyExists(customMessage?: string): AppException {
    return new AppException(ErrorCode.EMAIL_ALREADY_EXISTS, customMessage);
  }

  static userNotFound(customMessage?: string): AppException {
    return new AppException(ErrorCode.USER_NOT_FOUND, customMessage);
  }

  static invalidRefreshToken(customMessage?: string): AppException {
    return new AppException(ErrorCode.INVALID_REFRESH_TOKEN, customMessage);
  }

  static userInactive(customMessage?: string): AppException {
    return new AppException(ErrorCode.USER_INACTIVE, customMessage);
  }

  static tenantNotFound(customMessage?: string): AppException {
    return new AppException(ErrorCode.TENANT_NOT_FOUND, customMessage);
  }

  static transactionNotFound(customMessage?: string): AppException {
    return new AppException(ErrorCode.TRANSACTION_NOT_FOUND, customMessage);
  }

  static fileTypeNotAllowed(customMessage?: string): AppException {
    return new AppException(ErrorCode.FILE_TYPE_NOT_ALLOWED, customMessage);
  }

  static fileNotProvided(customMessage?: string): AppException {
    return new AppException(ErrorCode.FILE_NOT_PROVIDED, customMessage);
  }

  static fileTooLarge(customMessage?: string): AppException {
    return new AppException(ErrorCode.FILE_TOO_LARGE, customMessage);
  }

  static fileNotFound(customMessage?: string): AppException {
    return new AppException(ErrorCode.FILE_NOT_FOUND, customMessage);
  }

  static tenantNotIdentified(customMessage?: string): AppException {
    return new AppException(ErrorCode.TENANT_NOT_IDENTIFIED, customMessage);
  }

  static tenantNotIdentifiedInToken(customMessage?: string): AppException {
    return new AppException(ErrorCode.TENANT_NOT_IDENTIFIED_IN_TOKEN, customMessage);
  }

  static resourceNotBelongsToTenant(customMessage?: string): AppException {
    return new AppException(ErrorCode.RESOURCE_NOT_BELONGS_TO_TENANT, customMessage);
  }

  static validationError(customMessage?: string): AppException {
    return new AppException(ErrorCode.VALIDATION_ERROR, customMessage);
  }

  static internalServerError(customMessage?: string): AppException {
    return new AppException(ErrorCode.INTERNAL_SERVER_ERROR, customMessage);
  }

  static databaseConnectionFailed(customMessage?: string): AppException {
    return new AppException(ErrorCode.DATABASE_CONNECTION_FAILED, customMessage);
  }
}
