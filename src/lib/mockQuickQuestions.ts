import { QuickQuestion } from './api'

// 模擬的快速問題數據
let mockQuickQuestions: QuickQuestion[] = [
  {
    id: 1,
    question: '文山特區有哪些推薦餐廳？',
    display_order: 1,
    is_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    question: '有什麼美食推薦？',
    display_order: 2,
    is_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    question: '停車資訊',
    display_order: 3,
    is_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    question: '怎麼去文山特區？',
    display_order: 4,
    is_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    question: '有哪些停車場？',
    display_order: 5,
    is_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 6,
    question: '商家營業時間',
    display_order: 6,
    is_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export async function mockGetQuickQuestions(): Promise<QuickQuestion[]> {
  // 模擬網路延遲
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // 按顯示順序排序
  return [...mockQuickQuestions].sort((a, b) => a.display_order - b.display_order)
}

export async function mockCreateQuickQuestion(questionData: Partial<QuickQuestion>): Promise<QuickQuestion> {
  // 模擬網路延遲
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const newQuestion: QuickQuestion = {
    id: Math.max(...mockQuickQuestions.map(q => q.id)) + 1,
    question: questionData.question || '',
    display_order: questionData.display_order || mockQuickQuestions.length + 1,
    is_enabled: questionData.is_enabled ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  mockQuickQuestions.push(newQuestion)
  return newQuestion
}

export async function mockUpdateQuickQuestion(id: number, questionData: Partial<QuickQuestion>): Promise<QuickQuestion> {
  // 模擬網路延遲
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockQuickQuestions.findIndex(q => q.id === id)
  if (index === -1) {
    throw new Error('快速問題不存在')
  }
  
  const updatedQuestion: QuickQuestion = {
    ...mockQuickQuestions[index],
    ...questionData,
    id, // 確保 ID 不變
    updated_at: new Date().toISOString()
  }
  
  mockQuickQuestions[index] = updatedQuestion
  return updatedQuestion
}

export async function mockDeleteQuickQuestion(id: number): Promise<void> {
  // 模擬網路延遲
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const index = mockQuickQuestions.findIndex(q => q.id === id)
  if (index === -1) {
    throw new Error('快速問題不存在')
  }
  
  mockQuickQuestions.splice(index, 1)
}

export async function mockBulkUpdateQuickQuestions(items: QuickQuestion[]): Promise<void> {
  // 模擬網路延遲
  await new Promise(resolve => setTimeout(resolve, 800))
  
  for (const item of items) {
    const index = mockQuickQuestions.findIndex(q => q.id === item.id)
    if (index !== -1) {
      mockQuickQuestions[index] = {
        ...mockQuickQuestions[index],
        ...item,
        updated_at: new Date().toISOString()
      }
    }
  }
}

