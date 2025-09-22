// 資料層驗證腳本
import fs from 'fs';
import path from 'path';

console.log('🔍 開始資料層驗證...\n');

const validationResults = {
  timestamp: new Date().toISOString(),
  total_files: 0,
  passed_files: 0,
  failed_files: 0,
  errors: []
};

// 驗證 JSONL 檔案
function validateJSONL(filePath, requiredFields = []) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    validationResults.total_files++;
    
    let lineErrors = [];
    lines.forEach((line, index) => {
      try {
        const obj = JSON.parse(line);
        
        // 檢查必要欄位
        requiredFields.forEach(field => {
          if (!obj[field]) {
            lineErrors.push(`Line ${index + 1}: Missing required field '${field}'`);
          }
        });
        
        // 檢查 JSONL 基本結構（根據檔案類型調整）
        if (filePath.includes('testset-')) {
          // 測試集檔案需要 q 和 expected_intent
          if (!obj.q || !obj.expected_intent) {
            lineErrors.push(`Line ${index + 1}: Missing 'q' or 'expected_intent' field`);
          }
        } else if (filePath.includes('faq/')) {
          // FAQ 檔案需要 intent, q, a
          if (!obj.intent || !obj.q || !obj.a) {
            lineErrors.push(`Line ${index + 1}: Missing 'intent', 'q', or 'a' field`);
          }
        }
        
      } catch (parseError) {
        lineErrors.push(`Line ${index + 1}: JSON parse error - ${parseError.message}`);
      }
    });
    
    if (lineErrors.length > 0) {
      validationResults.failed_files++;
      validationResults.errors.push({
        file: filePath,
        type: 'JSONL',
        errors: lineErrors
      });
      console.log(`❌ ${filePath}: ${lineErrors.length} errors`);
    } else {
      validationResults.passed_files++;
      console.log(`✅ ${filePath}: Valid`);
    }
    
  } catch (error) {
    validationResults.failed_files++;
    validationResults.errors.push({
      file: filePath,
      type: 'File Read Error',
      errors: [error.message]
    });
    console.log(`❌ ${filePath}: ${error.message}`);
  }
}

// 驗證 JSON 檔案
function validateJSON(filePath, schema = {}) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const obj = JSON.parse(content);
    
    validationResults.total_files++;
    
    let errors = [];
    
    // 檢查基本 JSON 結構
    if (typeof obj !== 'object' || obj === null) {
      errors.push('Root must be an object');
    }
    
    // 檢查必要欄位（根據檔案類型調整）
    if (filePath.includes('persona.json')) {
      const requiredFields = ['id', 'display_name', 'role'];
      requiredFields.forEach(field => {
        if (!obj[field]) {
          errors.push(`Missing required field: ${field}`);
        }
      });
    } else if (filePath.includes('policies.json')) {
      const requiredFields = ['version', 'branching'];
      requiredFields.forEach(field => {
        if (!obj[field]) {
          errors.push(`Missing required field: ${field}`);
        }
      });
    } else {
      // 通用檢查
      Object.keys(schema).forEach(field => {
        if (!obj[field]) {
          errors.push(`Missing required field: ${field}`);
        }
      });
    }
    
    if (errors.length > 0) {
      validationResults.failed_files++;
      validationResults.errors.push({
        file: filePath,
        type: 'JSON',
        errors: errors
      });
      console.log(`❌ ${filePath}: ${errors.length} errors`);
    } else {
      validationResults.passed_files++;
      console.log(`✅ ${filePath}: Valid`);
    }
    
  } catch (error) {
    validationResults.failed_files++;
    validationResults.errors.push({
      file: filePath,
      type: 'JSON Parse Error',
      errors: [error.message]
    });
    console.log(`❌ ${filePath}: ${error.message}`);
  }
}

// 驗證停車場資料
function validateParkingData() {
  const parkingFile = path.join(process.cwd(), 'src/data/parkingLots.json');
  if (fs.existsSync(parkingFile)) {
    try {
      const content = fs.readFileSync(parkingFile, 'utf8');
      const data = JSON.parse(content);
      
      validationResults.total_files++;
      
      let errors = [];
      
      // 檢查是否為陣列
      if (!Array.isArray(data)) {
        errors.push('Parking data must be an array');
      } else {
        // 檢查每個停車場的必要欄位
        data.forEach((lot, index) => {
          const requiredFields = ['id', 'name', 'latitude', 'longitude'];
          requiredFields.forEach(field => {
            if (!lot[field]) {
              errors.push(`Parking lot ${index + 1}: Missing required field '${field}'`);
            }
          });
          
          // 檢查 address 欄位（允許空字串）
          if (lot.address === undefined) {
            errors.push(`Parking lot ${index + 1}: Missing 'address' field`);
          }
          
          // 檢查座標格式
          if (lot.latitude && (typeof lot.latitude !== 'number' || lot.latitude < -90 || lot.latitude > 90)) {
            errors.push(`Parking lot ${index + 1}: Invalid latitude ${lot.latitude}`);
          }
          if (lot.longitude && (typeof lot.longitude !== 'number' || lot.longitude < -180 || lot.longitude > 180)) {
            errors.push(`Parking lot ${index + 1}: Invalid longitude ${lot.longitude}`);
          }
        });
      }
      
      if (errors.length > 0) {
        validationResults.failed_files++;
        validationResults.errors.push({
          file: parkingFile,
          type: 'Parking Data',
          errors: errors
        });
        console.log(`❌ ${parkingFile}: ${errors.length} errors`);
      } else {
        validationResults.passed_files++;
        console.log(`✅ ${parkingFile}: Valid (${data.length} parking lots)`);
      }
      
    } catch (error) {
      validationResults.failed_files++;
      validationResults.errors.push({
        file: parkingFile,
        type: 'Parking Data Parse Error',
        errors: [error.message]
      });
      console.log(`❌ ${parkingFile}: ${error.message}`);
    }
  }
}

// 執行驗證
console.log('📋 驗證測試集檔案:');
validateJSONL(path.join(process.cwd(), 'data/eval/testset-gowenwen.jsonl'), ['q', 'expected_intent']);
validateJSONL(path.join(process.cwd(), 'data/eval/testset-parking.jsonl'), ['q', 'expected_intent']);

console.log('\n📋 驗證 FAQ 檔案:');
validateJSONL(path.join(process.cwd(), 'faq/general.jsonl'), ['intent', 'q', 'a']);
validateJSONL(path.join(process.cwd(), 'faq/transport.jsonl'), ['intent', 'q', 'a']);

console.log('\n📋 驗證配置檔案:');
validateJSON(path.join(process.cwd(), 'persona.json'), ['id', 'display_name', 'role']);
validateJSON(path.join(process.cwd(), 'flows/policies.json'), ['version', 'branching']);

console.log('\n📋 驗證資料檔案:');
validateParkingData();

// 輸出結果
console.log('\n📊 驗證結果:');
console.log(`總檔案數: ${validationResults.total_files}`);
console.log(`通過檔案: ${validationResults.passed_files}`);
console.log(`失敗檔案: ${validationResults.failed_files}`);
console.log(`通過率: ${((validationResults.passed_files / validationResults.total_files) * 100).toFixed(1)}%`);

if (validationResults.failed_files > 0) {
  console.log('\n❌ 驗證失敗的檔案:');
  validationResults.errors.forEach(error => {
    console.log(`\n📁 ${error.file} (${error.type}):`);
    error.errors.forEach(err => {
      console.log(`  - ${err}`);
    });
  });
  
  console.log('\n🔧 請修正錯誤後重新執行驗證！');
  process.exit(1);
} else {
  console.log('\n🎉 所有資料驗證通過！');
  
  // 儲存驗證報告
  const reportPath = path.join(process.cwd(), 'data/eval/report/data-validation.json');
  fs.writeFileSync(reportPath, JSON.stringify(validationResults, null, 2), 'utf8');
  console.log(`📄 驗證報告已儲存至: ${reportPath}`);
}
