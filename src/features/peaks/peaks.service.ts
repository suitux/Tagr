import { execFile } from 'child_process'

const NUM_SAMPLES = 800

function decodeWithFfmpeg(filePath: string): Promise<Float32Array> {
  return new Promise((resolve, reject) => {
    const args = ['-i', filePath, '-f', 'f32le', '-ac', '1', '-ar', '44100', '-']
    execFile('ffmpeg', args, { encoding: 'buffer', maxBuffer: 200 * 1024 * 1024 }, (err, stdout) => {
      if (err) return reject(err)
      resolve(new Float32Array(stdout.buffer, stdout.byteOffset, stdout.byteLength / 4))
    })
  })
}

export async function computePeaks(filePath: string): Promise<number[]> {
  const channelData = await decodeWithFfmpeg(filePath)

  const samplesPerBucket = Math.floor(channelData.length / NUM_SAMPLES)
  const peaks: number[] = new Array(NUM_SAMPLES)

  let max = 0
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const start = i * samplesPerBucket
    const end = Math.min(start + samplesPerBucket, channelData.length)
    let sumSquares = 0
    for (let j = start; j < end; j++) {
      sumSquares += channelData[j] * channelData[j]
    }
    peaks[i] = Math.sqrt(sumSquares / (end - start))
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
