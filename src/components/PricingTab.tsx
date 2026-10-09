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
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Simple, Transparent Pricing
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          From independent game developers to commercial architectural studios. Choose the plan that fits your production pipeline.
        </p>

        {/* Yearly vs Monthly Toggle */}
        <div className="inline-flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs">
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              billingCycle === 'yearly'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Yearly Billing <span className="text-[10px] text-pink-300 font-bold ml-1">(Save 65%)</span>
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monthly Billing
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-semibold text-slate-300">Free Explorer</div>
              <div className="text-xs text-slate-500">For testing and personal viewing</div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-white">$0</span>
              <span className="text-xs text-slate-500">/ forever</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>3 Free AI generations</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Unlimited 360 WebGL Viewer</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Cubemap Slicer (256px)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Standard 1K resolution</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl transition-colors cursor-pointer"
          >
            Current Plan
          </button>
        </div>

        {/* Pro Plan (Highlighted) */}
        <div className="bg-gradient-to-b from-indigo-950/60 to-slate-900/90 border-2 border-indigo-500/80 rounded-2xl p-6 space-y-6 relative flex flex-col justify-between shadow-2xl shadow-indigo-500/10">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
            Most Popular
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>Pro Creator</span>
              </div>
              <div className="text-xs text-slate-400">For indie game devs &amp; 3D artists</div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-white">
                {billingCycle === 'yearly' ? '$9.9' : '$19.9'}
              </span>
              <span className="text-xs text-slate-400">/ month</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>150 Generations</strong> / month</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>High-Res <strong>2K &amp; 4K Ultra HD</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Radiance <strong>.HDR</strong> Export</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Full Commercial License</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Automatic Seam Healing</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-medium text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            Upgrade to Pro
          </button>
        </div>

        {/* Studio / Enterprise */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Studio Studio</span>
              </div>
              <div className="text-xs text-slate-500">For studios &amp; pipeline integration</div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-white">
                {billingCycle === 'yearly' ? '$29.9' : '$49.9'}
              </span>
              <span className="text-xs text-slate-500">/ month</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>500 Generations</strong> / month</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Full <strong>Developer REST API</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Batch Invoice / CSV uploads</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Priority Dedicated GPU Pool</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl transition-colors cursor-pointer"
          >
            Contact Sales
          </button>
        </div>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="space-y-4 pt-6 border-t border-slate-800/80">
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
                className="bg-slate-900/60 border border-slate-800/90 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full px-4 py-3 text-left text-xs font-medium text-slate-200 flex items-center justify-between gap-2 hover:text-white"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-3.5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/50 pt-2.5">
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
