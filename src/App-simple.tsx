import React from 'react'

function App() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🎉 文山特區客服機器人</h1>
      <p>多多成功啟動了！</p>
      <p>當前時間：{new Date().toLocaleString('zh-TW')}</p>
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h2>🚀 開發環境測試成功</h2>
        <p>如果您看到這個頁面，表示 React 應用已經正常運行！</p>
      </div>
    </div>
  )
}

export default App
