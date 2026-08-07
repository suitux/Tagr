import type { ICommonTagsResult } from 'music-metadata'
import { joinMultiValue } from '../shared/multi-value'
import { AudioTags, NativeTagMap } from '../tags/domain'
import { getNativeStyleValues } from '../tags/style-tag'
import { getNativeTagValue } from './native-tags.mapper'

export function mapAudioTags(common: ICommonTagsResult, native: NativeTagMap | undefined): AudioTags {
  // Parsers merge STYLE frames into the same common field as the genre frame.
  // Pull the raw STYLE values out so Style gets its own field and Genre keeps
  // only what the genre frame held.
  const styleValues = getNativeStyleValues(native)
  const styleSet = new Set(styleValues)

  return {
    title: common.title || null,
    artist: joinMultiValue(common.artists ?? []) || common.artist || null,
    sortArtist: common.artistsort || null,
    album: common.album || null,
    sortAlbum: common.albumsort || null,
    trackNumber: common.track?.no || null,
    trackTotal: common.track?.of || null,
    discNumber: common.disk?.no || null,
    discTotal: common.disk?.of || null,
    year: common.year || null,
    bpm: common.bpm || null,
    genre: joinMultiValue((common.genre ?? []).filter(g => !styleSet.has(g))) || null,
    style: joinMultiValue(styleValues) || null,
    albumArtist: joinMultiValue(common.albumartists ?? []) || common.albumartist || null,
    sortAlbumArtist: common.albumartistsort || null,
    composer: joinMultiValue(common.composer ?? []) || null,
    conductor: joinMultiValue(common.conductor ?? []) || null,
    comment: common.comment?.[0]?.text || null,
    grouping: common.grouping || null,
    publisher: joinMultiValue(common.label ?? []) || getNativeTagValue(native, 'PUBLISHER') || null,
    catalogNumber: joinMultiValue(common.catalognumber ?? []) || null,
    lyricist: joinMultiValue(common.lyricist ?? []) || null,
    barcode: common.barcode || null,
    work: common.work || getNativeTagValue(native, 'WORK') || getNativeTagValue(native, 'TXXX:WORK') || null,
    originalReleaseDate: common.originaldate || common.originalyear?.toString() || null,
    copyright: common.copyright || null,
    rating: common.rating?.[0]?.rating ? Math.round(common.rating[0].rating * 100) : null,
    lyrics: common.lyrics?.[0]?.text || null,
    compilation: common.compilation || false,
    gapless: common.gapless || false
  }
}
