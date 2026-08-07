import { ApeTag } from 'node-taglib-sharp'

/** Set (or clear, when `value` is empty) an APEv2 item. */
export function setItem(ape: ApeTag, key: string, value: string | undefined) {
  ape.setStringValue(key, value ?? '')
}
