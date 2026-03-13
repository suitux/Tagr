import { SCAN_FILE_LIST_LIMIT, ScanResult, ScanResultResponse } from '@/features/metadata/domain'

export function adaptScanResultResponse(result: ScanResult): ScanResultResponse {
  return {
    added: { count: result.addedFiles.length, files: result.addedFiles.slice(0, SCAN_FILE_LIST_LIMIT) },
    updated: { count: result.updatedFiles.length, files: result.updatedFiles.slice(0, SCAN_FILE_LIST_LIMIT) },
    deleted: { count: result.deletedFiles.length, files: result.deletedFiles.slice(0, SCAN_FILE_LIST_LIMIT) },
    skipped: { count: result.skippedFiles.length },
    errors: result.errors
  }
}
