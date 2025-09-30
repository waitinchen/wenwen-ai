Deno.serve(async (req)=>{
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400'
  };
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }
  try {
    const { action, table, data, id, filters, token } = await req.json();
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    if (!serviceRoleKey || !supabaseUrl) {
      throw new Error('Supabase配置缺失');
    }
    // 简化的身份验证逻辑：先检查token是否存在，然后验证其有效性
    let adminData = null;
    if (token) {
      adminData = await verifyAdminAuth(token, supabaseUrl, serviceRoleKey);
    }
    // 对于没有token或token无效的请求，返回错误信息
    if (!adminData) {
      console.log('Authentication failed for token:', token ? token.substring(0, 10) + '...' : 'null');
      return new Response(JSON.stringify({
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: '请先登入管理后台'
        }
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log('Authenticated admin:', adminData.id, adminData.email, adminData.role);
    let result;
    switch(action){
      case 'list':
        result = await handleList(table, filters, supabaseUrl, serviceRoleKey);
        break;
      case 'create':
        result = await handleCreate(table, data, supabaseUrl, serviceRoleKey);
        break;
      case 'update':
        result = await handleUpdate(table, id, data, supabaseUrl, serviceRoleKey);
        break;
      case 'delete':
        result = await handleDelete(table, id, supabaseUrl, serviceRoleKey);
        break;
      case 'bulk_update':
        result = await handleBulkUpdate(table, data, supabaseUrl, serviceRoleKey);
        break;
      case 'get_claude_keys':
        result = await getClaudeApiKeys(supabaseUrl, serviceRoleKey);
        break;
      case 'add_claude_key':
        result = await addClaudeApiKey(data, supabaseUrl, serviceRoleKey);
        break;
      case 'test_claude_key':
        result = await testClaudeApiKey(id, supabaseUrl, serviceRoleKey);
        break;
      case 'activate_claude_key':
        result = await activateClaudeApiKey(id, supabaseUrl, serviceRoleKey);
        break;
      case 'delete_claude_key':
        result = await deleteClaudeApiKey(id, supabaseUrl, serviceRoleKey);
        break;
      default:
        throw new Error('不支持的操作: ' + action);
    }
    return new Response(JSON.stringify({
      data: result
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('管理后台API错误:', error.message, error.stack);
    const errorResponse = {
      error: {
        code: 'ADMIN_MANAGEMENT_ERROR',
        message: error.message || '系统内部错误'
      }
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});

// 简化的管理员身份验证
async function verifyAdminAuth(token, supabaseUrl, serviceRoleKey) {
  if (!token || token.length < 10) {
    console.log('Invalid token format');
    return null;
  }
  try {
    // 查找有效的管理员会话
    const sessionResponse = await fetch(`${supabaseUrl}/rest/v1/admin_sessions?session_token=eq.${encodeURIComponent(token)}&expires_at=gt.${new Date().toISOString()}&select=admin_id,expires_at&limit=1`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      }
    });
    if (!sessionResponse.ok) {
      console.log('Session query failed:', sessionResponse.status);
      return null;
    }
    const sessions = await sessionResponse.json();
    if (!sessions || sessions.length === 0) {
      console.log('No valid session found for token');
      return null;
    }
    const session = sessions[0];
    console.log('Found session for admin_id:', session.admin_id);
    // 获取管理员信息
    const adminResponse = await fetch(`${supabaseUrl}/rest/v1/admins?id=eq.${session.admin_id}&is_active=eq.true&select=id,email,full_name,role&limit=1`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      }
    });
    if (!adminResponse.ok) {
      console.log('Admin query failed:', adminResponse.status);
      return null;
    }
    const admins = await adminResponse.json();
    if (!admins || admins.length === 0) {
      console.log('No active admin found for id:', session.admin_id);
      return null;
    }
    const admin = admins[0];
    console.log('Authentication successful for admin:', admin.email);
    return admin;
  } catch (error) {
    console.error('Authentication error:', error.message);
    return null;
  }
}

// 列表查询
async function handleList(table, filters, supabaseUrl, serviceRoleKey) {
  let url = `${supabaseUrl}/rest/v1/${table}?select=*`;
  if (filters) {
    if (filters.orderBy) {
      url += `&order=${filters.orderBy}.${filters.orderDirection || 'asc'}`;
    }
    if (filters.limit) {
      url += `&limit=${filters.limit}`;
    }
    if (filters.where) {
      Object.keys(filters.where).forEach((key)=>{
        url += `&${key}=eq.${encodeURIComponent(filters.where[key])}`;
      });
    }
  }
  console.log('Fetching data from:', url);
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey
    }
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Query ${table} failed:`, response.status, errorText);
    throw new Error(`查询${table}失败: ${response.status}`);
  }
  return await response.json();
}

// 创建记录
async function handleCreate(table, data, supabaseUrl, serviceRoleKey) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Create ${table} failed:`, response.status, errorText);
    throw new Error(`创建${table}记录失败: ${response.status}`);
  }
  return await response.json();
}

// 更新记录
async function handleUpdate(table, id, data, supabaseUrl, serviceRoleKey) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      ...data,
      updated_at: new Date().toISOString()
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Update ${table} failed:`, response.status, errorText);
    throw new Error(`更新${table}记录失败: ${response.status}`);
  }
  return await response.json();
}

// 删除记录
async function handleDelete(table, id, supabaseUrl, serviceRoleKey) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey
    }
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Delete ${table} failed:`, response.status, errorText);
    throw new Error(`删除${table}记录失败: ${response.status}`);
  }
  return {
    success: true
  };
}

// 批量更新
async function handleBulkUpdate(table, items, supabaseUrl, serviceRoleKey) {
  const promises = items.map(async (item)=>{
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${item.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        ...item,
        updated_at: new Date().toISOString()
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bulk update failed for item ${item.id}: ${errorText}`);
    }
    return await response.json();
  });
  const results = await Promise.all(promises);
  return results.flat();
}

// 获取Claude API密钥列表
async function getClaudeApiKeys(supabaseUrl, serviceRoleKey) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/api_keys?key_type=eq.claude&order=created_at.desc`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Get Claude API keys failed:', response.status, errorText);
      throw new Error('获取Claude API密钥失败');
    }
    const keys = await response.json();
    // 返回密钥列表，但不包含实际的密钥内容（出于安全考虑）
    return keys.map((key)=>({
        id: key.id,
        key_name: key.key_name,
        key_type: key.key_type,
        is_active: key.is_active,
        is_verified: key.is_verified,
        created_at: key.created_at,
        updated_at: key.updated_at,
        last_used_at: key.last_used_at,
        validation_result: key.validation_result,
        masked_key: key.encrypted_key ? `${key.encrypted_key.substring(0, 8)}****${key.encrypted_key.slice(-4)}` : null
      }));
  } catch (error) {
    console.error('Get Claude API keys error:', error);
    throw error;
  }
}

// 添加Claude API密钥
async function addClaudeApiKey(data, supabaseUrl, serviceRoleKey) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/api_keys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        key_name: data.key_name,
        key_type: 'claude',
        encrypted_key: data.encrypted_key,
        is_active: false,
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Add Claude API key failed:', response.status, errorText);
      throw new Error('添加API密钥失败');
    }
    return await response.json();
  } catch (error) {
    console.error('Add Claude API key error:', error);
    throw error;
  }
}

// 测试Claude API密钥
async function testClaudeApiKey(keyId, supabaseUrl, serviceRoleKey) {
  try {
    // 获取API密钥
    const keyResponse = await fetch(`${supabaseUrl}/rest/v1/api_keys?id=eq.${keyId}&limit=1`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      }
    });
    if (!keyResponse.ok) {
      throw new Error('无法获取API密钥');
    }
    const keys = await keyResponse.json();
    if (keys.length === 0) {
      throw new Error('API密钥不存在');
    }
    const apiKey = keys[0].encrypted_key;
    let isSuccess = false;
    let response = null;
    let errorMessage = null;
    try {
      // 测试Claude API
      const testResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 50,
          messages: [
            {
              role: 'user',
              content: '请用繁体中文回答：你好吗？'
            }
          ]
        })
      });
      if (testResponse.ok) {
        const result = await testResponse.json();
        response = result.content[0]?.text || '测试成功';
        isSuccess = true;
      } else {
        const error = await testResponse.text();
        errorMessage = `API调用失败: ${testResponse.status} ${error.substring(0, 200)}`;
      }
    } catch (error) {
      errorMessage = `连接失败: ${error.message}`;
    }
    // 更新API密钥测试结果
    await fetch(`${supabaseUrl}/rest/v1/api_keys?id=eq.${keyId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        is_verified: isSuccess,
        last_used_at: new Date().toISOString(),
        validation_result: isSuccess ? response : errorMessage,
        updated_at: new Date().toISOString()
      })
    });
    return {
      success: isSuccess,
      response,
      errorMessage,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Claude API key test error:', error);
    return {
      success: false,
      errorMessage: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// 启用Claude API密钥
async function activateClaudeApiKey(keyId, supabaseUrl, serviceRoleKey) {
  try {
    // 先将所有其他密钥设为非启用状态
    await fetch(`${supabaseUrl}/rest/v1/api_keys?key_type=eq.claude`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        is_active: false,
        updated_at: new Date().toISOString()
      })
    });
    // 启用指定的API密钥
    const response = await fetch(`${supabaseUrl}/rest/v1/api_keys?id=eq.${keyId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        is_active: true,
        updated_at: new Date().toISOString()
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('启用API密钥失败: ' + errorText);
    }
    return await response.json();
  } catch (error) {
    console.error('Activate Claude API key error:', error);
    throw error;
  }
}

// 删除Claude API密钥
async function deleteClaudeApiKey(keyId, supabaseUrl, serviceRoleKey) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/api_keys?id=eq.${keyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('删除API密钥失败: ' + errorText);
    }
    return {
      success: true
    };
  } catch (error) {
    console.error('Delete Claude API key error:', error);
    throw error;
  }
}