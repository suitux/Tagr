# audiotagr

Read and write audio file tags from Node with one format-agnostic API, plus a streaming folder scanner.

Under the hood it reads with [`music-metadata`](https://github.com/borewit/music-metadata) and writes with [`node-taglib-sharp`](https://github.com/benrr101/node-taglib-sharp), and papers over the differences between ID3v2, Vorbis comments, iTunes/MP4 atoms, ASF/WMA descriptors and APEv2 items — including the ones that silently corrupt a round-trip if you use the convenience setters directly.

```bash
npm install audiotagr
```

Requires Node 20+. ESM only.

## Reading

```ts
import { readAudioMetadata } from 'audiotagr'

const meta = await readAudioMetadata('/music/song.flac')

meta.title //=> 'Song'
meta.artist //=> 'A;B'          multi-value fields are joined with ';'
meta.genre //=> 'Pop Punk'      Style never leaks into Genre
meta.style //=> 'acoustic'
meta.rating //=> 80             always 0-100, whatever the format's native scale
meta.customTags //=> [{ key: 'vorbis:MOOD', value: 'calm' }]
meta.pictures //=> [{ type, format, description, data }]
meta.duration, meta.bitrate, meta.codec, meta.lossless
```

Dates come back as the raw tag string (`originalReleaseDate: '1998-05-04'`) — parse them with whatever your app already uses.

## Writing

Only the fields present in the patch are touched; `null` or `''` clears a tag.

```ts
import { writeAudioMetadata, writeAudioPicture } from 'audiotagr'

await writeAudioMetadata('/music/song.flac', {
  title: 'New Title',
  artist: 'A;B',
  style: 'acoustic',
  bpm: 128,
  rating: 80,
  customTags: [{ key: 'MOOD', value: 'calm' }, { key: 'OLD_TAG', value: null }]
})

await writeAudioPicture('/music/song.flac', pngBuffer, 'image/png')
```

Each field is written to every tag the file carries, using the name that format's readers actually look for: `TXXX:STYLE` in ID3v2, `STYLE` in Vorbis, `----:com.apple.iTunes:STYLE` in MP4, `WM/*` descriptors in ASF, and so on.

## Scanning a library

`scanFolder` is an async generator: it walks the tree, reads each file and hands it to you one at a time, so a scan never holds a whole library in memory. Between batches it yields the event loop and forces a GC pass, because embedded cover art lives off-heap and otherwise piles up.

```ts
import { scanFolder } from 'audiotagr'

for await (const item of scanFolder('/music', {
  // Skip files your database already has at this mtime.
  shouldSkip: (filePath, stats) => stats.mtime.getTime() === known.get(filePath)
})) {
  switch (item.kind) {
    case 'song':
      await save(item.metadata)
      break
    case 'skipped':
      break
    case 'error':
      console.warn(item.filePath, item.error)
      break
  }
  reportProgress(item.progress) // { current, total, currentFile }
}
```

Options: `batchSize` (default 100), `shouldSkip`, `onDirectoryError`, `signal`. Unreadable directories are reported and skipped rather than aborting the walk. `scanFolders(paths)` does the same across several roots and tags each item with its `folder`.

## Browser-safe subset

`audiotagr/tags` exports the tag model and the value helpers with no filesystem or parser dependency, so UI code can share them with the server:

```ts
import { isMusicFile, joinMultiValue, splitMultiValue, stripKeyPrefix } from 'audiotagr/tags'
import type { AudioFileMetadata, AudioMetadataPatch } from 'audiotagr/tags'
```

## Supported files

`.mp3 .flac .wav .aac .ogg .m4a .m4b .wma .aiff .opus`

## Notes on round-trips

- **BPM in Vorbis comments** is written to `BPM` (taglib's default is `TEMPO`, which readers do not surface as BPM).
- **Style vs Genre**: parsers fold STYLE frames into the same field as the genre frame. This package pulls them apart on read and keeps them apart on write.
- **Multi-value fields** are flattened with `;`. MP4 and ASF only store one string per field, so they come back joined with `; `.
- **Rating** is exposed as 0-100 and stored as POPM (1-255) in ID3v2, as a plain number elsewhere.
- **ID3v2.2 `TXX` frames** embed the description in the value; they are normalized to the `TXXX` shape (`ID3v2.2:TXX:MOOD`).

## License

LGPL-3.0-only. You can use this package in a project under any license; if you modify the package itself, those changes stay under the LGPL. See `LICENSE` (the LGPL terms) and `LICENSE.GPL` (the GPL they build on).

Extracted from [Tagr](https://github.com/suitux/Tagr), which is AGPL-3.0-only.
