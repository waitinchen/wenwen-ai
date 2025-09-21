import { invokeEdgeFunction } from './client'
import type { ChatResponse } from './types'

export async function sendMessage(
  message: string,
  sessionId?: string,
  lineUid?: string
): Promise<ChatResponse> {
  return invokeEdgeFunction<ChatResponse>('claude-chat', {
    message,
    sessionId,
    line_uid: lineUid
  })
}
