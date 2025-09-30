import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function readExcelData() {
  try {
    console.log('📊 開始讀取Excel文件...')
    
    const filePath = path.join(__dirname, '..', '高雄市鳳山區生活機能場所資料庫.xlsx')
    console.log(`📁 文件路徑: ${filePath}`)
    
    // 檢查文件是否存在
    if (!fs.existsSync(filePath)) {
      console.error('❌ 文件不存在:', filePath)
      return
    }
    
    // 讀取Excel文件
    const workbook = XLSX.readFile(filePath)
    console.log('✅ Excel文件讀取成功')
    
    // 獲取工作表名稱
    const sheetNames = workbook.SheetNames
    console.log(`📋 工作表數量: ${sheetNames.length}`)
    console.log(`📋 工作表名稱: ${sheetNames.join(', ')}`)
    
    // 讀取第一個工作表
    const worksheet = workbook.Sheets[sheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)
    
    console.log(`\n📊 數據統計:`)
    console.log(`   總行數: ${jsonData.length}`)
    
    if (jsonData.length > 0) {
      console.log(`   欄位名稱: ${Object.keys(jsonData[0]).join(', ')}`)
      
      console.log(`\n📝 前5筆數據預覽:`)
      jsonData.slice(0, 5).forEach((row, index) => {
        console.log(`\n第${index + 1}筆:`)
        Object.entries(row).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`)
        })
      })
      
      // 分析數據結構
      console.log(`\n📈 數據分析:`)
      const columns = Object.keys(jsonData[0])
      columns.forEach(col => {
        const values = jsonData.map(row => row[col]).filter(val => val !== undefined && val !== '')
        const uniqueValues = [...new Set(values)]
        console.log(`   ${col}: ${values.length} 個值, ${uniqueValues.length} 個唯一值`)
        if (uniqueValues.length <= 10) {
          console.log(`      唯一值: ${uniqueValues.join(', ')}`)
        }
      })
      
      // 保存為JSON文件供後續處理
      const outputPath = path.join(__dirname, '..', 'data', 'excel-data.json')
      fs.mkdirSync(path.dirname(outputPath), { recursive: true })
      fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), 'utf8')
      console.log(`\n💾 數據已保存到: ${outputPath}`)
    }
    
  } catch (error) {
    console.error('❌ 讀取Excel文件失敗:', error.message)
  }
}

readExcelData()
