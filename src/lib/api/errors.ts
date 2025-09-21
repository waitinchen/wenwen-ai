export class ApiError extends Error {
  constructor(message: string, public details?: unknown) {
    super(message)
    this.name = 'ApiError'
  }
}

export class AdminAuthError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(message, details)
    this.name = 'AdminAuthError'
  }
}
