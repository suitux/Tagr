/**
 * Helpers to stream newline-delimited JSON (NDJSON) between server and client.
 * Used by the bulk endpoints so the client can render progress per song instead
 * of waiting for the whole batch.
 */

export type NdjsonEvent<TResult> =
  | { type: 'start'; total: number }
  | { type: 'result'; index: number; result: TResult }
  | { type: 'done'; resolvedCount: number }
  | { type: 'error'; error: string }

/** Server: build a streaming Response that consumes an async generator of events. */
export function ndjsonStreamResponse<TResult>(
  generator: () => AsyncGenerator<NdjsonEvent<TResult>, void, void>
): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of generator()) {
          controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'))
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error'
        controller.enqueue(encoder.encode(JSON.stringify({ type: 'error', error: message }) + '\n'))
      } finally {
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no'
    }
  })
}

/** Client: read an NDJSON response body and yield each parsed event. */
export async function* readNdjsonStream<TResult>(response: Response): AsyncGenerator<NdjsonEvent<TResult>> {
  if (!response.body) throw new Error('Response has no body')
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      let newlineIndex: number
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newlineIndex).trim()
        buffer = buffer.slice(newlineIndex + 1)
        if (!line) continue
        yield JSON.parse(line) as NdjsonEvent<TResult>
      }
    }
    const tail = buffer.trim()
    if (tail) yield JSON.parse(tail) as NdjsonEvent<TResult>
  } finally {
    reader.releaseLock()
  }
}
