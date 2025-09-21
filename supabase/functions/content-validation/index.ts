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
        const { action, content, contentType, sourceTable, sourceId, batchCheck } = await req.json();
        
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            console.error('Supabase service role credentials are missing');
            return new Response(JSON.stringify({
                error: {
                    code: 'CONFIGURATION_ERROR',
                    message: 'Supabase service role credentials are not configured'
                }
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const headers = {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        };

        let result;

        switch (action) {
            case 'check-content':
                result = await checkContentReasonableness(content, contentType, sourceTable, sourceId, headers, supabaseUrl);
                break;
            case 'batch-check':
                result = await batchCheckContent(batchCheck, headers, supabaseUrl);
                break;
            case 'get-warnings':
                result = await getContentWarnings(sourceTable, sourceId, headers, supabaseUrl);
                break;
            case 'resolve-warning':
                result = await resolveWarning(sourceId, headers, supabaseUrl);
                break;
            case 'get-all-warnings':
                result = await getAllWarnings(headers, supabaseUrl);
                break;
            default:
                throw new Error(`未知操作: ${action}`);
        }

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Content validation error:', error);

        const errorResponse = {
            error: {
                code: 'CONTENT_VALIDATION_ERROR',
                message: error.message || 'Content validation failed'
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// 內容合理性檢查主函數
async function checkContentReasonableness(content, contentType, sourceTable, sourceId, headers, supabaseUrl) {
    const warnings = [];
    
    // 1. 地理位置邏輯檢查
    const geoWarnings = checkGeographyLogic(content);
    warnings.push(...geoWarnings);
    
    // 2. 時間邏輯檢查
    const timeWarnings = checkTimeLogic(content);
    warnings.push(...timeWarnings);
    
    // 3. 事實性檢查
    const factWarnings = checkFactualAccuracy(content);
    warnings.push(...factWarnings);
    
    // 4. 邏輯一致性檢查
    const logicWarnings = checkLogicalConsistency(content);
    warnings.push(...logicWarnings);
    
    // 5. 如果有警告，保存到數據庫
    if (warnings.length > 0 && sourceTable && sourceId) {
        await saveWarningsToDatabase(warnings, sourceTable, sourceId, headers, supabaseUrl);
    }
    
    return {
        hasWarnings: warnings.length > 0,
        warningsCount: warnings.length,
        warnings: warnings
    };
}

// 地理位置邏輯檢查
function checkGeographyLogic(content) {
    const warnings = [];
    
    // 文山特區是在高雄市，不在台北市
    const geography_patterns = [
        {
            pattern: /文山.*?台北/gi,
            warning: '文山特區位於高雄市，不在台北市',
            level: 'high',
            fix: '請修正為「高雄市文山特區」'
        },
        {
            pattern: /(台北|臺北).*?文湖線/gi,
            warning: '文湖線是台北捷運系統，文山特區在高雄',
            level: 'high', 
            fix: '文山特區應該使用高雄捷運系統資訊'
        },
        {
            pattern: /文山.*?捷運.*?文湖線/gi,
            warning: '文湖線是台北捷運，與高雄文山特區不符',
            level: 'high',
            fix: '文山特區應使用高雄捷運黃線等相關資訊'
        },
        {
            pattern: /高雄.*?文湖線/gi,
            warning: '文湖線屬於台北捷運系統，不在高雄',
            level: 'high',
            fix: '高雄應使用高雄捷運系統（紅線、橘線、輕軌等）'
        }
    ];
    
    geography_patterns.forEach(({ pattern, warning, level, fix }) => {
        if (pattern.test(content)) {
            warnings.push({
                type: 'geography',
                level: level,
                message: warning,
                suggestedFix: fix,
                detectedText: content.match(pattern)?.[0] || ''
            });
        }
    });
    
    return warnings;
}

// 時間邏輯檢查
function checkTimeLogic(content) {
    const warnings = [];
    
    // 營業時間合理性檢查
    const timePatterns = [
        {
            pattern: /(\d{1,2})[:：](\d{2})\s*[~～-]\s*(\d{1,2})[:：](\d{2})/g,
            check: (match) => {
                const [, startHour, startMin, endHour, endMin] = match;
                const startTime = parseInt(startHour) * 60 + parseInt(startMin);
                const endTime = parseInt(endHour) * 60 + parseInt(endMin);
                
                // 檢查不合理的營業時間
                if (startTime >= endTime && endTime > 0) {
                    return '營業時間結束時間早於開始時間';
                }
                if (parseInt(startHour) > 24 || parseInt(endHour) > 24) {
                    return '時間格式錯誤，小時不能超過24';
                }
                if (parseInt(startMin) >= 60 || parseInt(endMin) >= 60) {
                    return '時間格式錯誤，分鐘不能超過60';
                }
                return null;
            }
        }
    ];
    
    timePatterns.forEach(({ pattern, check }) => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            const error = check(match);
            if (error) {
                warnings.push({
                    type: 'time',
                    level: 'medium',
                    message: error,
                    suggestedFix: '請檢查並修正營業時間格式',
                    detectedText: match[0]
                });
            }
        }
    });
    
    return warnings;
}

// 事實性檢查
function checkFactualAccuracy(content) {
    const warnings = [];
    
    // 已知事實資料庫
    const factChecks = [
        {
            pattern: /文山特區.*?台中/gi,
            warning: '文山特區位於高雄市，不在台中市',
            level: 'high',
            fix: '請修正為高雄市文山特區'
        },
        {
            pattern: /文山特區.*?台南/gi,
            warning: '文山特區位於高雄市，不在台南市',
            level: 'high',
            fix: '請修正為高雄市文山特區'
        }
    ];
    
    factChecks.forEach(({ pattern, warning, level, fix }) => {
        if (pattern.test(content)) {
            warnings.push({
                type: 'fact',
                level: level,
                message: warning,
                suggestedFix: fix,
                detectedText: content.match(pattern)?.[0] || ''
            });
        }
    });
    
    return warnings;
}

// 邏輯一致性檢查
function checkLogicalConsistency(content) {
    const warnings = [];
    
    // 內容長度檢查
    if (content.length < 10) {
        warnings.push({
            type: 'logic',
            level: 'low',
            message: '內容過短，可能缺乏必要資訊',
            suggestedFix: '建議補充更詳細的說明',
            detectedText: ''
        });
    }
    
    // 重複詞語檢查
    const words = content.split(/\s+/);
    const wordCount = {};
    words.forEach(word => {
        if (word.length > 1) {
            wordCount[word] = (wordCount[word] || 0) + 1;
        }
    });
    
    Object.entries(wordCount).forEach(([word, count]) => {
        if (count > 5 && word.length > 2) {
            warnings.push({
                type: 'logic',
                level: 'low',
                message: `詞語「${word}」出現次數過多（${count}次）`,
                suggestedFix: '建議使用更多樣化的詞彙',
                detectedText: word
            });
        }
    });
    
    return warnings;
}

// 批量檢查內容
async function batchCheckContent(batchData, headers, supabaseUrl) {
    const results = [];
    
    for (const item of batchData) {
        const result = await checkContentReasonableness(
            item.content, 
            item.contentType, 
            item.sourceTable, 
            item.sourceId, 
            headers, 
            supabaseUrl
        );
        
        results.push({
            sourceTable: item.sourceTable,
            sourceId: item.sourceId,
            ...result
        });
    }
    
    return {
        totalChecked: batchData.length,
        totalWarnings: results.reduce((sum, item) => sum + item.warningsCount, 0),
        results: results
    };
}

// 保存警告到資料庫
async function saveWarningsToDatabase(warnings, sourceTable, sourceId, headers, supabaseUrl) {
    for (const warning of warnings) {
        const warningData = {
            source_table: sourceTable,
            source_id: sourceId,
            warning_type: warning.type,
            warning_level: warning.level,
            warning_message: warning.message,
            suggested_fix: warning.suggestedFix
        };
        
        try {
            await fetch(`${supabaseUrl}/rest/v1/content_warnings`, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Prefer': 'resolution=ignore-duplicates'
                },
                body: JSON.stringify(warningData)
            });
        } catch (error) {
            console.error('Failed to save warning:', error);
        }
    }
}

// 獲取內容警告
async function getContentWarnings(sourceTable, sourceId, headers, supabaseUrl) {
    let url = `${supabaseUrl}/rest/v1/content_warnings?is_resolved=eq.false&order=created_at.desc`;
    
    if (sourceTable) {
        url += `&source_table=eq.${sourceTable}`;
    }
    if (sourceId) {
        url += `&source_id=eq.${sourceId}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
        throw new Error('Failed to fetch content warnings');
    }
    
    return await response.json();
}

// 解決警告
async function resolveWarning(warningId, headers, supabaseUrl) {
    const response = await fetch(`${supabaseUrl}/rest/v1/content_warnings?id=eq.${warningId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
            is_resolved: true,
            resolved_at: new Date().toISOString()
        })
    });
    
    if (!response.ok) {
        throw new Error('Failed to resolve warning');
    }
    
    return { success: true };
}

// 獲取所有警告
async function getAllWarnings(headers, supabaseUrl) {
    const response = await fetch(`${supabaseUrl}/rest/v1/content_warnings?order=created_at.desc&limit=100`, {
        headers
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch all warnings');
    }
    
    const warnings = await response.json();
    
    // 統計資料
    const stats = {
        total: warnings.length,
        unresolved: warnings.filter(w => !w.is_resolved).length,
        byType: {},
        byLevel: {}
    };
    
    warnings.forEach(warning => {
        stats.byType[warning.warning_type] = (stats.byType[warning.warning_type] || 0) + 1;
        stats.byLevel[warning.warning_level] = (stats.byLevel[warning.warning_level] || 0) + 1;
    });
    
    return {
        warnings,
        stats
    };
}
