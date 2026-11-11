import { spawn } from 'child_process'

const NUM_SAMPLES = 800
const SAMPLE_RATE = 44100
const BYTES_PER_SAMPLE = 4
// ffmpeg's PCM output is reduced on the fly into coarse buckets, so memory stays proportional to the
// track length divided by this window (a 2 h mix is ~144k buckets) instead of the raw sample count.
const COARSE_BUCKET_SAMPLES = Math.floor(SAMPLE_RATE * 0.05)

interface CoarseBucket {
  sumSquares: number
  count: number
}

/**
 * Decodes the file with ffmpeg and streams the mono f32le samples into coarse RMS buckets. Never
 * buffers the whole decoded track — long mixes used to blow past `execFile`'s maxBuffer.
 */
function decodeToCoarseBuckets(filePath: string): Promise<CoarseBucket[]> {
  return new Promise((resolve, reject) => {
    const args = ['-v', 'error', '-i', filePath, '-f', 'f32le', '-ac', '1', '-ar', String(SAMPLE_RATE), '-']
    const child = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] })

    const buckets: CoarseBucket[] = []
    let current: CoarseBucket = { sumSquares: 0, count: 0 }
    // Chunks are not aligned to 4 bytes; leftover bytes carry over to the next chunk.
    let carry: Buffer = Buffer.alloc(0)
    let stderr = ''
    let settled = false

    const fail = (error: Error) => {
      if (settled) return
      settled = true
      child.kill()
      reject(error)
    }

    child.stdout.on('data', (chunk: Buffer) => {
      const data = carry.length > 0 ? Buffer.concat([carry, chunk]) : chunk
      const usable = data.length - (data.length % BYTES_PER_SAMPLE)
      carry = data.subarray(usable)

      for (let offset = 0; offset < usable; offset += BYTES_PER_SAMPLE) {
        const sample = data.readFloatLE(offset)
        current.sumSquares += sample * sample
        current.count++
        if (current.count === COARSE_BUCKET_SAMPLES) {
          buckets.push(current)
          current = { sumSquares: 0, count: 0 }
        }
      }
    })

    child.stderr.on('data', (chunk: Buffer) => {
      // Keep the tail only: stderr has to be drained or ffmpeg blocks on a full pipe.
      stderr = (stderr + chunk.toString()).slice(-4096)
    })

    child.on('error', fail)

    child.on('close', code => {
      if (settled) return
      if (code !== 0) {
        return fail(new Error(`ffmpeg exited with code ${code}${stderr ? `: ${stderr.trim()}` : ''}`))
      }
      settled = true
      if (current.count > 0) buckets.push(current)
      resolve(buckets)
    })
  })
}

function reduceToPeaks(buckets: CoarseBucket[]): number[] {
  const peaks: number[] = new Array(NUM_SAMPLES).fill(0)
  if (buckets.length === 0) return peaks

  let max = 0
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const start = Math.floor((i * buckets.length) / NUM_SAMPLES)
    const end = Math.max(start + 1, Math.floor(((i + 1) * buckets.length) / NUM_SAMPLES))
    let sumSquares = 0
    let count = 0
    for (let j = start; j < end && j < buckets.length; j++) {
      sumSquares += buckets[j].sumSquares
      count += buckets[j].count
    }
    peaks[i] = count > 0 ? Math.sqrt(sumSquares / count) : 0
    if (peaks[i] > max) max = peaks[i]
  }

  // Normalize to 0–1 range
  if (max > 0) {
    for (let i = 0; i < NUM_SAMPLES; i++) {
      peaks[i] = Math.round((peaks[i] / max) * 1000) / 1000
    }
  }

  return peaks
}

// Retries and duplicate requests for the same file share one ffmpeg run instead of piling up decoders.
const inFlight = new Map<string, Promise<number[]>>()

export function computePeaks(filePath: string): Promise<number[]> {
  const pending = inFlight.get(filePath)
  if (pending) return pending

  const promise = decodeToCoarseBuckets(filePath)
    .then(reduceToPeaks)
    .finally(() => inFlight.delete(filePath))
  inFlight.set(filePath, promise)
  return promise
}
