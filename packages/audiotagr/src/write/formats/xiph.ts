import { XiphComment } from 'node-taglib-sharp'
import { splitMultiValue } from '../../shared/multi-value'

/** Set (or remove, when `value` is empty) a Vorbis comment field, splitting multi-values. */
export function setField(xiph: XiphComment, key: string, value: string | undefined) {
  if (value) {
    xiph.setFieldAsStrings(key.toUpperCase(), ...splitMultiValue(value))
  } else {
    xiph.removeField(key.toUpperCase())
  }
}

/** Set a field to explicit values — Vorbis comments are natively multi-value. */
export function setFieldValues(xiph: XiphComment, key: string, values: string[]) {
  if (values.length === 0) {
    xiph.removeField(key.toUpperCase())
    return
  }
  xiph.setFieldAsStrings(key.toUpperCase(), ...values)
}

/**
 * taglib's convenience setter stores BPM in `TEMPO` by default, which parsers
 * read back as an unrelated field. Write the canonical `BPM` field and drop any
 * stale `TEMPO` so a written BPM survives a re-read.
 */
export function setBeatsPerMinute(xiph: XiphComment, bpm: number | null | undefined) {
  if (bpm) {
    xiph.setFieldAsStrings('BPM', String(bpm))
  } else {
    xiph.removeField('BPM')
  }
  xiph.removeField('TEMPO')
}
