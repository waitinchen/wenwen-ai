import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createQuickQuestion as createQuickQuestionRequest,
  deleteQuickQuestion as deleteQuickQuestionRequest,
  getQuickQuestions as getQuickQuestionsRequest,
  updateQuickQuestion as updateQuickQuestionRequest
} from '@/lib/api'
import type { QuickQuestionInput, QuickQuestionRecord } from '@/lib/api'

const CACHE_TTL = 5 * 60 * 1000

type CacheState = {
  data: QuickQuestionRecord[] | null
  error: unknown
  isFetching: boolean
  promise: Promise<QuickQuestionRecord[]> | null
  lastFetched: number
}

type CacheListener = (state: CacheState) => void

const cacheState: CacheState = {
  data: null,
  error: null,
  isFetching: false,
  promise: null,
  lastFetched: 0
}

const listeners = new Set<CacheListener>()

const notify = () => {
  for (const listener of listeners) {
    listener(cacheState)
  }
}

const updateCacheState = (partial: Partial<CacheState>) => {
  Object.assign(cacheState, partial)
  notify()
}

const normalizeError = (error: unknown): Error | null => {
  if (!error) return null
  if (error instanceof Error) return error
  if (typeof error === 'string') return new Error(error)
  try {
    return new Error(JSON.stringify(error))
  } catch {
    return new Error('Unknown error')
  }
}

const shouldUseCache = (forceRefresh: boolean): boolean => {
  if (forceRefresh) return false
  if (!cacheState.data || cacheState.data.length === 0) return false
  return Date.now() - cacheState.lastFetched < CACHE_TTL
}

const fetchQuickQuestions = async (forceRefresh = false) => {
  if (shouldUseCache(forceRefresh)) {
    return cacheState.data ?? []
  }

  if (cacheState.promise) {
    return cacheState.promise
  }

  const promise = (async () => {
    updateCacheState({ isFetching: true, error: null })
    try {
      const data = await getQuickQuestionsRequest()
      updateCacheState({
        data,
        isFetching: false,
        error: null,
        lastFetched: Date.now(),
        promise: null
      })
      return data
    } catch (error) {
      updateCacheState({ error, isFetching: false, promise: null })
      throw error
    }
  })()

  updateCacheState({ promise })
  return promise
}

type Snapshot = {
  questions: QuickQuestionRecord[]
  isLoading: boolean
  isRefreshing: boolean
  error: Error | null
  lastFetched: number
}

const toSnapshot = (state: CacheState): Snapshot => ({
  questions: state.data ?? [],
  isLoading: state.isFetching && !state.data,
  isRefreshing: state.isFetching && !!state.data,
  error: normalizeError(state.error),
  lastFetched: state.lastFetched
})

export function useQuickQuestions() {
  const [snapshot, setSnapshot] = useState<Snapshot>(() => toSnapshot(cacheState))
  const [isMutating, setIsMutating] = useState(false)

  useEffect(() => {
    const listener: CacheListener = (state) => {
      setSnapshot(toSnapshot(state))
    }

    listeners.add(listener)
    listener(cacheState)

    return () => {
      listeners.delete(listener)
    }
  }, [])

  useEffect(() => {
    if (!cacheState.data) {
      fetchQuickQuestions().catch(() => {
        // 錯誤會由 cache state 通知
      })
    }
  }, [])

  const refresh = useCallback(async () => {
    await fetchQuickQuestions(true)
  }, [])

  const runMutation = useCallback(
    async (mutation: () => Promise<unknown>) => {
      setIsMutating(true)
      try {
        await mutation()
        await fetchQuickQuestions(true)
      } catch (error) {
        updateCacheState({ error })
        throw error
      } finally {
        setIsMutating(false)
      }
    },
    []
  )

  const createQuickQuestion = useCallback(
    async (payload: QuickQuestionInput) => {
      await runMutation(() => createQuickQuestionRequest(payload))
    },
    [runMutation]
  )

  const updateQuickQuestion = useCallback(
    async (id: number, payload: QuickQuestionInput) => {
      await runMutation(() => updateQuickQuestionRequest(id, payload))
    },
    [runMutation]
  )

  const deleteQuickQuestion = useCallback(
    async (id: number) => {
      await runMutation(() => deleteQuickQuestionRequest(id))
    },
    [runMutation]
  )

  const isCacheStale = useMemo(() => {
    if (!snapshot.lastFetched) return true
    return Date.now() - snapshot.lastFetched >= CACHE_TTL
  }, [snapshot.lastFetched])

  return {
    questions: snapshot.questions,
    isLoading: snapshot.isLoading,
    isRefreshing: snapshot.isRefreshing,
    isCacheStale,
    error: snapshot.error,
    refresh,
    createQuickQuestion,
    updateQuickQuestion,
    deleteQuickQuestion,
    isMutating
  }
}

export type UseQuickQuestionsReturn = ReturnType<typeof useQuickQuestions>
