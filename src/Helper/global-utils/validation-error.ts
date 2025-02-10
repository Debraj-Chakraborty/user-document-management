import { ValidationError } from 'class-validator';
import { HttpException, HttpStatus } from '@nestjs/common';

export function formatValidationErrors(errors: ValidationError[]): HttpException {
  const formattedErrors = errors.map((error) => {
    const constraints = Object.values(error.constraints || {});
    return constraints.map((msg) => ({
      error_code: HttpStatus.BAD_REQUEST,
      error_message: msg,
    }));
  }).flat();

  return new HttpException(
    {
      status: 'FAILURE',
      timestamp: new Date(),
      message: 'Validation failed.',
      errors: formattedErrors,
    },
    HttpStatus.BAD_REQUEST,
  );
}
