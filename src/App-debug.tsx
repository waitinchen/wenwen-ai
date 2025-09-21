import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// 簡單的聊天界面組件
const SimpleChatInterface = () => {
  const [messages, setMessages] = React.useState([
    { id: 1, text: "歡迎使用文山特區客服機器人！", isUser: false },
    { id: 2, text: "我是多多，很高興為您服務！", isUser: false }
  ])
  const [inputValue, setInputValue] = React.useState('')

  const handleSend = () => {
    if (inputValue.trim()) {
      setMessages(prev => [...prev, { id: Date.now(), text: inputValue, isUser: true }])
      setInputValue('')
    }
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', color: '#06C755' }}>
        🎉 文山特區客服機器人
      </h1>
      
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        height: '400px',
        overflowY: 'auto',
        padding: '20px',
        marginBottom: '20px',
        backgroundColor: '#f9f9f9'
      }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            marginBottom: '10px',
            textAlign: msg.isUser ? 'right' : 'left'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '10px 15px',
              borderRadius: '18px',
              backgroundColor: msg.isUser ? '#06C755' : '#e9ecef',
              color: msg.isUser ? 'white' : 'black',
              maxWidth: '70%'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="輸入您的訊息..."
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '20px',
            outline: 'none'
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: '10px 20px',
            backgroundColor: '#06C755',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer'
          }}
        >
          發送
        </button>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
        <p>🚀 多多成功啟動完整功能！</p>
        <p>當前時間：{new Date().toLocaleString('zh-TW')}</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimpleChatInterface />} />
        <Route path="/admin" element={<div style={{ padding: '20px' }}>
          <h1>管理後台</h1>
          <p>管理功能正在開發中...</p>
        </div>} />
      </Routes>
    </Router>
  )
}

export default App
