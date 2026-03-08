export interface GranolaError {
  error: true;
  code: string;
  message: string;
  suggestion?: string;
}

export const EXIT_CODES = {
  SUCCESS: 0,
  NOT_FOUND: 1,
  CACHE_ERROR: 2,
  INVALID_INPUT: 3,
} as const;

export function makeError(
  code: string,
  message: string,
  suggestion?: string
): GranolaError {
  return {
    error: true,
    code,
    message,
    ...(suggestion ? { suggestion } : {}),
  };
}

export function exitWithError(code: number, error: GranolaError): never {
  console.log(JSON.stringify(error));
  process.exit(code);
}
