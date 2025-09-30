/**
 * 店家審核管理後台 - 取代黑名單管理
 * 實現：審核狀態管理 + 贊助等級管理 + 證據驗證管理
 */

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase 配置
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// 審核狀態類型
type ApprovalStatus = 'approved' | 'pending' | 'suspended' | 'archived';

// 贊助等級類型
type SponsorshipTier = 0 | 1 | 2; // 0:一般, 1:特約, 2:主推/贊助

// 證據等級類型
type EvidenceLevel = 'verified' | 'unverified' | 'pending_verification' | 'failed';

// 店家介面
interface Store {
  id: string;
  store_name: string;
  category: string;
  address: string;
  phone: string;
  business_hours: string;
  approval: ApprovalStatus;
  sponsorship_tier: SponsorshipTier;
  store_code: string;
  evidence_level: EvidenceLevel;
  is_partner_store: boolean;
  rating: number;
  approved_at: string;
  approved_by: string;
  audit_notes: string;
  evidence_count: number;
  verified_evidence_count: number;
}

// 審核統計介面
interface ApprovalStats {
  totalStores: number;
  approvedStores: number;
  pendingStores: number;
  suspendedStores: number;
  archivedStores: number;
  tier0Stores: number;
  tier1Stores: number;
  tier2Stores: number;
  verifiedStores: number;
  unverifiedStores: number;
}

const StoreApprovalAdminDashboard: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [stats, setStats] = useState<ApprovalStats | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterApproval, setFilterApproval] = useState<ApprovalStatus | 'all'>('all');
  const [filterTier, setFilterTier] = useState<SponsorshipTier | 'all'>('all');
  const [filterEvidence, setFilterEvidence] = useState<EvidenceLevel | 'all'>('all');

  // 載入店家資料
  const loadStores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('store_management_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setStores(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入失敗');
    } finally {
      setLoading(false);
    }
  };

  // 載入統計資料
  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('approval, sponsorship_tier, evidence_level');

      if (error) throw error;

      const stats: ApprovalStats = {
        totalStores: data.length,
        approvedStores: data.filter(s => s.approval === 'approved').length,
        pendingStores: data.filter(s => s.approval === 'pending').length,
        suspendedStores: data.filter(s => s.approval === 'suspended').length,
        archivedStores: data.filter(s => s.approval === 'archived').length,
        tier0Stores: data.filter(s => s.sponsorship_tier === 0).length,
        tier1Stores: data.filter(s => s.sponsorship_tier === 1).length,
        tier2Stores: data.filter(s => s.sponsorship_tier === 2).length,
        verifiedStores: data.filter(s => s.evidence_level === 'verified').length,
        unverifiedStores: data.filter(s => s.evidence_level !== 'verified').length
      };

      setStats(stats);
    } catch (err) {
      console.error('載入統計失敗:', err);
    }
  };

  useEffect(() => {
    loadStores();
    loadStats();
    
    // 每30秒重新載入
    const interval = setInterval(() => {
      loadStores();
      loadStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // 更新店家審核狀態
  const updateStoreApproval = async (storeId: string, newStatus: ApprovalStatus, notes?: string) => {
    try {
      const { error } = await supabase
        .from('stores')
        .update({
          approval: newStatus,
          audit_notes: notes,
          approved_at: new Date().toISOString(),
          approved_by: 'admin'
        })
        .eq('id', storeId);

      if (error) throw error;

      await loadStores();
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失敗');
    }
  };

  // 更新店家贊助等級
  const updateStoreTier = async (storeId: string, newTier: SponsorshipTier) => {
    try {
      const { error } = await supabase
        .from('stores')
        .update({
          sponsorship_tier: newTier
        })
        .eq('id', storeId);

      if (error) throw error;

      await loadStores();
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失敗');
    }
  };

  // 更新店家證據等級
  const updateStoreEvidence = async (storeId: string, newLevel: EvidenceLevel) => {
    try {
      const { error } = await supabase
        .from('stores')
        .update({
          evidence_level: newLevel
        })
        .eq('id', storeId);

      if (error) throw error;

      await loadStores();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失敗');
    }
  };

  // 過濾店家
  const filteredStores = stores.filter(store => {
    if (filterApproval !== 'all' && store.approval !== filterApproval) return false;
    if (filterTier !== 'all' && store.sponsorship_tier !== filterTier) return false;
    if (filterEvidence !== 'all' && store.evidence_level !== filterEvidence) return false;
    return true;
  });

  // 獲取狀態顏色
  const getApprovalColor = (status: ApprovalStatus) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      case 'archived': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 獲取贊助等級顏色
  const getTierColor = (tier: SponsorshipTier) => {
    switch (tier) {
      case 2: return 'text-purple-600 bg-purple-100';
      case 1: return 'text-blue-600 bg-blue-100';
      case 0: return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 獲取證據等級顏色
  const getEvidenceColor = (level: EvidenceLevel) => {
    switch (level) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'pending_verification': return 'text-yellow-600 bg-yellow-100';
      case 'unverified': return 'text-orange-600 bg-orange-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        錯誤: {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        🏪 店家審核管理系統
      </h1>

      {/* 統計概覽 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">總店家數</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalStores}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">已審核</h3>
            <p className="text-3xl font-bold text-green-600">{stats.approvedStores}</p>
            <p className="text-sm text-gray-500">
              {Math.round((stats.approvedStores / stats.totalStores) * 100)}%
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">待審核</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingStores}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">主推商家</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.tier2Stores}</p>
          </div>
        </div>
      )}

      {/* 過濾器 */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">🔍 過濾器</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">審核狀態</label>
            <select
              value={filterApproval}
              onChange={(e) => setFilterApproval(e.target.value as ApprovalStatus | 'all')}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="all">全部</option>
              <option value="approved">已審核</option>
              <option value="pending">待審核</option>
              <option value="suspended">已暫停</option>
              <option value="archived">已封存</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">贊助等級</label>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value as SponsorshipTier | 'all')}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="all">全部</option>
              <option value="0">一般商家</option>
              <option value="1">特約商家</option>
              <option value="2">主推商家</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">證據等級</label>
            <select
              value={filterEvidence}
              onChange={(e) => setFilterEvidence(e.target.value as EvidenceLevel | 'all')}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="all">全部</option>
              <option value="verified">已驗證</option>
              <option value="pending_verification">待驗證</option>
              <option value="unverified">未驗證</option>
              <option value="failed">驗證失敗</option>
            </select>
          </div>
        </div>
      </div>

      {/* 店家列表 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">📋 店家列表 ({filteredStores.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  店名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  類別
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  審核狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  贊助等級
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  證據等級
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStores.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{store.store_name}</div>
                      <div className="text-sm text-gray-500">{store.store_code || '無代碼'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {store.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getApprovalColor(store.approval)}`}>
                      {store.approval}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(store.sponsorship_tier)}`}>
                      {store.sponsorship_tier === 2 ? '主推' : store.sponsorship_tier === 1 ? '特約' : '一般'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEvidenceColor(store.evidence_level)}`}>
                      {store.evidence_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedStore(store)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      管理
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 店家管理模態框 */}
      {selectedStore && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                🏪 店家管理 - {selectedStore.store_name}
              </h3>
              
              <div className="space-y-4">
                {/* 審核狀態管理 */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">審核狀態管理</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateStoreApproval(selectedStore.id, 'approved', '管理員審核通過')}
                      className={`px-3 py-1 rounded text-sm ${
                        selectedStore.approval === 'approved' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      審核通過
                    </button>
                    <button
                      onClick={() => updateStoreApproval(selectedStore.id, 'pending', '等待審核')}
                      className={`px-3 py-1 rounded text-sm ${
                        selectedStore.approval === 'pending' 
                          ? 'bg-yellow-500 text-white' 
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      待審核
                    </button>
                    <button
                      onClick={() => updateStoreApproval(selectedStore.id, 'suspended', '暫停曝光')}
                      className={`px-3 py-1 rounded text-sm ${
                        selectedStore.approval === 'suspended' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      暫停曝光
                    </button>
                  </div>
                </div>
                
                {/* 贊助等級管理 */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">贊助等級管理</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateStoreTier(selectedStore.id, 0)}
                      className={`px-3 py-1 rounded text-sm ${
                        selectedStore.sponsorship_tier === 0 
                          ? 'bg-gray-500 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      一般商家
                    </button>
                    <button
                      onClick={() => updateStoreTier(selectedStore.id, 1)}
                      className={`px-3 py-1 rounded text-sm ${
                        selectedStore.sponsorship_tier === 1 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      特約商家
                    </button>
                    <button
                      onClick={() => updateStoreTier(selectedStore.id, 2)}
                      className={`px-3 py-1 rounded text-sm ${
                        selectedStore.sponsorship_tier === 2 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                    >
                      主推商家
                    </button>
                  </div>
                </div>
                
                {/* 證據等級管理 */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">證據等級管理</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateStoreEvidence(selectedStore.id, 'verified')}
                      className={`px-3 py-1 rounded text-sm ${
                        selectedStore.evidence_level === 'verified' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      已驗證
                    </button>
                    <button
                      onClick={() => updateStoreEvidence(selectedStore.id, 'unverified')}
                      className={`px-3 py-1 rounded text-sm ${
                        selectedStore.evidence_level === 'unverified' 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      }`}
                    >
                      未驗證
                    </button>
                  </div>
                </div>
                
                {/* 店家詳細資訊 */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">店家詳細資訊</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>地址:</strong> {selectedStore.address}</p>
                    <p><strong>電話:</strong> {selectedStore.phone}</p>
                    <p><strong>營業時間:</strong> {selectedStore.business_hours}</p>
                    <p><strong>評分:</strong> {selectedStore.rating || '無'}</p>
                    <p><strong>審核時間:</strong> {selectedStore.approved_at || '未審核'}</p>
                    <p><strong>審核人員:</strong> {selectedStore.approved_by || '無'}</p>
                    <p><strong>備註:</strong> {selectedStore.audit_notes || '無'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedStore(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreApprovalAdminDashboard;
