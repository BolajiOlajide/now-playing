export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.message = `ValidationError: ${message}`
    this.name = 'ValidationError'
  }
}
