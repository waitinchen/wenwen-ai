import type { PostgrestError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { ApiError } from './errors'

type PostgrestResult<T> = {
  data: T
  error: PostgrestError | null
}

export async function executeSupabaseQuery<T>(
  queryPromise: Promise<PostgrestResult<T>>,
  contextMessage: string
): Promise<T> {
  const { data, error } = await queryPromise

  if (error) {
    console.error(`[Supabase] ${contextMessage}`, error)
    throw new ApiError(`${contextMessage}: ${error.message}`, error)
  }

  return data
}

export { supabase }
