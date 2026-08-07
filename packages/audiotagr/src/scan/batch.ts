export const DEFAULT_SCAN_BATCH_SIZE = 100

/**
 * Yield the event loop, then reclaim off-heap memory. Cover-art buffers live
 * outside the V8 heap, so without an explicit pass between batches the external
 * memory pool grows unchecked on large libraries until the process aborts.
 *
 * `globalThis.gc` only exists when Node runs with `--expose-gc`; the optional
 * call is a harmless no-op otherwise.
 */
export async function endBatch(): Promise<void> {
  await new Promise<void>(resolve => setImmediate(resolve))
  ;(globalThis as { gc?: () => void }).gc?.()
}
