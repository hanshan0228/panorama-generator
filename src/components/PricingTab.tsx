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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/35 text-cyan-300 text-xs font-mono font-bold mb-1 shadow-[0_0_15px_rgba(0,242,254,0.15)]">
          <Zap className="w-3.5 h-3.5 text-cyan-400 fill-current" />
          <span>FLEXIBLE PRODUCTION PLANS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
          Simple, Transparent Pricing
        </h1>
        <p className="text-sm text-cyan-200/70 max-w-xl mx-auto">
          From independent game developers to commercial architectural studios. Choose the plan that fits your production pipeline.
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
            Yearly Billing <span className="text-[10px] text-cyan-300 font-extrabold ml-1.5 px-1.5 py-0.5 bg-cyan-950/80 rounded-full border border-cyan-400/40">Save 65%</span>
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
            Monthly Billing
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Free Plan */}
        <div className="glass-panel border border-cyan-500/20 rounded-3xl p-7 space-y-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-bold text-cyan-200">Free Explorer</div>
              <div className="text-xs text-cyan-400/60 mt-0.5">For testing and personal viewing</div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">$0</span>
              <span className="text-xs text-cyan-300/60">/ forever</span>
            </div>
            <ul className="space-y-3 text-xs text-cyan-100/90 pt-2 border-t border-cyan-500/15">
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400/20 text-cyan-300">
                  <Check className="w-3 h-3" />
                </div>
                <span>3 Free AI generations</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400/20 text-cyan-300">
                  <Check className="w-3 h-3" />
                </div>
                <span>Unlimited 360 WebGL Viewer</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400/20 text-cyan-300">
                  <Check className="w-3 h-3" />
                </div>
                <span>Cubemap Slicer (256px)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400/20 text-cyan-300">
                  <Check className="w-3 h-3" />
                </div>
                <span>Standard 1K resolution</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className="w-full py-3 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 font-bold text-xs rounded-xl border border-cyan-500/25 transition-colors cursor-pointer"
          >
            Current Plan
          </button>
        </div>

        {/* Pro Plan (Highlighted Hero) */}
        <div className="glass-panel border-2 border-cyan-400 rounded-3xl p-7 space-y-6 relative flex flex-col justify-between shadow-[0_0_60px_rgba(0,242,254,0.35)] bg-gradient-to-b from-[#082245]/90 via-[#0a2952]/90 to-[#071d3a]/95 scale-105 z-10">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 rounded-full text-[10px] font-black text-slate-950 uppercase tracking-wider shadow-lg shadow-cyan-400/50">
            Most Popular
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm font-black text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400 fill-current" />
                <span>Pro Creator</span>
              </div>
              <div className="text-xs text-cyan-200/80 mt-0.5">For indie game devs &amp; 3D artists</div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">
                {billingCycle === 'yearly' ? '$9.9' : '$19.9'}
              </span>
              <span className="text-xs text-cyan-300/80">/ month</span>
            </div>
            <ul className="space-y-3 text-xs text-cyan-50 pt-2 border-t border-cyan-400/25">
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400 text-slate-950 font-bold shadow-sm">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span><strong>150 Generations</strong> / month</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400 text-slate-950 font-bold shadow-sm">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>High-Res <strong>2K &amp; 4K Ultra HD</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400 text-slate-950 font-bold shadow-sm">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Radiance <strong>.HDR</strong> Environment Export</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400 text-slate-950 font-bold shadow-sm">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Full Commercial License</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400 text-slate-950 font-bold shadow-sm">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Automatic 360° Seam Healing</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className="shimmer-btn w-full py-3.5 bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-400/40 transition-all cursor-pointer active:scale-95 tracking-wide"
          >
            Upgrade to Pro Now
          </button>
        </div>

        {/* Studio / Enterprise */}
        <div className="glass-panel border border-cyan-500/20 rounded-3xl p-7 space-y-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-bold text-cyan-200 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400 fill-current" />
                <span>Studio Studio</span>
              </div>
              <div className="text-xs text-cyan-400/60 mt-0.5">For studios &amp; pipeline integration</div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">
                {billingCycle === 'yearly' ? '$29.9' : '$49.9'}
              </span>
              <span className="text-xs text-cyan-300/60">/ month</span>
            </div>
            <ul className="space-y-3 text-xs text-cyan-100/90 pt-2 border-t border-cyan-500/15">
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400/20 text-cyan-300">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>500 Generations</strong> / month</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400/20 text-cyan-300">
                  <Check className="w-3 h-3" />
                </div>
                <span>Full <strong>Developer REST API</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400/20 text-cyan-300">
                  <Check className="w-3 h-3" />
                </div>
                <span>Batch Invoice / CSV uploads</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="p-1 rounded-full bg-cyan-400/20 text-cyan-300">
                  <Check className="w-3 h-3" />
                </div>
                <span>Priority Dedicated GPU Pool</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className="w-full py-3 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 font-bold text-xs rounded-xl border border-cyan-500/25 transition-colors cursor-pointer"
          >
            Contact Sales
          </button>
        </div>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="space-y-4 pt-6 border-t border-cyan-500/20">
        <h2 className="text-lg font-black text-white text-center flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
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
