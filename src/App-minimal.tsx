import React from 'react'

function App() {
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f8ff',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#06C755', fontSize: '2.5rem', marginBottom: '20px' }}>
        🎉 文山特區客服機器人
      </h1>
      
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>
          🚀 多多成功啟動！
        </h2>
        
        <p style={{ fontSize: '1.2rem', marginBottom: '15px' }}>
          如果您看到這個頁面，表示 React 應用已經正常運行！
        </p>
        
        <div style={{
          backgroundColor: '#e8f5e8',
          padding: '15px',
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <p><strong>當前時間：</strong>{new Date().toLocaleString('zh-TW')}</p>
          <p><strong>狀態：</strong>✅ 開發環境運行正常</p>
          <p><strong>版本：</strong>多多 v1.0</p>
        </div>
        
        <div style={{ marginTop: '30px' }}>
          <h3>🎯 下一步功能</h3>
          <ul style={{ textAlign: 'left', display: 'inline-block' }}>
            <li>聊天界面</li>
            <li>管理後台</li>
            <li>數據庫連接</li>
            <li>AI 對話功能</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App

