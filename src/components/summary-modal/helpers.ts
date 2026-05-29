export function summaryBasename(filePath: string) {
  return filePath.split('/').pop() || filePath
}
