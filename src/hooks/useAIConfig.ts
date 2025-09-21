import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/Toast'

interface AIConfig {
  id: number
  model_name: string
  temperature: number
  max_tokens: number
  system_prompt: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface UseAIConfigProps {
  autoFetch?: boolean
}

export function useAIConfig({ autoFetch = true }: UseAIConfigProps = {}) {
  const [configs, setConfigs] = useState<AIConfig[]>([])
  const [activeConfig, setActiveConfig] = useState<AIConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { addToast } = useToast()

  const fetchConfigs = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('ai_configs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setConfigs(data || [])
      
      // 設置活躍配置
      const active = data?.find(config => config.is_active)
      if (active) {
        setActiveConfig(active)
      }
    } catch (error) {
      console.error('Error fetching AI configs:', error)
      addToast({
        type: 'error',
        title: '載入失敗',
        message: '無法載入 AI 配置'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createConfig = async (configData: Omit<AIConfig, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('ai_configs')
        .insert({
          ...configData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      
      setConfigs(prev => [data, ...prev])
      addToast({
        type: 'success',
        title: '創建成功',
        message: 'AI 配置已創建'
      })
      
      return data
    } catch (error) {
      console.error('Error creating AI config:', error)
      addToast({
        type: 'error',
        title: '創建失敗',
        message: '無法創建 AI 配置'
      })
      throw error
    }
  }

  const updateConfig = async (id: number, updates: Partial<AIConfig>) => {
    try {
      const { data, error } = await supabase
        .from('ai_configs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      setConfigs(prev => 
        prev.map(config => config.id === id ? data : config)
      )
      
      if (data.is_active) {
        setActiveConfig(data)
      }
      
      addToast({
        type: 'success',
        title: '更新成功',
        message: 'AI 配置已更新'
      })
      
      return data
    } catch (error) {
      console.error('Error updating AI config:', error)
      addToast({
        type: 'error',
        title: '更新失敗',
        message: '無法更新 AI 配置'
      })
      throw error
    }
  }

  const deleteConfig = async (id: number) => {
    try {
      const { error } = await supabase
        .from('ai_configs')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setConfigs(prev => prev.filter(config => config.id !== id))
      
      if (activeConfig?.id === id) {
        setActiveConfig(null)
      }
      
      addToast({
        type: 'success',
        title: '刪除成功',
        message: 'AI 配置已刪除'
      })
    } catch (error) {
      console.error('Error deleting AI config:', error)
      addToast({
        type: 'error',
        title: '刪除失敗',
        message: '無法刪除 AI 配置'
      })
      throw error
    }
  }

  const setActiveConfigById = async (id: number) => {
    try {
      // 先將所有配置設為非活躍
      await supabase
        .from('ai_configs')
        .update({ is_active: false })
        .neq('id', 0) // 更新所有記錄

      // 然後設置指定配置為活躍
      const { data, error } = await supabase
        .from('ai_configs')
        .update({ is_active: true })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      setActiveConfig(data)
      setConfigs(prev => 
        prev.map(config => ({
          ...config,
          is_active: config.id === id
        }))
      )
      
      addToast({
        type: 'success',
        title: '切換成功',
        message: 'AI 配置已切換'
      })
    } catch (error) {
      console.error('Error setting active config:', error)
      addToast({
        type: 'error',
        title: '切換失敗',
        message: '無法切換 AI 配置'
      })
      throw error
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchConfigs()
    }
  }, [autoFetch])

  return {
    configs,
    activeConfig,
    isLoading,
    fetchConfigs,
    createConfig,
    updateConfig,
    deleteConfig,
    setActiveConfigById
  }
}

