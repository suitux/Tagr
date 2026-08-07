import { AsfTag } from 'node-taglib-sharp'

/**
 * ASF/WMA stores these fields under `WM/*` descriptor names; writing the bare
 * field name produces a descriptor no parser reads back.
 */
export const ASF_NATIVE_FIELD_MAP: Record<string, string> = {
  LYRICIST: 'WM/Writer',
  BARCODE: 'WM/Barcode',
  CATALOGNUMBER: 'WM/CatalogNo',
  WORK: 'WM/Work',
  ORIGINALDATE: 'WM/OriginalReleaseTime',
  RATING: 'WM/SharedUserRating'
}

/** Set a field, translating it to its `WM/*` descriptor when one exists. */
export function setField(asf: AsfTag, key: string, value: string | undefined) {
  const descriptor = ASF_NATIVE_FIELD_MAP[key.toUpperCase()] ?? key
  setDescriptor(asf, descriptor, value)
}

/** Set a descriptor verbatim, for fields whose ASF name has no field-name mapping. */
export function setDescriptor(asf: AsfTag, descriptor: string, value: string | undefined) {
  asf.setDescriptorString(value ?? '', descriptor)
}
