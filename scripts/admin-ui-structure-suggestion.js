/**
 * Admin UI 結構建議（快速版）
 */

const adminUIStructure = `
// Admin stores 表單新增「標籤（多選＋可新增）」組件

// React 組件示例
import CreatableSelect from 'react-select/creatable';

const StoreTagsEditor = ({ store, onTagsChange }) => {
  // 系統保留詞（不可刪除）
  const systemReservedTags = [
    '日式料理', '壽司', '拉麵', '丼飯', '韓式料理', '烤肉', '泡菜',
    '泰式料理', '咖喱', '中式料理', '火鍋', '台菜', '義式料理', '披薩',
    '素食', '咖啡', '甜點', '燒烤', '停車場', '購物', '美容', '醫療'
  ];
  
  // 選項配置
  const tagOptions = [
    ...systemReservedTags.map(tag => ({
      value: tag,
      label: tag,
      isDisabled: false,
      isReserved: true
    })),
    ...store.features?.tags?.filter(tag => !systemReservedTags.includes(tag)).map(tag => ({
      value: tag,
      label: tag,
      isDisabled: false,
      isReserved: false
    })) || []
  ];
  
  // 樣式配置
  const customStyles = {
    multiValue: (styles, { data }) => ({
      ...styles,
      backgroundColor: data.isReserved ? '#f0f0f0' : '#e3f2fd',
      color: data.isReserved ? '#666' : '#1976d2'
    }),
    multiValueLabel: (styles, { data }) => ({
      ...styles,
      color: data.isReserved ? '#666' : '#1976d2'
    })
  };
  
  const handleTagsChange = (selectedOptions) => {
    // 限制最多 12 個標籤
    if (selectedOptions.length > 12) {
      alert('最多只能選擇 12 個標籤');
      return;
    }
    
    const tags = selectedOptions.map(option => option.value);
    onTagsChange(tags);
  };
  
  return (
    <div className="store-tags-editor">
      <label>標籤（最多 12 個）</label>
      <CreatableSelect
        isMulti
        isClearable
        isSearchable
        value={tagOptions.filter(option => 
          store.features?.tags?.includes(option.value)
        )}
        options={tagOptions}
        onChange={handleTagsChange}
        styles={customStyles}
        placeholder="選擇或新增標籤..."
        formatCreateLabel={(inputValue) => \`新增標籤: "\${inputValue}"\`}
        noOptionsMessage={() => "沒有更多標籤選項"}
        isOptionDisabled={(option) => option.isReserved}
      />
      <div className="tag-legend">
        <span className="legend-item">
          <span className="legend-color reserved"></span>
          系統保留詞（不可刪除）
        </span>
        <span className="legend-item">
          <span className="legend-color custom"></span>
          自定義標籤
        </span>
      </div>
    </div>
  );
};

// 後端處理邏輯
const processStoreTags = (tags) => {
  if (!Array.isArray(tags)) return [];
  
  return tags
    .map(tag => {
      // 去前後空白
      const trimmed = tag.trim();
      // 統一大小寫（中文不用處理，英數統一小寫）
      const normalized = trimmed.replace(/[a-zA-Z0-9]/g, char => char.toLowerCase());
      return normalized;
    })
    .filter(tag => tag.length > 0) // 移除空字串
    .filter((tag, index, array) => array.indexOf(tag) === index) // 去重
    .slice(0, 12); // 限制最多 12 個
};

// 更新 features JSONB
const updateStoreFeatures = async (storeId, tags) => {
  const processedTags = processStoreTags(tags);
  
  const { data, error } = await supabase
    .from('stores')
    .update({
      features: {
        tags: processedTags,
        secondary_category: '', // 保持其他欄位
        ...existingFeatures
      }
    })
    .eq('id', storeId);
    
  if (error) {
    console.error('更新標籤失敗:', error);
    throw error;
  }
  
  return data;
};
`;

console.log('🚀 Admin UI 結構建議（快速版）');
console.log('=' .repeat(50));
console.log('');
console.log('✅ 前端組件：');
console.log('- 使用 React Select Creatable');
console.log('- 多選 + 可新增標籤');
console.log('- 系統保留詞灰色顯示且不可刪');
console.log('- 最多 12 個標籤限制');
console.log('');
console.log('🔧 後端處理：');
console.log('- 去重、去前後空白');
console.log('- 統一大小寫（英數小寫）');
console.log('- 寫回 features.tags（JSONB 陣列）');
console.log('- 利用 GIN 索引加速查詢');
console.log('');
console.log('🏷️ 系統保留詞：');
console.log('- 日式料理、壽司、拉麵、丼飯');
console.log('- 韓式料理、烤肉、泡菜');
console.log('- 泰式料理、咖喱');
console.log('- 中式料理、火鍋、台菜');
console.log('- 義式料理、披薩');
console.log('- 素食、咖啡、甜點、燒烤');
console.log('- 停車場、購物、美容、醫療');
console.log('');
console.log('📊 功能特點：');
console.log('- 視覺化區分保留詞和自定義詞');
console.log('- 即時驗證標籤數量限制');
console.log('- 支援搜尋和篩選');
console.log('- 自動完成和建議');
console.log('');
console.log('📝 需要整合到現有的 Admin UI 中');
