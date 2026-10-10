import { useState } from 'react';
import {
  Server,
  Users,
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Power,
  Search,
  Filter,
  Coins,
  DollarSign,
  Activity,
  Layers,
  Save,
} from 'lucide-react';
import type {
  ModelEndpointConfig,
  ManagedUser,
  SystemBillingConfig,
  UserPlanTier,
} from '../types/panorama';
import {
  getStoredModelEndpoints,
  saveStoredModelEndpoints,
  getStoredManagedUsers,
  saveStoredManagedUsers,
  getStoredBillingConfig,
  saveStoredBillingConfig,
} from '../utils/adminStorage';

export function AdminTab() {
  const [activeSubSection, setActiveSubSection] = useState<'models' | 'users' | 'billing'>('models');

  // 1. Models State
  const [endpoints, setEndpoints] = useState<ModelEndpointConfig[]>(() => getStoredModelEndpoints());
  const [editingEndpoint, setEditingEndpoint] = useState<ModelEndpointConfig | null>(null);
  const [isAddingEndpoint, setIsAddingEndpoint] = useState(false);

  // 2. Users State
  const [users, setUsers] = useState<ManagedUser[]>(() => getStoredManagedUsers());
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userPlanFilter, setUserPlanFilter] = useState<'all' | UserPlanTier>('all');
  const [editingUserCredits, setEditingUserCredits] = useState<{ id: string; amount: number } | null>(null);

  // 3. Billing Config State
  const [billingConfig, setBillingConfig] = useState<SystemBillingConfig>(() => getStoredBillingConfig());
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  // Model Operations
  const handleToggleEndpointEnabled = (id: string) => {
    const next = endpoints.map((ep) => (ep.id === id ? { ...ep, isEnabled: !ep.isEnabled } : ep));
    setEndpoints(next);
    saveStoredModelEndpoints(next);
    showToast('模型端点状态已更新');
  };

  const handleSetDefaultEndpoint = (id: string) => {
    const next = endpoints.map((ep) => ({ ...ep, isDefault: ep.id === id }));
    setEndpoints(next);
    saveStoredModelEndpoints(next);
    showToast('默认主路由模型已更新');
  };

  const handleDeleteEndpoint = (id: string) => {
    if (confirm('确定要删除此模型端点配置吗？')) {
      const next = endpoints.filter((ep) => ep.id !== id);
      setEndpoints(next);
      saveStoredModelEndpoints(next);
      showToast('模型端点已删除');
    }
  };

  const handleSaveEndpointForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEndpoint) return;

    let next: ModelEndpointConfig[];
    if (isAddingEndpoint) {
      next = [...endpoints, editingEndpoint];
    } else {
      next = endpoints.map((ep) => (ep.id === editingEndpoint.id ? editingEndpoint : ep));
    }
    setEndpoints(next);
    saveStoredModelEndpoints(next);
    setEditingEndpoint(null);
    setIsAddingEndpoint(false);
    showToast(isAddingEndpoint ? '已成功添加新 AI 模型端点' : '模型端点配置已保存');
  };

  // User Operations
  const handleUpdateUserStatus = (userId: string, newStatus: 'active' | 'suspended') => {
    const next = users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u));
    setUsers(next);
    saveStoredManagedUsers(next);
    showToast(`用户状态已变更为: ${newStatus === 'active' ? '正常激活' : '已封禁停用'}`);
  };

  const handleAdjustCredits = (userId: string, delta: number) => {
    const next = users.map((u) => {
      if (u.id === userId) {
        const nextBalance = Math.max(0, u.creditsBalance + delta);
        return { ...u, creditsBalance: nextBalance };
      }
      return u;
    });
    setUsers(next);
    saveStoredManagedUsers(next);
    setEditingUserCredits(null);
    showToast('用户算力点数已调整');
  };

  const handleSaveBilling = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredBillingConfig(billingConfig);
    showToast('计费与定价规则配置已保存');
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchesPlan = userPlanFilter === 'all' || u.plan === userPlanFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="space-y-6">
      {/* Header & Section Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-lg text-slate-950 shadow-md shadow-cyan-500/20">
              <Server className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-white">系统后台管理与运维中枢</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            配置本地 Gemini 代理端点、AI 图像模型路由、用户订阅方案与算力点数消耗规则。
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveSubSection('models')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubSection === 'models'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>AI 模型路由端点</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubSection('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubSection === 'users'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>用户管理与套餐</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubSection('billing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubSection === 'billing'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>算力计费与定价</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="px-4 py-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* SECTION 1: Model Management */}
      {activeSubSection === 'models' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>全景生图模型路由端点</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                setIsAddingEndpoint(true);
                setEditingEndpoint({
                  id: `model_${Date.now()}`,
                  name: '新模型端点',
                  provider: 'gemini',
                  baseUrl: 'http://localhost:8317',
                  apiKey: '',
                  model: 'gemini-3.1-flash-image',
                  isEnabled: true,
                  priority: endpoints.length + 1,
                  maxResolution: '4K',
                  isDefault: false,
                });
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm shadow-cyan-500/25 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加模型端点</span>
            </button>
          </div>

          {/* Model Endpoints Table / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {endpoints.map((ep) => (
              <div
                key={ep.id}
                className={`p-5 rounded-2xl border transition-all ${
                  ep.isEnabled
                    ? 'bg-slate-900/60 border-slate-800'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{ep.name}</span>
                      {ep.isDefault && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                          默认主路由
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">{ep.model}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title={ep.isEnabled ? '禁用端点' : '启用端点'}
                      onClick={() => handleToggleEndpointEnabled(ep.id)}
                      className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                        ep.isEnabled
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="编辑端点配置"
                      onClick={() => {
                        setIsAddingEndpoint(false);
                        setEditingEndpoint(ep);
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="删除端点"
                      disabled={endpoints.length <= 1}
                      onClick={() => handleDeleteEndpoint(ep.id)}
                      className="p-1.5 bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/40 text-slate-300 hover:text-red-400 rounded-lg cursor-pointer disabled:opacity-40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">底层协议:</span>
                    <span className="text-slate-300 uppercase">{ep.provider}</span>
                  </div>
                  <div className="flex justify-between truncate">
                    <span className="text-slate-500">接口地址:</span>
                    <span className="text-slate-300 truncate max-w-[200px]">{ep.baseUrl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">最高规格:</span>
                    <span className="text-cyan-400">{ep.maxResolution}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-500 text-[11px]">路由优先级: #{ep.priority}</span>
                  {!ep.isDefault && ep.isEnabled && (
                    <button
                      type="button"
                      onClick={() => handleSetDefaultEndpoint(ep.id)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                    >
                      设为默认主路由 →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Model Edit / Add Modal */}
          {editingEndpoint && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <form
                onSubmit={handleSaveEndpointForm}
                className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-semibold text-white text-sm">
                    {isAddingEndpoint ? '添加 AI 模型路由端点' : `编辑模型配置: ${editingEndpoint.name}`}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingEndpoint(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">端点显示名称</label>
                    <input
                      type="text"
                      required
                      value={editingEndpoint.name}
                      onChange={(e) => setEditingEndpoint({ ...editingEndpoint, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">底层模型协议</label>
                    <select
                      value={editingEndpoint.provider}
                      onChange={(e) =>
                        setEditingEndpoint({
                          ...editingEndpoint,
                          provider: e.target.value as ModelEndpointConfig['provider'],
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                    >
                      <option value="gemini">Google Gemini / 8317 本地代理</option>
                      <option value="openai">OpenAI 兼容协议 (/v1/images/generations)</option>
                      <option value="fal">Fal.ai (Flux 全景)</option>
                      <option value="replicate">Replicate 生图</option>
                      <option value="custom">自建或企业私有反向代理</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">接口地址 (Base URL)</label>
                  <input
                    type="text"
                    required
                    value={editingEndpoint.baseUrl}
                    onChange={(e) => setEditingEndpoint({ ...editingEndpoint, baseUrl: e.target.value })}
                    placeholder="http://localhost:8317 或 https://api.openai.com/v1"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">模型标识 (Model ID)</label>
                    <input
                      type="text"
                      required
                      value={editingEndpoint.model}
                      onChange={(e) => setEditingEndpoint({ ...editingEndpoint, model: e.target.value })}
                      placeholder="gemini-3.1-flash-image 或 gpt-image-2.5"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">最高支持画质规格</label>
                    <select
                      value={editingEndpoint.maxResolution}
                      onChange={(e) =>
                        setEditingEndpoint({ ...editingEndpoint, maxResolution: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                    >
                      <option value="1K">1K (1024x512)</option>
                      <option value="2K">2K (2048x1024)</option>
                      <option value="4K">4K (4096x2048)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">API Key 密钥 (本地 8317 代理可免密或填自定义 Key)</label>
                  <input
                    type="password"
                    value={editingEndpoint.apiKey}
                    onChange={(e) => setEditingEndpoint({ ...editingEndpoint, apiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingEndpoint(null)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold rounded-lg flex items-center gap-1 shadow-md shadow-cyan-500/20 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>保存模型端点</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: Users Management */}
      {activeSubSection === 'users' && (
        <div className="space-y-4">
          {/* Top Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 border border-slate-800 rounded-2xl">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="搜索邮箱、姓名或用户 ID..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-400">会员套餐筛选:</span>
              {(['all', 'free', 'pro', 'enterprise'] as const).map((plan) => (
                <button
                  key={plan}
                  type="button"
                  onClick={() => setUserPlanFilter(plan)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase transition-colors cursor-pointer ${
                    userPlanFilter === plan
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-sm shadow-cyan-500/30'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {plan === 'all' ? '全部' : plan === 'free' ? '免费' : plan === 'pro' ? '专业版' : '企业版'}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3">用户</th>
                    <th className="px-5 py-3">当前套餐</th>
                    <th className="px-5 py-3">算力余额</th>
                    <th className="px-5 py-3">API 调用次数</th>
                    <th className="px-5 py-3">账号状态</th>
                    <th className="px-5 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold uppercase ${
                            u.plan === 'enterprise'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : u.plan === 'pro'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {u.plan}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{u.creditsBalance}</span>
                          <span className="text-slate-500">/ {u.creditsTotal}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingUserCredits({ id: u.id, amount: u.creditsBalance })
                            }
                            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium ml-1 cursor-pointer"
                          >
                            调整点数
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-mono text-slate-300">{u.apiCallsCount} 次</td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] ${
                            u.status === 'active'
                              ? 'text-emerald-400'
                              : u.status === 'suspended'
                              ? 'text-red-400'
                              : 'text-slate-500'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'
                            }`}
                          />
                          {u.status === 'active' ? '正常' : '已冻结'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {u.status === 'active' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateUserStatus(u.id, 'suspended')}
                              className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-[11px] cursor-pointer"
                            >
                              冻结账号
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateUserStatus(u.id, 'active')}
                              className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-[11px] cursor-pointer"
                            >
                              解冻恢复
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Adjust User Credits Modal */}
          {editingUserCredits && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 space-y-4 text-xs">
                <h4 className="font-semibold text-white text-sm">调整用户全景算力点数</h4>
                <p className="text-slate-400 text-xs">快速充值或扣除用户 360° 全景生成额度：</p>
                <div className="grid grid-cols-3 gap-2">
                  {[+100, +500, +1000, -100, -500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAdjustCredits(editingUserCredits.id, amt)}
                      className="py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-200 font-mono font-medium cursor-pointer"
                    >
                      {amt > 0 ? `+${amt}` : amt}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingUserCredits(null)}
                    className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg cursor-pointer"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: Billing & Pricing Config */}
      {activeSubSection === 'billing' && (
        <form
          onSubmit={handleSaveBilling}
          className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6 text-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>商业定价与算力计费费率</span>
              </h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                配置 SaaS 会员配额、月度赠送点数以及高清全景导出消耗费率。
              </p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/25 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>保存配置规则</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>套餐配额与点数配置</span>
              </h4>

              <div>
                <label className="block text-slate-300 mb-1">免费体验版每月赠送点数</label>
                <input
                  type="number"
                  min={0}
                  value={billingConfig.freeMonthlyCredits}
                  onChange={(e) =>
                    setBillingConfig({ ...billingConfig, freeMonthlyCredits: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">专业版月费价格 (¥ 人民币)</label>
                <input
                  type="number"
                  min={0}
                  value={billingConfig.proMonthlyPriceUsd}
                  onChange={(e) =>
                    setBillingConfig({ ...billingConfig, proMonthlyPriceUsd: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">专业版每月赠送点数</label>
                <input
                  type="number"
                  min={0}
                  value={billingConfig.proMonthlyCredits}
                  onChange={(e) =>
                    setBillingConfig({ ...billingConfig, proMonthlyCredits: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>不同分辨率算力消耗费率</span>
              </h4>

              <div>
                <label className="block text-slate-300 mb-1">1K 标准全景生成单次消耗</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={billingConfig.creditCostPer1K}
                    onChange={(e) =>
                      setBillingConfig({ ...billingConfig, creditCostPer1K: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
                  />
                  <span className="text-slate-400">点</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">2K 高清全景生成单次消耗</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={billingConfig.creditCostPer2K}
                    onChange={(e) =>
                      setBillingConfig({ ...billingConfig, creditCostPer2K: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
                  />
                  <span className="text-slate-400">点</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">4K 超高清 / Radiance HDR 导出单次消耗</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={billingConfig.creditCostPer4K}
                    onChange={(e) =>
                      setBillingConfig({ ...billingConfig, creditCostPer4K: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
                  />
                  <span className="text-slate-400">点</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
