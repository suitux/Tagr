import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/tags.ts'],
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  dts: true,
  sourcemap: true,
  clean: true,
  // Keep the tag libraries external: they carry native/heavy payloads and must
  // stay resolvable (and patchable) by the consumer's package manager.
  external: ['music-metadata', 'node-taglib-sharp']
})
