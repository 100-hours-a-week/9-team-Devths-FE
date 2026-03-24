export class ApiError extends Error {
  status: number | null;
  serverMessage: string | null;

  constructor(message: string, status: number | null = null, serverMessage: string | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.serverMessage = serverMessage;
  }

  static fromResponse(result: { status: number; json: unknown }): ApiError {
    let serverMessage: string | null = null;

    if (
      result.json !== null &&
      typeof result.json === 'object' &&
      'message' in result.json &&
      typeof (result.json as { message?: unknown }).message === 'string'
    ) {
      serverMessage = (result.json as { message: string }).message;
    }

    const message = serverMessage ?? `Request failed with status ${result.status}`;
    return new ApiError(message, result.status, serverMessage);
  }

  static fromUnknown(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error instanceof Error) {
      const err = error as Error & { status?: number; serverMessage?: string };
      return new ApiError(err.message, err.status ?? null, err.serverMessage ?? null);
    }

    if (typeof error === 'string') {
      return new ApiError(error, null, null);
    }

    return new ApiError('알 수 없는 오류가 발생했습니다.', null, null);
  }
}
