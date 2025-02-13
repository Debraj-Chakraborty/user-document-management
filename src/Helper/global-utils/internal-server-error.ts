import { HttpStatus } from '@nestjs/common';

export function internalServerErrorFormatter(
  message: string,
  errorCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
): {
  status: string;
  timestamp: Date;
  message: string;
  errors: { error_code: HttpStatus; error_message: string }[];
} {  
  return {
    status: 'FAILURE',
    timestamp: new Date(),
    message: message,
    errors: [
      {
        error_code: errorCode,
        error_message: message,
      },
    ],
  };
}