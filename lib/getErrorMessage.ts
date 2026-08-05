// Backend errors are always { message, status, timestamp } (see global/entity/ErrorObject.java on the backend).
export const getErrorMessage = (error: unknown, fallback = "Something went wrong. Please try again."): string => {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return fallback;
};
