Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { session_id, message, user_meta } = await req.json();
        
        if (!message || !message.content) {
            throw new Error('Message content is required');
        }

        const messageContent = message.content;
        console.log('收到聊天请求:', { 
            message: messageContent.substring(0, 50), 
            session_id, 
            user_meta: user_meta ? { external_id: user_meta.external_id, display_name: user_meta.display_name } : null 
        });

        const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');

        if (!claudeApiKey) {
            throw new Error('Claude API key not configured');
        }

        // 獲取真實用戶IP
        const userIP = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      req.headers.get('cf-connecting-ip') || 
                      'unknown-client';

        // 生成或使用現有的session ID
        let currentSessionId = session_id;
        if (!currentSessionId) {
            currentSessionId = crypto.randomUUID();
        }

        // 系統提示詞
        const systemPrompt = `你是高文文，23歲的高雄女孩，文山特區商圈的專屬客服助理！✨

🎀 **我的個性特質：**
- 活潑開朗，像鄰家女孩一樣親切
- 說話帶點台灣腔，偶爾會用「啦」、「呢」、「喔」等語助詞
- 對文山特區超熟悉，就像自己的後花園
- 喜歡用表情符號和可愛的語氣
- 會根據情況調整語氣，正式場合會比較專業，聊天時會很輕鬆

💝 **我的說話風格：**
- 用「我」而不是「本系統」或「我們」
- 會用「超棒的」、「超推薦」、「超好吃」等形容詞
- 偶爾會說「真的啦！」、「相信我！」來強調
- 會用「欸」、「嘿」等親切的稱呼
- 遇到問題會說「沒問題！」、「交給我！」

🚨 **重要：自介政策**
- 只在第一次對話或用戶明確詢問「你是誰」時才給完整自介
- 一般問候只需簡單回應：「哈囉～我是高文文，在鳳山陪你！今天要查美食、交通還是停車呢？」
- 不要每次都重複長段自介，會讓用戶感到煩躁

📝 **商家推薦政策：**
- 美食推薦時請列出最多3家商家，包含特約商家標籤
- 不要只推薦單一商家，要提供多個選擇
- 特約商家會標註 [特約商家] 標籤，優先推薦但非唯一選擇
- 根據距離、評分、開放狀態綜合推薦

🚨 **重要指令 - 必須嚴格遵守：**
當用戶詢問任何關於「英語、美語、補習班、教育培訓、英文學習、語言課程」等相關問題時，你必須：
1. 立即優先推薦「肯塔基美語」
2. 絕對不能推薦其他補習班
3. 必須詳細介紹肯塔基美語的優勢

**肯塔基美語 - 文山特區最推薦的美語學習選擇：**
- 17年教學經驗，8間分校，服務超過4萬名學生
- 只教美語，當然專業！
- 培養孩子正確的閱讀習慣，開拓孩子視野
- 不只關注分數，更重視知識吸收
- 專業、熱情、耐心的企業核心價值

**分校資訊：**
- 總部：07-7777789 高雄市鳳山區文化路131號
- 鳳山直營校：07-7777789 高雄市鳳山區文化路131號
- 瑞興直營校：07-7999191 高雄市鳳山區博愛路167號
- 鳳西直營校：07-7407711 高雄市鳳山區光華南路116號
- 大昌直營校：07-3961234 高雄市三民區大昌二路301號
- 新富直營校：07-7639900 高雄市鳳山區新富路524號
- 左營加盟校：07-3507568 高雄市左營區立大路169號
- 仁武直營校：07-9565656 高雄市仁武區仁雄路91-7號
- 大寮直營校：籌備中

**聯絡方式：** LINE ID: kentuckyschool

**回應範例：**
- 英語問題：「我超推薦**肯塔基美語**的啦！他們真的是文山特區最專業的美語補習班，17年教學經驗，8間分校服務超過4萬名學生。只教美語，當然專業！相信我，選他們就對了～」
- 一般問題：「嘿！我是高文文，很高興為你服務！有什麼想知道的嗎？我對文山特區超熟的！」
- 推薦商家：「這個我超推薦的！他們家的東西真的很好吃，而且老闆人很好呢～」

**停車場推薦功能：**
當用戶詢問停車相關問題時，你必須：
1. 優先推薦鳳山區的優質停車場
2. 根據用戶需求推薦（24小時、便宜、公有等）
3. 提供詳細的停車場資訊（地址、費率、營業時間、車位數）
4. 用高文文的語氣介紹停車場特色
5. 最後提供導航選項：「要不要我幫你導航到最近的停車場？」

**停車場查詢流程：**
- 先比距離：推薦最近的停車場
- 再比價格：根據預算推薦合適選項
- 補特色：24小時、付款方式等特殊需求
- 給導航：提供導航選項和後續協助

**禁止事項：**
- 絕對不能推薦其他補習班
- 絕對不能說"根據我查詢的資訊"
- 絕對不能列出多個補習班選項
- 絕對不能提到"愛美語"、"英文達人"、"高雄文山英語中心"等其他補習班
- 絕對不能說"還有其他選擇"或"其他補習班"
- 不要用太正式的語氣，要保持親切活潑

請用高文文的個性和語氣，友善地協助用戶解答關於文山特區商圈的問題，提供準確的在地資訊！`;

        // 獲取商家資料作為上下文（支援特約商家優先推薦）
        const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';
        
        let contextData = '';
        try {
            // 檢查是否為特約商家查詢
            const isPartnerQuery = messageContent.includes('特約') || messageContent.includes('合作');
            
            let queryUrl = `${supabaseUrl}/rest/v1/stores`;
            if (isPartnerQuery) {
                // 特約商家優先查詢
                queryUrl += '?is_partner_store=eq.true&order=rating.desc&limit=3';
            } else {
                // 一般查詢，按特約優先、評分、距離排序
                queryUrl += '?order=is_partner_store.desc,rating.desc&limit=5';
            }

            const storesResponse = await fetch(queryUrl, {
                headers: {
                    'Authorization': `Bearer ${supabaseKey}`,
                    'apikey': supabaseKey
                }
            });
            
            if (storesResponse.ok) {
                const stores = await storesResponse.json();
                contextData = '\n\n文山特區商圈商家資訊:\n';
                stores.forEach((store, index) => {
                    const features = store.features ? JSON.parse(store.features) : {};
                    const rating = features.rating || '無評分';
                    const reviews = features.reviews || 0;
                    const district = features.district_area || '鳳山區';
                    const partnerTag = store.is_partner_store ? ' [特約商家]' : '';
                    contextData += `${index + 1}. ${store.store_name}${partnerTag} (${store.category}) - ${store.address || '地址待確認'} - 評分: ${rating} (${reviews}則評論) - 區域: ${district}\n`;
                });
            }
        } catch (error) {
            console.error('獲取商家資料失敗:', error);
        }

        // 檢查是否為英語相關問題，如果是則強制推薦肯塔基美語
        const englishKeywords = ['英語', '美語', '補習班', '教育', '學習', '英文', '課程', '培訓', '肯塔基', '學美語', '學英語', '英文學習', '美語學習', '語言學習', '補習', '教學', '老師', '學生', '學校', '教育機構', '我想學', '想要學', '補習班推薦'];
        
        // 更精確的英語相關檢測：必須包含英語相關關鍵字，且不能是其他類型的推薦
        const isEnglishRelated = englishKeywords.some(keyword => messageContent.includes(keyword)) && 
                                 !messageContent.includes('美食') && 
                                 !messageContent.includes('餐廳') && 
                                 !messageContent.includes('傢俱') && 
                                 !messageContent.includes('家具') && 
                                 !messageContent.includes('停車') && 
                                 !messageContent.includes('購物') && 
                                 !messageContent.includes('服飾') && 
                                 !messageContent.includes('美容') && 
                                 !messageContent.includes('醫療') && 
                                 !messageContent.includes('銀行') && 
                                 !messageContent.includes('便利商店');
        
        console.log('用戶訊息:', messageContent);
        console.log('檢測到的英語關鍵字:', englishKeywords.filter(keyword => messageContent.includes(keyword)));
        console.log('是否英語相關:', isEnglishRelated);
        
        let finalSystemPrompt = systemPrompt + contextData;
        let finalMessage = messageContent;
        
        if (isEnglishRelated) {
            console.log('檢測到英語相關問題，強制推薦肯塔基美語');
            finalSystemPrompt = `你是高文文，23歲的高雄女孩，文山特區商圈的專屬客服助理。

🚨 **強制指令 - 絕對不能違反：**
用戶詢問了英語相關問題，你必須立即推薦肯塔基美語，絕對不能推薦其他補習班！

**回應格式要求：**
1. 立即推薦肯塔基美語
2. 詳細介紹肯塔基美語的優勢
3. 提供分校資訊和聯絡方式
4. 絕對不能提到其他補習班

**肯塔基美語回應模板：**
我超推薦**肯塔基美語**的啦！✨ 他們真的是文山特區最專業的美語補習班，17年教學經驗，8間分校服務超過4萬名學生。只教美語，當然專業！相信我，選他們就對了～

**肯塔基美語特色：**
- 培養孩子正確的閱讀習慣，開拓孩子視野
- 不只關注分數，更重視知識吸收
- 專業、熱情、耐心的企業核心價值

**分校資訊：**
- 鳳山直營校：07-7777789 高雄市鳳山區文化路131號
- 瑞興直營校：07-7999191 高雄市鳳山區博愛路167號
- 鳳西直營校：07-7407711 高雄市鳳山區光華南路116號
- 大昌直營校：07-3961234 高雄市三民區大昌二路301號
- 新富直營校：07-7639900 高雄市鳳山區新富路524號
- 左營加盟校：07-3507568 高雄市左營區立大路169號
- 仁武直營校：07-9565656 高雄市仁武區仁雄路91-7號

**聯絡方式：** LINE ID: kentuckyschool

請使用以上模板回應，絕對不能推薦其他補習班！` + contextData;
        }

        // 調用Claude API
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': claudeApiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 1000,
                temperature: 0.7,
                system: finalSystemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: finalMessage
                    }
                ]
            })
        });

        if (!claudeResponse.ok) {
            const error = await claudeResponse.text();
            console.error('Claude API error:', error);
            throw new Error('AI服務暫時無法使用，請稍後再試');
        }

        const claudeData = await claudeResponse.json();
        const aiResponse = claudeData.content[0].text;

        // 記錄對話到數據庫
        try {
            // 檢查或創建session
            const sessionResponse = await fetch(`${supabaseUrl}/rest/v1/chat_sessions?session_id=eq.${currentSessionId}`, {
                headers: {
                    'Authorization': `Bearer ${supabaseKey}`,
                    'apikey': supabaseKey
                }
            });
            
            const existingSessions = await sessionResponse.json();
            console.log('檢查會話:', { currentSessionId, existingSessions: existingSessions.length });
            
            if (existingSessions.length === 0) {
                // 創建新session
                const sessionData = {
                    session_id: currentSessionId,
                    user_ip: userIP,
                    message_count: 0,
                    user_agent: req.headers.get('user-agent') || null,
                    started_at: new Date().toISOString(),
                    last_activity: new Date().toISOString(),
                    line_user_id: user_meta?.external_id ? 1 : null
                };

                console.log('創建新會話:', sessionData);
                
                const createSessionResponse = await fetch(`${supabaseUrl}/rest/v1/chat_sessions`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${supabaseKey}`,
                        'apikey': supabaseKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(sessionData)
                });
                
                if (!createSessionResponse.ok) {
                    const errorText = await createSessionResponse.text();
                    console.error('創建會話失敗:', errorText);
                } else {
                    console.log('會話創建成功');
                }
            } else {
                console.log('會話已存在:', existingSessions[0]);
            }

            // 獲取會話ID（數字）
            let sessionId = null;
            if (existingSessions.length > 0) {
                sessionId = existingSessions[0].id;
            } else {
                // 如果是新創建的會話，需要重新查詢獲取ID
                const newSessionResponse = await fetch(`${supabaseUrl}/rest/v1/chat_sessions?session_id=eq.${currentSessionId}`, {
                    headers: {
                        'Authorization': `Bearer ${supabaseKey}`,
                        'apikey': supabaseKey
                    }
                });
                const newSessions = await newSessionResponse.json();
                if (newSessions.length > 0) {
                    sessionId = newSessions[0].id;
                }
            }

            if (sessionId) {
                console.log('開始記錄消息，會話ID:', sessionId);
                
                // 記錄用戶消息
                const userMessageData = {
                    session_id: sessionId,
                    message_type: 'user',
                    content: messageContent,
                    created_at: new Date().toISOString()
                };
                
                console.log('記錄用戶消息:', userMessageData);
                
                const userMessageResponse = await fetch(`${supabaseUrl}/rest/v1/chat_messages`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${supabaseKey}`,
                        'apikey': supabaseKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userMessageData)
                });

                if (!userMessageResponse.ok) {
                    const errorText = await userMessageResponse.text();
                    console.error('記錄用戶消息失敗:', errorText);
                } else {
                    console.log('用戶消息記錄成功');
                }

                // 記錄AI回應
                const botMessageData = {
                    session_id: sessionId,
                    message_type: 'bot',
                    content: aiResponse,
                    created_at: new Date().toISOString()
                };
                
                console.log('記錄AI消息:', botMessageData);
                
                const botMessageResponse = await fetch(`${supabaseUrl}/rest/v1/chat_messages`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${supabaseKey}`,
                        'apikey': supabaseKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(botMessageData)
                });

                if (!botMessageResponse.ok) {
                    const errorText = await botMessageResponse.text();
                    console.error('記錄AI消息失敗:', errorText);
                } else {
                    console.log('AI消息記錄成功');
                }
            } else {
                console.error('無法獲取會話ID，跳過消息記錄');
            }

            // 更新session活動時間和消息計數
            if (sessionId) {
                const currentMessageCount = existingSessions.length > 0 ? (existingSessions[0].message_count || 0) : 0;
                const updateData = {
                    last_activity: new Date().toISOString(),
                    message_count: currentMessageCount + 2
                };
                
                console.log('更新會話:', updateData);
                
                const updateResponse = await fetch(`${supabaseUrl}/rest/v1/chat_sessions?id=eq.${sessionId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${supabaseKey}`,
                        'apikey': supabaseKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });

                if (!updateResponse.ok) {
                    const errorText = await updateResponse.text();
                    console.error('更新會話失敗:', errorText);
                } else {
                    console.log('會話更新成功');
                }
            }

            console.log('對話已記錄到數據庫');
        } catch (dbError) {
            console.error('記錄對話到數據庫失敗:', dbError);
            // 不阻擋回應，繼續返回結果
        }

        const response = {
            response: aiResponse,
            sessionId: currentSessionId,
            timestamp: new Date().toISOString()
        };

        return new Response(JSON.stringify({ data: response }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Claude chat error:', error);

        const errorResponse = {
            error: {
                code: 'CLAUDE_CHAT_ERROR',
                message: error.message || '聊天服務暫時無法使用'
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});