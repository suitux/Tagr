import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { TrashOperationResult } from '../domain'
import { useTrashActions } from './use-trash-actions'

const { mockMutateAsync, mockConfirm, mockToast } = vi.hoisted(() => ({
  mockMutateAsync: vi.fn(),
  mockConfirm: vi.fn(),
  mockToast: { loading: vi.fn(() => 'toast-1'), success: vi.fn(), warning: vi.fn(), error: vi.fn() }
}))

vi.mock('sonner', () => ({ toast: mockToast }))

vi.mock('@/contexts/alert-dialog-context', () => ({
  useAlertDialog: () => ({ confirm: mockConfirm })
}))

vi.mock('@tanstack/react-query', async importOriginal => ({
  ...(await importOriginal<typeof import('@tanstack/react-query')>()),
  useQueryClient: () => ({ ensureQueryData: async () => ({ retentionDays: 10 }) })
}))

vi.mock('./use-trash-operation', () => ({
  useTrashOperation: () => ({ mutateAsync: mockMutateAsync })
}))

const target = (songIds: number[]) => ({ mode: 'ids' as const, songIds })

function resolveWith(results: TrashOperationResult[]) {
  mockMutateAsync.mockResolvedValue({ resolvedCount: results.length, results })
}

const ok = (songId: number): TrashOperationResult => ({ songId, ok: true })
const failed = (songId: number, code: 'conflict' | 'readOnly', fileName?: string): TrashOperationResult => ({
  songId,
  ok: false,
  code,
  error: code,
  fileName
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useTrashActions', () => {
  it('moves songs to the trash without asking, and offers to undo it', async () => {
    resolveWith([ok(1), ok(2)])
    const { result } = renderHook(() => useTrashActions())

    result.current.moveToTrash(target([1, 2]))

    await waitFor(() => expect(mockToast.success).toHaveBeenCalled())
    expect(mockConfirm).not.toHaveBeenCalled()
    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ operation: 'trash', target: target([1, 2]) })
    )

    const options = mockToast.success.mock.calls[0][1]
    expect(options.action.label).toBe('trash.actions.undo')
    expect(options.duration).toBe(8000)
  })

  it('asks first when deleting a selection, then behaves the same', async () => {
    resolveWith([ok(1)])
    const { result } = renderHook(() => useTrashActions())

    result.current.confirmMoveToTrash(target([1, 2]), 2)

    await waitFor(() => expect(mockConfirm).toHaveBeenCalledTimes(1))
    expect(mockMutateAsync).not.toHaveBeenCalled()

    mockConfirm.mock.calls[0][0].action.onClick()

    await waitFor(() => expect(mockToast.success).toHaveBeenCalled())
    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ operation: 'trash', target: target([1, 2]) })
    )
    expect(mockToast.success.mock.calls[0][1].action.label).toBe('trash.actions.undo')
  })

  it('undo restores exactly the songs that were moved', async () => {
    resolveWith([ok(1), failed(2, 'readOnly', 'b.mp3'), ok(3)])
    const { result } = renderHook(() => useTrashActions())

    result.current.moveToTrash(target([1, 2, 3]))
    await waitFor(() => expect(mockToast.warning).toHaveBeenCalled())

    resolveWith([ok(1), ok(3)])
    mockToast.warning.mock.calls[0][1].action.onClick()

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(2))
    expect(mockMutateAsync).toHaveBeenLastCalledWith(
      expect.objectContaining({ operation: 'restore', target: target([1, 3]) })
    )
  })

  it('restores without asking and without an undo', async () => {
    resolveWith([ok(1)])
    const { result } = renderHook(() => useTrashActions())

    result.current.restore(target([1]))

    await waitFor(() => expect(mockToast.success).toHaveBeenCalled())
    expect(mockConfirm).not.toHaveBeenCalled()
    expect(mockToast.success.mock.calls[0][1].action).toBeUndefined()
  })

  it('lists each failure by file with its reason, capping the list', async () => {
    resolveWith([
      ok(1),
      failed(2, 'conflict', 'b.mp3'),
      failed(3, 'readOnly'),
      ...[4, 5, 6, 7, 8].map(id => failed(id, 'conflict', `${id}.mp3`))
    ])
    const { result } = renderHook(() => useTrashActions())

    result.current.restore(target([1, 2, 3, 4, 5, 6, 7, 8]))

    await waitFor(() => expect(mockToast.warning).toHaveBeenCalled())
    const lines = mockToast.warning.mock.calls[0][1].description.split('\n')
    expect(lines).toEqual([
      'b.mp3: trash.errors.conflict',
      '#3: trash.errors.readOnly',
      '4.mp3: trash.errors.conflict',
      '5.mp3: trash.errors.conflict',
      '6.mp3: trash.errors.conflict',
      'trash.result.moreFailures'
    ])
  })

  it('reports an error, with nothing to undo, when every song fails', async () => {
    resolveWith([failed(1, 'readOnly', 'a.mp3')])
    const { result } = renderHook(() => useTrashActions())

    result.current.moveToTrash(target([1]))

    await waitFor(() => expect(mockToast.error).toHaveBeenCalled())
    expect(mockToast.error.mock.calls[0][1].action).toBeUndefined()
    expect(mockToast.warning).not.toHaveBeenCalled()
  })

  it.each([
    ['deletePermanently', (actions: ReturnType<typeof useTrashActions>) => actions.deletePermanently(target([1]), 1)],
    ['emptyTrash', (actions: ReturnType<typeof useTrashActions>) => actions.emptyTrash(4)]
  ])('%s asks first and only runs once confirmed', async (_name, start) => {
    resolveWith([ok(1)])
    const { result } = renderHook(() => useTrashActions())

    start(result.current)

    expect(mockConfirm).toHaveBeenCalledTimes(1)
    expect(mockMutateAsync).not.toHaveBeenCalled()

    mockConfirm.mock.calls[0][0].action.onClick()

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({ operation: 'delete' })))
    await waitFor(() => expect(mockToast.success).toHaveBeenCalled())
    expect(mockToast.success.mock.calls[0][1].action).toBeUndefined()
  })

  it('surfaces a request that fails outright', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Forbidden'))
    const { result } = renderHook(() => useTrashActions())

    result.current.moveToTrash(target([1]))

    await waitFor(() => expect(mockToast.error).toHaveBeenCalledWith('Forbidden', { id: 'toast-1' }))
  })
})
