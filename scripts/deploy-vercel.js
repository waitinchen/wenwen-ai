import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('🚀 開始Vercel部署準備...')

// 檢查dist目錄
if (!fs.existsSync('dist')) {
  console.log('❌ dist目錄不存在，請先運行 npm run build')
  process.exit(1)
}

console.log('✅ dist目錄存在')

// 檢查必要文件
const requiredFiles = ['dist/index.html', 'vercel.json']
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.log(`❌ 缺少必要文件: ${file}`)
    process.exit(1)
  }
}

console.log('✅ 所有必要文件存在')

// 檢查Vercel CLI
try {
  execSync('vercel --version', { stdio: 'pipe' })
  console.log('✅ Vercel CLI已安裝')
} catch (error) {
  console.log('❌ Vercel CLI未安裝')
  console.log('請運行: npm install -g vercel')
  process.exit(1)
}

console.log('\n📋 部署準備完成！')
console.log('\n🚀 下一步驟:')
console.log('1. 確保已安裝Vercel CLI: npm install -g vercel')
console.log('2. 登入Vercel: vercel login')
console.log('3. 部署項目: vercel --prod')
console.log('\n或者直接運行:')
console.log('npx vercel --prod')


