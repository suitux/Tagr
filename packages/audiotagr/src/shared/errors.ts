/** Base class for every error thrown by this package. */
export class AudioTagrError extends Error {
  readonly filePath: string

  constructor(message: string, filePath: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'AudioTagrError'
    this.filePath = filePath
  }
}

/** Thrown when a file cannot be parsed. */
export class MetadataReadError extends AudioTagrError {
  constructor(filePath: string, options?: { cause?: unknown }) {
    super(`Failed to read metadata from ${filePath}`, filePath, options)
    this.name = 'MetadataReadError'
  }
}

/** Thrown when tags cannot be written back to a file. */
export class MetadataWriteError extends AudioTagrError {
  constructor(filePath: string, options?: { cause?: unknown }) {
    super(`Failed to write metadata to ${filePath}`, filePath, options)
    this.name = 'MetadataWriteError'
  }
}

/** Message of an unknown thrown value, for error reporting. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}
