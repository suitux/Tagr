import { readFile } from 'fs/promises'
import { OfflineAudioContext } from 'node-web-audio-api'

const NUM_SAMPLES = 8000

export async function computePeaks(filePath: string): Promise<number[]> {
  const fileBuffer = await readFile(filePath)
  const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength)

  // Decode audio to PCM using OfflineAudioContext
  const ctx = new OfflineAudioContext(1, 1, 44100)
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
  const channelData = audioBuffer.getChannelData(0)

  const samplesPerBucket = Math.floor(channelData.length / NUM_SAMPLES)
  const peaks: number[] = new Array(NUM_SAMPLES)

  for (let i = 0; i < NUM_SAMPLES; i++) {
    const start = i * samplesPerBucket
    const end = Math.min(start + samplesPerBucket, channelData.length)
    let sumSquares = 0
    for (let j = start; j < end; j++) {
      sumSquares += channelData[j] * channelData[j]
    }
    const rms = Math.sqrt(sumSquares / (end - start))
    // Round to 3 decimal places to keep JSON compact
    peaks[i] = Math.round(rms * 1000) / 1000
  }

  return peaks
}
