export type ApiResponse<T> = {
  message: string;
  data: T;
  timestamp: string;
};

export type ApiErrorResponse = {
  message: string;
  data: null;
  timestamp: string;
};
