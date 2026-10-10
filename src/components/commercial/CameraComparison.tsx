import { Sparkles, Camera, Check, X, ArrowRight, Zap } from 'lucide-react';

export function CameraComparison() {
  const comparisonRows = [
    {
      feature: 'Hardware Upfront Cost',
      aiValue: '$0 (Free credits to start)',
      aiGood: true,
      cameraValue: '$500 – $1,500+ (Insta360 / Ricoh Theta)',
      cameraGood: false,
    },
    {
      feature: 'Imagined / Fictional Worlds',
      aiValue: 'Unlimited (Cyberpunk, Sci-Fi, Fantasy, Mars)',
      aiGood: true,
      cameraValue: 'Impossible (Only existing physical places)',
      cameraGood: false,
    },
    {
      feature: 'Turnaround Time',
      aiValue: '~10–30 seconds per 360° panorama',
      aiGood: true,
      cameraValue: 'Hours (Travel, tripod setup, lighting, stitching)',
      cameraGood: false,
    },
    {
      feature: 'Tripod & Nadir Patching',
      aiValue: 'Automated (Zero tripod shadow or nadir patch)',
      aiGood: true,
      cameraValue: 'Manual Photoshop nadir stamp required',
      cameraGood: false,
    },
    {
      feature: 'Weather & Lighting Restrictions',
      aiValue: 'None (Render midnight, blizzard, sunset anytime)',
      aiGood: true,
      cameraValue: 'Strictly dependent on outdoor weather & sunlight',
      cameraGood: false,
    },
    {
      feature: 'Real-World Architectural Accuracy',
      aiValue: 'Generative artistic interpretation',
      aiGood: false,
      cameraValue: 'True 1:1 photogrammetry survey accuracy',
      cameraGood: true,
    },
  ];

  return (
    <section className="py-12 border-t border-cyan-500/15 relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Industry Paradigm Comparison</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI Panorama Generation vs. 360° Camera Capture
        </h2>
        <p className="text-sm text-cyan-200/70 mt-2">
          Two distinct paths to an equirectangular panorama. Here is how they stack up for game development, virtual tours, and creative world-building.
        </p>
      </div>

      <div className="max-w-4xl mx-auto glass-panel border border-cyan-500/25 rounded-2xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-12 bg-[#020b1c] border-b border-cyan-500/20 text-xs font-bold text-cyan-200 p-4">
          <div className="col-span-4 sm:col-span-5 text-slate-400 uppercase tracking-wider text-[11px]">
            Comparison Dimension
          </div>
          <div className="col-span-4 sm:col-span-4 text-cyan-400 flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PanoramaAI Studio</span>
          </div>
          <div className="col-span-4 sm:col-span-3 text-slate-400 flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" />
            <span>360° Hardware Camera</span>
          </div>
        </div>

        <div className="divide-y divide-cyan-500/10 text-xs">
          {comparisonRows.map((row, idx) => (
            <div key={idx} className="grid grid-cols-12 p-4 items-center hover:bg-cyan-950/20 transition-colors">
              <div className="col-span-4 sm:col-span-5 font-medium text-white text-[13px]">
                {row.feature}
              </div>
              
              <div className="col-span-4 sm:col-span-4 pr-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-[11px] ${
                    row.aiGood
                      ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-200'
                      : 'bg-slate-800/60 text-slate-400'
                  }`}
                >
                  {row.aiGood ? <Check className="w-3 h-3 text-cyan-400" /> : null}
                  <span>{row.aiValue}</span>
                </span>
              </div>

              <div className="col-span-4 sm:col-span-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] ${
                    row.cameraGood
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-900/60 text-slate-400 border border-slate-800'
                  }`}
                >
                  {row.cameraGood ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-slate-500" />}
                  <span>{row.cameraValue}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Summary Bar */}
        <div className="p-4 bg-gradient-to-r from-cyan-950/50 via-[#03112a] to-blue-950/50 border-t border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-cyan-200/80">
            <strong className="text-white">Summary:</strong> Physical cameras win on physical site surveys. AI generation wins completely on fictional concept art, speed, zero hardware cost, and limitless imagination.
          </p>
          <span className="shrink-0 font-bold text-cyan-400 flex items-center gap-1">
            <span>Ideal for Games &amp; VR</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </section>
  );
}
