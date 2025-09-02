/**
 * 从HTTP请求头中获取真实的客户端IP地址
 * 支持多种代理和负载均衡器的IP转发头
 */
function getRealClientIP(request: Request): string {
    // 按优先级检查各种IP头
    const headers = request.headers;
    
    // 1. X-Forwarded-For (最常用，支持代理链)
    const xForwardedFor = headers.get('x-forwarded-for');
    if (xForwardedFor) {
        // X-Forwarded-For 可能包含多个IP，第一个是原始客户端IP
        const ips = xForwardedFor.split(',').map(ip => ip.trim());
        const clientIP = ips[0];
        if (isValidIP(clientIP)) {
            return clientIP;
        }
    }
    
    // 2. X-Real-IP (Nginx代理)
    const xRealIP = headers.get('x-real-ip');
    if (xRealIP && isValidIP(xRealIP)) {
        return xRealIP;
    }
    
    // 3. CF-Connecting-IP (Cloudflare)
    const cfConnectingIP = headers.get('cf-connecting-ip');
    if (cfConnectingIP && isValidIP(cfConnectingIP)) {
        return cfConnectingIP;
    }
    
    // 4. X-Client-IP
    const xClientIP = headers.get('x-client-ip');
    if (xClientIP && isValidIP(xClientIP)) {
        return xClientIP;
    }
    
    // 5. X-Forwarded
    const xForwarded = headers.get('x-forwarded');
    if (xForwarded) {
        const match = xForwarded.match(/for=([^;,\s]+)/);
        if (match && match[1]) {
            const ip = match[1].replace(/"/g, '');
            if (isValidIP(ip)) {
                return ip;
            }
        }
    }
    
    // 6. Forwarded (RFC 7239标准)
    const forwarded = headers.get('forwarded');
    if (forwarded) {
        const match = forwarded.match(/for=([^;,\s]+)/);
        if (match && match[1]) {
            const ip = match[1].replace(/"/g, '');
            if (isValidIP(ip)) {
                return ip;
            }
        }
    }
    
    // 回退：使用默认值，但标记为未知来源
    console.warn('无法从请求头获取真实IP地址，使用默认值');
    return 'unknown-client';
}

/**
 * 验证IP地址格式是否有效
 */
function isValidIP(ip: string): boolean {
    if (!ip || ip === '0.0.0.0' || ip === '127.0.0.1' || ip === 'localhost') {
        return false;
    }
    
    // IPv4 格式验证
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipv4Regex.test(ip)) {
        return true;
    }
    
    // IPv6 格式验证（简化版）
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
    if (ipv6Regex.test(ip)) {
        return true;
    }
    
    return false;
}

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
        const { message, sessionId, line_uid } = await req.json();
        
        if (!message) {
            throw new Error('Message is required');
        }

        console.log('收到聊天请求:', { message: message.substring(0, 50), sessionId, line_uid });

        // 获取真实的客户端IP地址
        const userIp = getRealClientIP(req);
        
        console.log('获取到的客户端IP:', userIp); // 调试日志

        const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!claudeApiKey) {
            throw new Error('Claude API key not configured');
        }

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // 生成或使用現有的session ID
        let currentSessionId = sessionId;
        if (!currentSessionId) {
            currentSessionId = crypto.randomUUID();
        }

        const dbHeaders = {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        };

        // 用戶識別 (使用IP作為主要識別，session作為輔助)
        const userIdentifier = userIp || 'unknown';
        const today = new Date().toISOString().split('T')[0];

        // 🚦 問答踩煞車機制 - 檢查每日對話次數
        const dailyConvResponse = await fetch(`${supabaseUrl}/rest/v1/user_daily_conversations?user_identifier=eq.${userIdentifier}&conversation_date=eq.${today}`, {
            headers: dbHeaders
        });

        let dailyRecord = null;
        if (dailyConvResponse.ok) {
            const records = await dailyConvResponse.json();
            dailyRecord = records.length > 0 ? records[0] : null;
        }

        // 如果用戶今天已經被限制，直接返回休息訊息
        if (dailyRecord && dailyRecord.is_blocked) {
            const restResponse = {
                response: "今天與您聊的很開心喔，但是文文今天太累了，想休息一下，明天再聊喔...",
                sessionId: currentSessionId,
                timestamp: new Date().toISOString(),
                isBlocked: true
            };
            return new Response(JSON.stringify({ data: restResponse }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 檢查今天的對話次數
        const currentCount = dailyRecord ? dailyRecord.conversation_count : 0;
        
        if (currentCount >= 10) {
            // 達到上限，標記為被限制並返回休息訊息
            await fetch(`${supabaseUrl}/rest/v1/user_daily_conversations?user_identifier=eq.${userIdentifier}&conversation_date=eq.${today}`, {
                method: 'PATCH',
                headers: dbHeaders,
                body: JSON.stringify({
                    is_blocked: true,
                    updated_at: new Date().toISOString()
                })
            });

            const restResponse = {
                response: "今天與您聊的很開心喔，但是文文今天太累了，想休息一下，明天再聊喔...",
                sessionId: currentSessionId,
                timestamp: new Date().toISOString(),
                isBlocked: true
            };
            return new Response(JSON.stringify({ data: restResponse }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 檢查互動攔截規則
        const filtersResponse = await fetch(`${supabaseUrl}/rest/v1/interaction_filters?is_enabled=eq.true`, {
            headers: dbHeaders
        });
        
        if (filtersResponse.ok) {
            const filters = await filtersResponse.json();
            
            for (const filter of filters) {
                if (filter.blacklist_keywords) {
                    const messageText = message.toLowerCase();
                    const hasBlacklistedWord = filter.blacklist_keywords.some(keyword => 
                        messageText.includes(keyword.toLowerCase())
                    );
                    
                    if (hasBlacklistedWord) {
                        // 記錄被攔截的問題
                        await fetch(`${supabaseUrl}/rest/v1/blocked_questions`, {
                            method: 'POST',
                            headers: dbHeaders,
                            body: JSON.stringify({
                                session_id: currentSessionId,
                                original_question: message,
                                matched_filter_id: filter.id,
                                rejection_response: filter.rejection_template,
                                blocked_at: new Date().toISOString()
                            })
                        });

                        // 返回拒絕回應
                        const response = {
                            response: filter.rejection_template || '抱歉，我無法回答這個問題。',
                            sessionId: currentSessionId,
                            timestamp: new Date().toISOString()
                        };

                        return new Response(JSON.stringify({ data: response }), {
                            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                        });
                    }
                }
            }
        }

        // 🤖 智能追問機制 - 檢查是否有進行中的追問對話
        const clarificationResponse = await fetch(`${supabaseUrl}/rest/v1/user_clarification_sessions?session_id=eq.${currentSessionId}&is_completed=eq.false&order=created_at.desc&limit=1`, {
            headers: dbHeaders
        });

        let clarificationSession = null;
        if (clarificationResponse.ok) {
            const sessions = await clarificationResponse.json();
            clarificationSession = sessions.length > 0 ? sessions[0] : null;
        }

        // 獲取AI配置和人格配置
        const [aiConfigResponse, personalityResponse] = await Promise.all([
            fetch(`${supabaseUrl}/rest/v1/ai_configs?is_active=eq.true&limit=1`, { headers: dbHeaders }),
            fetch(`${supabaseUrl}/rest/v1/personality_configs?is_active=eq.true&limit=1`, { headers: dbHeaders })
        ]);
        
        let systemPrompt = '你是文山特區的客服助理高文文，請友善地協助用戶解答關於商圈的問題。';
        let temperature = 0.7;
        let personaInfo = '';
        
        // 處理AI配置
        if (aiConfigResponse.ok) {
            const aiConfigs = await aiConfigResponse.json();
            if (aiConfigs.length > 0) {
                systemPrompt = aiConfigs[0].system_prompt;
                temperature = aiConfigs[0].temperature || 0.7;
            }
        }

        // 處理人格配置
        if (personalityResponse.ok) {
            const personalities = await personalityResponse.json();
            if (personalities.length > 0) {
                const persona = personalities[0];
                personaInfo = `\n\n你的人格設定：\n- 姓名：${persona.persona_name}\n- 年齡：${persona.persona_age}歲\n- 地點：${persona.persona_location}\n- 性格特徵：${(persona.personality_traits || []).join('、')}\n- 正式程度：${persona.formality_level}/5\n- 親切程度：${persona.friendliness_level}/5\n- 表情符號使用頻率：${persona.emoji_frequency}/5\n- 回應詳細程度：${persona.response_detail_level}/5`;
            }
        }

        // 智能追問邏輯
        const enhancedSystemPrompt = systemPrompt + personaInfo + `

重要指令：
1. 問答踩煞車：如果用戶今天已經對話接近10次，你應該表現得稍微疲憊但仍然友善。
2. 智能追問機制：當用戶的問題過於籠統、含糊不清或缺乏關鍵資訊時，你應該主動詢問更具體的需求。例如：
   - 如果用戶問「有什麼好吃的？」→ 詢問他們偏好哪種類型的料理
   - 如果用戶問「怎麼去？」→ 詢問具體要去哪個商家或區域
   - 如果用戶問「有什麼活動？」→ 詢問他們關心哪種類型的活動
3. 最多追問3次，如果3次後仍不清楚就禮貌放棄：「抱歉，我可能沒理解您的需求，您可以換個方式問問看喔～」
4. 當問題變得明確後，立即提供詳細和有用的回答。`;

        // 獲取相關資料作為context
        const [storesResponse, faqsResponse, activitiesResponse] = await Promise.all([
            fetch(`${supabaseUrl}/rest/v1/stores`, { headers: dbHeaders }),
            fetch(`${supabaseUrl}/rest/v1/faqs?is_active=eq.true`, { headers: dbHeaders }),
            fetch(`${supabaseUrl}/rest/v1/activities?status=eq.active`, { headers: dbHeaders })
        ]);

        let contextData = '';
        
        if (storesResponse.ok) {
            const stores = await storesResponse.json();
            contextData += '\n\n商家資訊:\n' + stores.map(store => 
                `${store.store_name}: ${store.category || ''} - ${store.address || ''} ${store.business_hours || ''}`
            ).join('\n');
        }

        if (faqsResponse.ok) {
            const faqs = await faqsResponse.json();
            contextData += '\n\n常見問題:\n' + faqs.map(faq => 
                `問: ${faq.question}\n答: ${faq.answer}`
            ).join('\n\n');
        }

        if (activitiesResponse.ok) {
            const activities = await activitiesResponse.json();
            if (activities.length > 0) {
                contextData += '\n\n活動資訊:\n' + activities.map(activity => 
                    `${activity.title}: ${activity.description || ''}`
                ).join('\n');
            }
        }

        // 準備對話上下文（包括追問記錄）
        let conversationContext = '';
        if (clarificationSession) {
            conversationContext = `\n\n追問上下文：\n原始問題：${clarificationSession.original_question}\n追問次數：${clarificationSession.clarification_count}/3\n`;
            if (clarificationSession.context_data) {
                conversationContext += `之前的對話記錄：${JSON.stringify(clarificationSession.context_data)}\n`;
            }
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
                temperature,
                system: enhancedSystemPrompt + contextData + conversationContext,
                messages: [
                    {
                        role: 'user',
                        content: message
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

        // 判斷是否是追問回應（簡化版判斷）
        const isFollowUpQuestion = aiResponse.includes('？') && (
            aiResponse.includes('您想了解') || 
            aiResponse.includes('您偏好') ||
            aiResponse.includes('您是指') ||
            aiResponse.includes('能告訴我') ||
            aiResponse.includes('更具體')
        );

        // 處理智能追問邏輯
        if (isFollowUpQuestion) {
            if (clarificationSession) {
                // 更新現有追問會話
                const newCount = clarificationSession.clarification_count + 1;
                if (newCount >= 3) {
                    // 達到追問上限，標記完成
                    await fetch(`${supabaseUrl}/rest/v1/user_clarification_sessions?id=eq.${clarificationSession.id}`, {
                        method: 'PATCH',
                        headers: dbHeaders,
                        body: JSON.stringify({
                            is_completed: true,
                            clarification_count: newCount,
                            updated_at: new Date().toISOString()
                        })
                    });
                } else {
                    await fetch(`${supabaseUrl}/rest/v1/user_clarification_sessions?id=eq.${clarificationSession.id}`, {
                        method: 'PATCH',
                        headers: dbHeaders,
                        body: JSON.stringify({
                            clarification_count: newCount,
                            context_data: { ...clarificationSession.context_data, last_question: message, last_response: aiResponse },
                            updated_at: new Date().toISOString()
                        })
                    });
                }
            } else {
                // 創建新的追問會話
                await fetch(`${supabaseUrl}/rest/v1/user_clarification_sessions`, {
                    method: 'POST',
                    headers: dbHeaders,
                    body: JSON.stringify({
                        session_id: currentSessionId,
                        user_identifier: userIdentifier,
                        original_question: message,
                        clarification_count: 1,
                        context_data: { initial_question: message, initial_response: aiResponse }
                    })
                });
            }
        } else if (clarificationSession && !clarificationSession.is_completed) {
            // 問題變明確了，標記追問會話完成
            await fetch(`${supabaseUrl}/rest/v1/user_clarification_sessions?id=eq.${clarificationSession.id}`, {
                method: 'PATCH',
                headers: dbHeaders,
                body: JSON.stringify({
                    is_completed: true,
                    updated_at: new Date().toISOString()
                })
            });
        }

        // 更新每日對話計數
        if (dailyRecord) {
            await fetch(`${supabaseUrl}/rest/v1/user_daily_conversations?id=eq.${dailyRecord.id}`, {
                method: 'PATCH',
                headers: dbHeaders,
                body: JSON.stringify({
                    conversation_count: dailyRecord.conversation_count + 1,
                    last_conversation_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
            });
        } else {
            await fetch(`${supabaseUrl}/rest/v1/user_daily_conversations`, {
                method: 'POST',
                headers: dbHeaders,
                body: JSON.stringify({
                    user_identifier: userIdentifier,
                    conversation_date: today,
                    conversation_count: 1,
                    last_conversation_at: new Date().toISOString()
                })
            });
        }

        // 記錄對話
        try {
            // 處理LINE用戶信息
            let lineUserId = null;
            if (line_uid) {
                // 查找LINE用戶
                const lineUserResponse = await fetch(`${supabaseUrl}/rest/v1/line_users?line_uid=eq.${line_uid}`, {
                    headers: dbHeaders
                });
                
                if (lineUserResponse.ok) {
                    const lineUsers = await lineUserResponse.json();
                    if (lineUsers.length > 0) {
                        lineUserId = lineUsers[0].id;
                        console.log('找到LINE用戶:', lineUsers[0].line_display_name, 'ID:', lineUserId);
                    } else {
                        console.log('未找到LINE用戶:', line_uid);
                    }
                }
            }

            // 檢查或創建session
            const sessionResponse = await fetch(`${supabaseUrl}/rest/v1/chat_sessions?session_id=eq.${currentSessionId}`, {
                headers: dbHeaders
            });
            
            const existingSessions = await sessionResponse.json();
            
            if (existingSessions.length === 0) {
                // 創建新session
                const sessionData = {
                    session_id: currentSessionId,
                    user_ip: userIdentifier,
                    message_count: 0,
                    user_agent: req.headers.get('user-agent') || null
                };

                // 如果有LINE用戶ID，添加到session
                if (lineUserId) {
                    sessionData.line_user_id = lineUserId;
                    console.log('創建session並關聯LINE用戶ID:', lineUserId);
                }

                await fetch(`${supabaseUrl}/rest/v1/chat_sessions`, {
                    method: 'POST',
                    headers: dbHeaders,
                    body: JSON.stringify(sessionData)
                });
                
                console.log('新session已創建:', currentSessionId);
            } else {
                console.log('使用現有session:', currentSessionId);
            }

            // 記錄用戶消息
            await fetch(`${supabaseUrl}/rest/v1/chat_messages`, {
                method: 'POST',
                headers: dbHeaders,
                body: JSON.stringify({
                    session_id: currentSessionId,
                    message_type: 'user',
                    content: message
                })
            });

            // 記錄AI回應
            await fetch(`${supabaseUrl}/rest/v1/chat_messages`, {
                method: 'POST',
                headers: dbHeaders,
                body: JSON.stringify({
                    session_id: currentSessionId,
                    message_type: 'bot',
                    content: aiResponse
                })
            });

            // 更新session活動時間和消息計數
            await fetch(`${supabaseUrl}/rest/v1/chat_sessions?session_id=eq.${currentSessionId}`, {
                method: 'PATCH',
                headers: dbHeaders,
                body: JSON.stringify({
                    last_activity: new Date().toISOString(),
                    message_count: existingSessions.length > 0 ? (existingSessions[0].message_count || 0) + 2 : 2
                })
            });
        } catch (dbError) {
            console.error('Database logging error:', dbError);
            // 不阻擋回應，繼續返回結果
        }

        const response = {
            response: aiResponse,
            sessionId: currentSessionId,
            timestamp: new Date().toISOString(),
            conversationCount: (dailyRecord ? dailyRecord.conversation_count : 0) + 1
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