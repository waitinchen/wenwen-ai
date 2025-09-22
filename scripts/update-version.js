#!/usr/bin/env node

/**
 * 版本自動更新腳本
 * 用法: node scripts/update-version.js [major|minor|patch] [description]
 * 例如: node scripts/update-version.js patch "修復特約商家保存問題"
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 獲取命令行參數
const args = process.argv.slice(2)
const versionType = args[0] || 'patch' // major, minor, patch
const description = args[1] || '版本更新'

// 版本配置文件路徑
const versionConfigPath = path.join(__dirname, '../src/config/version.ts')

// 讀取當前版本配置
let versionConfig = fs.readFileSync(versionConfigPath, 'utf8')

// 解析當前版本號
const currentVersionMatch = versionConfig.match(/version: 'WEN (\d+)\.(\d+)\.(\d+)'/)
if (!currentVersionMatch) {
  console.error('無法解析當前版本號')
  process.exit(1)
}

const [, major, minor, patch] = currentVersionMatch.map(Number)

// 計算新版本號
let newMajor = major
let newMinor = minor
let newPatch = patch

switch (versionType) {
  case 'major':
    newMajor += 1
    newMinor = 0
    newPatch = 0
    break
  case 'minor':
    newMinor += 1
    newPatch = 0
    break
  case 'patch':
    newPatch += 1
    break
  default:
    console.error('無效的版本類型。請使用 major, minor 或 patch')
    process.exit(1)
}

const newVersion = `WEN ${newMajor}.${newMinor}.${newPatch}`
const buildNumber = generateBuildNumber()
const releaseDate = new Date().toISOString().split('T')[0]
const buildTime = new Date().toISOString()

console.log(`更新版本: ${currentVersionMatch[0]} -> ${newVersion}`)
console.log(`構建號: ${buildNumber}`)
console.log(`發布日期: ${releaseDate}`)

// 生成構建號
function generateBuildNumber() {
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '')
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '')
  return `${dateStr}-${timeStr}`
}

// 生成新的更新日誌條目
function generateChangelogEntry() {
  const entryId = `wen-${newMajor}-${newMinor}-${newPatch}-${Date.now().toString().slice(-3)}`
  const type = getTypeFromDescription(description)
  const category = getCategoryFromDescription(description)
  
  return `  {
    id: '${entryId}',
    version: '${newVersion}',
    date: '${releaseDate}',
    type: '${type}',
    category: '${category}',
    title: '${description}',
    description: '${description}',
    author: '開發團隊',
    impact: 'medium',
    status: 'deployed'
  }`
}

// 根據描述判斷類型
function getTypeFromDescription(desc) {
  const lowerDesc = desc.toLowerCase()
  if (lowerDesc.includes('修復') || lowerDesc.includes('修復') || lowerDesc.includes('bug')) {
    return 'bugfix'
  }
  if (lowerDesc.includes('新功能') || lowerDesc.includes('新增') || lowerDesc.includes('功能')) {
    return 'feature'
  }
  if (lowerDesc.includes('緊急') || lowerDesc.includes('hotfix')) {
    return 'hotfix'
  }
  if (lowerDesc.includes('安全') || lowerDesc.includes('security')) {
    return 'security'
  }
  if (lowerDesc.includes('性能') || lowerDesc.includes('優化')) {
    return 'performance'
  }
  if (lowerDesc.includes('界面') || lowerDesc.includes('ui') || lowerDesc.includes('樣式')) {
    return 'ui'
  }
  if (lowerDesc.includes('重構') || lowerDesc.includes('代碼')) {
    return 'refactor'
  }
  return 'feature'
}

// 根據描述判斷分類
function getCategoryFromDescription(desc) {
  const lowerDesc = desc.toLowerCase()
  if (lowerDesc.includes('商家') || lowerDesc.includes('store')) {
    return '商家管理'
  }
  if (lowerDesc.includes('對話') || lowerDesc.includes('chat')) {
    return '對話系統'
  }
  if (lowerDesc.includes('登入') || lowerDesc.includes('auth')) {
    return '用戶認證'
  }
  if (lowerDesc.includes('界面') || lowerDesc.includes('ui')) {
    return '界面優化'
  }
  if (lowerDesc.includes('數據') || lowerDesc.includes('data')) {
    return '數據管理'
  }
  if (lowerDesc.includes('ai') || lowerDesc.includes('智能')) {
    return 'AI功能'
  }
  return '系統更新'
}

// 更新版本配置
const newVersionConfig = versionConfig
  .replace(/version: 'WEN \d+\.\d+\.\d+'/, `version: '${newVersion}'`)
  .replace(/buildNumber: '[^']+'/, `buildNumber: '${buildNumber}'`)
  .replace(/releaseDate: '[^']+'/, `releaseDate: '${releaseDate}'`)
  .replace(/buildTime: '[^']+'/, `buildTime: '${buildTime}'`)

// 添加新的更新日誌條目
const changelogEntry = generateChangelogEntry()
const newChangelogEntry = `  ${changelogEntry},\n`

// 在 CHANGELOG 數組的開頭插入新條目
const changelogInsertPoint = versionConfig.indexOf('export const CHANGELOG: ChangelogEntry[] = [')
const changelogStart = versionConfig.indexOf('[', changelogInsertPoint) + 1
const beforeChangelog = versionConfig.substring(0, changelogStart)
const afterChangelog = versionConfig.substring(changelogStart)

const updatedVersionConfig = beforeChangelog + '\n' + newChangelogEntry + afterChangelog

// 寫入更新後的配置文件
fs.writeFileSync(versionConfigPath, updatedVersionConfig, 'utf8')

console.log('✅ 版本配置已更新')
console.log(`📝 新增更新日誌: ${description}`)
console.log(`🔧 請重新構建專案: npm run build`)

// 生成部署指令
console.log('\n📋 部署指令:')
console.log('1. npm run build')
console.log('2. 上傳 dist 資料夾到伺服器')
console.log(`3. 更新完成: ${newVersion}`)
