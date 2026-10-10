import { useState } from 'react';
import { Check, Sparkles, Zap, Shield, ChevronDown, ChevronUp } from 'lucide-react';

export function PricingTab() {
  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('yearly');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const FAQS = [
    {
      q: '生成的高清 360° 全景图可以商业使用吗？',
      a: '完全可以！专业版与工作室版生成的所有全景图均包含完整的商业使用授权。您可以直接将其用于已发行的商业游戏、虚拟看房 VR 漫游导览、建筑方案客户汇报以及商业宣传视频中。',
    },
    {
      q: '导出的全景文件支持哪些分辨率和格式？',
      a: '免费体验版支持 1K (1024×512) 分辨率；专业版与工作室版可解锁最高 4K (3840×1920) 高清等距柱状无损 PNG，并可一键导出 Radiance .hdr 工业级高动态光照文件。',
    },
    {
      q: '智能接缝消除 (Seam Healing) 算法是如何运作的？',
      a: '常规 AI 绘画模型在 360° 首尾闭合拼接处往往存在垂直断裂缝隙。我们的本地算法引擎通过边缘 140 像素对称渐变融合与双向平滑插值，彻底消除垂直接缝，保障 100% 无缝旋转漫游。',
    },
    {
      q: '是否提供用于批量自动化调用的 REST API？',
      a: '是的！工作室版和企业版提供开发者专属 REST API Key，支持并发批量生成端点、Webhook 事件回调以及标准 Base64/JSON 结构化输出。',
    },
  ];

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Title & Billing Toggle */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/35 text-cyan-300 text-xs font-mono font-bold mb-1 shadow-[0_0_15px_rgba(0,242,254,0.15)]">
          <Zap className="w-3.5 h-3.5 text-cyan-400 fill-current" />
          <span>灵活的生产力方案</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
          简单透明的会员与价格体系
        </h1>
        <p className="text-sm text-cyan-200/70 max-w-xl mx-auto">
          从独立游戏开发者到大型商业建筑与三维可视化工作室，随心选择最契合您创作管线的方案。
        </p>

        {/* Yearly vs Monthly Toggle */}
        <div className="inline-flex items-center gap-1.5 p-1.5 bg-[#030e20] border border-cyan-500/25 rounded-2xl text-xs shadow-inner">
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              billingCycle === 'yearly'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-400/30'
                : 'text-cyan-200/60 hover:text-white'
            }`}
          >
            按年订阅 <span className="text-[10px] text-cyan-300 font-extrabold ml-1.5 px-1.5 py-0.5 bg-cyan-950/80 rounded-full border border-cyan-400/40">立省 65%</span>
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-400/30'
                : 'text-cyan-200/60 hover:text-white'
            }`}
          >
            按月订阅
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Free Plan */}
        <div className="glass-panel border border-cyan-500/20 rounded-3xl p-7 space-y-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-bold text-cyan-200">探索体验版</div>
              <div className="text-xs text-cyan-400/60 mt-0.5">适合个人体验与全景查看</div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">¥0</span>
              <span className="text-xs text-cyan-300/60">/ 永久免费</span>
            </div>
            <ul className="space-y-3 text-xs text-cyan-100/90 pt-2 border-t border-cyan-500/15">
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400/20 text-cyan-300">
                  <Check className="w-3 h-3" />
                </div>
                <span>赠送 3 次 AI 全景生成</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400/20 text-cyan-300">
                  <Check className="w-3 h-3" />
                </div>
                <span>无限制 360° WebGL 播放器</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400/20 text-cyan-300">
                  <Check className="w-3 h-3" />
                </div>
                <span>天空盒立方体切片 (256px)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400/20 text-cyan-300">
                  <Check className="w-3 h-3" />
                </div>
                <span>标准 1K 分辨率画质</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className="w-full py-3 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 font-bold text-xs rounded-xl border border-cyan-500/25 transition-colors cursor-pointer"
          >
            当前方案
          </button>
        </div>

        {/* Pro Plan (Highlighted Hero) */}
        <div className="glass-panel border-2 border-cyan-400 rounded-3xl p-7 space-y-6 relative flex flex-col justify-between shadow-[0_0_60px_rgba(0,242,254,0.35)] bg-gradient-to-b from-[#082245]/90 via-[#0a2952]/90 to-[#071d3a]/95 scale-105 z-10">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 rounded-full text-[10px] font-black text-slate-950 uppercase tracking-wider shadow-lg shadow-cyan-400/50">
            最受欢迎
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm font-black text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400 fill-current" />
                <span>专业创作者版</span>
              </div>
              <div className="text-xs text-cyan-200/80 mt-0.5">专为独立开发者与 3D 创作者设计</div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">
                {billingCycle === 'yearly' ? '¥68' : '¥128'}
              </span>
              <span className="text-xs text-cyan-300/80">/ 月</span>
            </div>
            <ul className="space-y-3 text-xs text-cyan-50 pt-2 border-t border-cyan-400/25">
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400 text-slate-950 font-bold shadow-sm">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>每月 <strong>150 次</strong> 高速生成</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400 text-slate-950 font-bold shadow-sm">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span><strong>2K 与 4K 超高清</strong> 无损全景</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400 text-slate-950 font-bold shadow-sm">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Radiance <strong>.HDR</strong> 环境光照文件导出</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400 text-slate-950 font-bold shadow-sm">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>完整商业使用授权 (商用无忧)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400 text-slate-950 font-bold shadow-sm">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>全自动 360° 接缝无缝平滑消除</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className="shimmer-btn w-full py-3.5 bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-400/40 transition-all cursor-pointer active:scale-95 tracking-wide"
          >
            立即升级专业版
          </button>
        </div>

        {/* Studio / Enterprise */}
        <div className="glass-panel border border-cyan-500/20 rounded-3xl p-7 space-y-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-bold text-cyan-200 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400 fill-current" />
                <span>工作室旗舰版</span>
              </div>
              <div className="text-xs text-cyan-400/60 mt-0.5">适合设计工作室与工业管线集成</div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">
                {billingCycle === 'yearly' ? '¥198' : '¥328'}
              </span>
              <span className="text-xs text-cyan-300/60">/ 月</span>
            </div>
            <ul className="space-y-3 text-xs text-cyan-100/90 pt-2 border-t border-cyan-500/15">
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400/20 text-cyan-300">
                  <Check className="w-3 h-3" />
                </div>
                <span>每月 <strong>500 次</strong> 高速并发生成</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400/20 text-cyan-300">
                  <Check className="w-3 h-3" />
                </div>
                <span>全功能 <strong>开发者 REST API</strong> 接入</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400/20 text-cyan-300">
                  <Check className="w-3 h-3" />
                </div>
                <span>批量生成与企业对公发票</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400/20 text-cyan-300">
                  <Check className="w-3 h-3" />
                </div>
                <span>专属高优先级 GPU 算力集群</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className="w-full py-3 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 font-bold text-xs rounded-xl border border-cyan-500/25 transition-colors cursor-pointer"
          >
            联系企业顾问
          </button>
        </div>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="space-y-4 pt-6 border-t border-cyan-500/20">
        <h2 className="text-lg font-black text-white text-center flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          常见问题与解答
        </h2>

        <div className="space-y-3 max-w-2xl mx-auto">
          {FAQS.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={faq.q}
                className="glass-card rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left text-xs font-bold text-cyan-100 flex items-center justify-between gap-2 hover:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-cyan-600 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-cyan-200/80 leading-relaxed border-t border-cyan-500/15 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
