import { useState } from 'react';
import { Check, Sparkles, Zap, Shield, ChevronDown, ChevronUp } from 'lucide-react';

export function PricingTab() {
  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('yearly');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const FAQS = [
    {
      q: 'Can I use generated 360 panoramas commercially?',
      a: 'Yes! All panoramas generated under Pro and Studio plans include full commercial licenses. You can use them in published video games, commercial VR tours, architectural client presentations, and YouTube videos.',
    },
    {
      q: 'What resolution are the exported files?',
      a: 'Free trial generates at 1K (1024×512). Pro and Studio tiers unlock up to 4K (3840×1920) equirectangular PNGs and native Radiance .hdr containers.',
    },
    {
      q: 'How does the Seam Healing algorithm work?',
      a: 'Standard AI models produce visible vertical stitch lines at the 360° wrap boundary. Our post-processing engine mirrors and blends the outer 80 pixels using cross-fade interpolation, guaranteeing 100% seamless rotation.',
    },
    {
      q: 'Do you offer a REST API for automated generation?',
      a: 'Yes, our Studio and Enterprise tiers provide developer REST API keys with batch processing endpoints, webhook notifications, and raw base64/JSON outputs.',
    },
  ];

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Title & Billing Toggle */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-medium mb-1">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>FLEXIBLE PRODUCTION PLANS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Simple, Transparent Pricing
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          From independent game developers to commercial architectural studios. Choose the plan that fits your production pipeline.
        </p>

        {/* Yearly vs Monthly Toggle */}
        <div className="inline-flex items-center gap-1.5 p-1.5 bg-[#080b18] border border-white/10 rounded-2xl text-xs shadow-inner">
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
              billingCycle === 'yearly'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Yearly Billing <span className="text-[10px] text-pink-300 font-bold ml-1.5 px-1.5 py-0.5 bg-pink-500/20 rounded-full border border-pink-500/30">Save 65%</span>
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monthly Billing
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Free Plan */}
        <div className="glass-panel border border-white/10 rounded-3xl p-7 space-y-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-bold text-slate-300">Free Explorer</div>
              <div className="text-xs text-slate-500 mt-0.5">For testing and personal viewing</div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">$0</span>
              <span className="text-xs text-slate-400">/ forever</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-300 pt-2 border-t border-white/[0.06]">
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-emerald-500/15 text-emerald-400">
                  <Check className="w-3 h-3" />
                </div>
                <span>3 Free AI generations</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-emerald-500/15 text-emerald-400">
                  <Check className="w-3 h-3" />
                </div>
                <span>Unlimited 360 WebGL Viewer</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-emerald-500/15 text-emerald-400">
                  <Check className="w-3 h-3" />
                </div>
                <span>Cubemap Slicer (256px)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-emerald-500/15 text-emerald-400">
                  <Check className="w-3 h-3" />
                </div>
                <span>Standard 1K resolution</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className="w-full py-3 bg-white/[0.05] hover:bg-white/10 text-slate-300 font-semibold text-xs rounded-xl border border-white/10 transition-colors cursor-pointer"
          >
            Current Plan
          </button>
        </div>

        {/* Pro Plan (Highlighted Hero) */}
        <div className="glass-panel border-2 border-indigo-400/80 rounded-3xl p-7 space-y-6 relative flex flex-col justify-between shadow-[0_0_50px_rgba(99,102,241,0.25)] bg-gradient-to-b from-indigo-950/60 via-[#0a0e20]/80 to-[#0c1024]/90 scale-105 z-10">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full text-[10px] font-extrabold text-white uppercase tracking-wider shadow-lg shadow-indigo-500/40">
            Most Popular
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-400 fill-current" />
                <span>Pro Creator</span>
              </div>
              <div className="text-xs text-slate-300 mt-0.5">For indie game devs &amp; 3D artists</div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">
                {billingCycle === 'yearly' ? '$9.9' : '$19.9'}
              </span>
              <span className="text-xs text-slate-400">/ month</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-200 pt-2 border-t border-white/[0.08]">
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-300">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>150 Generations</strong> / month</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-300">
                  <Check className="w-3 h-3" />
                </div>
                <span>High-Res <strong>2K &amp; 4K Ultra HD</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-300">
                  <Check className="w-3 h-3" />
                </div>
                <span>Radiance <strong>.HDR</strong> Environment Export</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-300">
                  <Check className="w-3 h-3" />
                </div>
                <span>Full Commercial License</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-300">
                  <Check className="w-3 h-3" />
                </div>
                <span>Automatic 360° Seam Healing</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className="shimmer-btn w-full py-3.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/30 transition-all cursor-pointer active:scale-95"
          >
            Upgrade to Pro Now
          </button>
        </div>

        {/* Studio / Enterprise */}
        <div className="glass-panel border border-white/10 rounded-3xl p-7 space-y-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400 fill-current" />
                <span>Studio Studio</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">For studios &amp; pipeline integration</div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">
                {billingCycle === 'yearly' ? '$29.9' : '$49.9'}
              </span>
              <span className="text-xs text-slate-400">/ month</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-300 pt-2 border-t border-white/[0.06]">
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-emerald-500/15 text-emerald-400">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>500 Generations</strong> / month</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-emerald-500/15 text-emerald-400">
                  <Check className="w-3 h-3" />
                </div>
                <span>Full <strong>Developer REST API</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-emerald-500/15 text-emerald-400">
                  <Check className="w-3 h-3" />
                </div>
                <span>Batch Invoice / CSV uploads</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-emerald-500/15 text-emerald-400">
                  <Check className="w-3 h-3" />
                </div>
                <span>Priority Dedicated GPU Pool</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className="w-full py-3 bg-white/[0.05] hover:bg-white/10 text-slate-200 font-semibold text-xs rounded-xl border border-white/10 transition-colors cursor-pointer"
          >
            Contact Sales
          </button>
        </div>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="space-y-4 pt-6 border-t border-white/[0.08]">
        <h2 className="text-lg font-bold text-white text-center flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          Frequently Asked Questions
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
                  className="w-full px-5 py-4 text-left text-xs font-semibold text-slate-200 flex items-center justify-between gap-2 hover:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-slate-400 leading-relaxed border-t border-white/[0.06] pt-3">
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
