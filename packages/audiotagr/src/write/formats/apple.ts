import { Mpeg4AppleTag } from 'node-taglib-sharp'

const ITUNES_MEAN = 'com.apple.iTunes'

/** Set (or remove, when `value` is empty) an iTunes `----:com.apple.iTunes:<key>` atom. */
export function setItunesField(apple: Mpeg4AppleTag, key: string, value: string | undefined) {
  if (value) {
    apple.setItunesStrings(ITUNES_MEAN, key, value)
  } else {
    apple.setItunesStrings(ITUNES_MEAN, key)
  }
}
