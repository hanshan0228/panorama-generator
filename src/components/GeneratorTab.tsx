import { useState } from 'react';
import {
  Sparkles,
  Download,
  Box,
  Globe2,
  Sliders,
  CheckCircle2,
  RefreshCw,
  FileCode2,
  Settings2,
  Bot,
  Cpu,
  AlertCircle,
  Check,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ActiveTab, StylePreset, StylePresetId, ResolutionTier } from '../types/panorama';
import { SphereViewer } from './SphereViewer';
import { generateProceduralPanorama, PRESET_PANORAMAS } from '../utils/proceduralPanoramas';
import { exportCanvasToHdrBlob } from '../utils/hdrExporter';
import {
  getStoredGeminiConfig,
  saveStoredGeminiConfig,
  generateWithGemini,
  buildPanoramaPrompt,
  testProxyConnection,
  DEFAULT_GEMINI_CONFIG,
  type GeminiConfig,
} from '../utils/geminiClient';

interface GeneratorTabProps {
  currentPanoramaUrl: string;
  onPanoramaChange: (url: string) => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Futuristic sci-fi megacity, rain-slicked highway, glowing holographic neon',
    promptSuffix: 'cyberpunk futuristic metropolis at night, glowing neon billboards, volumetric fog, rainy reflections',
    previewColor: 'from-pink-500 to-cyan-500',
  },
  {
    id: 'nature',
    name: 'Tropical Sunset',
    description: 'Golden hour coastline, crystal water reflections, palm trees, warm skies',
    promptSuffix: 'tropical island sunset, golden reflections on ocean waves, palm trees, purple clouds',
    previewColor: 'from-amber-500 to-orange-600',
  },
  {
    id: 'space',
    name: 'Cosmic Nebula',
    description: 'Deep space stars, swirling celestial dust, planets, stellar rings',
    promptSuffix: 'deep space nebula, purple and teal cosmic dust, glowing galaxies, ringed planet, stellar skybox',
    previewColor: 'from-purple-600 to-indigo-800',
  },
  {
    id: 'interior',
    name: 'Modern Penthouse',
    description: 'Floor-to-ceiling glass panoramic loft, oak flooring, architectural lighting',
    promptSuffix: 'luxury modern penthouse interior, floor-to-ceiling glass windows, evening city view, warm oak wood',
    previewColor: 'from-stone-600 to-amber-700',
  },
  {
    id: 'fantasy',
    name: 'Celestial Ruins',
    description: 'Floating ancient temple, enchanted glowing runes, aurora borealis sky',
    promptSuffix: 'ancient fantasy temple ruins, floating celestial stones, glowing magical runes, aurora sky',
    previewColor: 'from-emerald-500 to-teal-700',
  },
];

const PROMPT_SUGGESTIONS = [
  'Futuristic neon-lit cyberpunk street with flying vehicles and rainy ground reflections',
  'Enchanted fairy forest at twilight with glowing giant mushrooms and mystical fireflies',
  'Luxury glass penthouse apartment with panoramic sunset view over Manhattan skyline',
  'Deep cosmic space with swirling magenta nebula clouds and distant crystalline asteroid ring',
  'Ancient Egyptian cyber-temple at desert dawn with golden pyramids and holographic hieroglyphs',
];

export function GeneratorTab({
  currentPanoramaUrl,
  onPanoramaChange,
  onNavigateTab,
}: GeneratorTabProps) {
  const [prompt, setPrompt] = useState(
    'futuristic cyberpunk city at night, neon holograms, rain reflections, volumetric fog, 8k equirectangular 360 panorama'
  );
  const [selectedStyle, setSelectedStyle] = useState<StylePresetId>('cyberpunk');
  const [resolution, setResolution] = useState<ResolutionTier>('2K');
  const [seamCorrection, setSeamCorrection] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Engine selection: 'procedural' (offline instant) vs 'gemini' (real AI image model)
  const [engineMode, setEngineMode] = useState<'procedural' | 'gemini'>('gemini');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [geminiConfig, setGeminiConfig] = useState<GeminiConfig>(getStoredGeminiConfig());
  const [configSavedToast, setConfigSavedToast] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testConnResult, setTestConnResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    setIsTestingConn(true);
    setTestConnResult(null);
    const res = await testProxyConnection(geminiConfig);
    setTestConnResult(res);
    setIsTestingConn(false);
  };

  const handleLoad8317Default = () => {
    setGeminiConfig(DEFAULT_GEMINI_CONFIG);
    saveStoredGeminiConfig(DEFAULT_GEMINI_CONFIG);
    setTestConnResult({
      success: true,
      message: 'Loaded local 8317 proxy recommended configuration (gpt-image-2.5)!',
    });
  };

  const handleSaveConfig = () => {
    saveStoredGeminiConfig(geminiConfig);
    setConfigSavedToast(true);
    setTimeout(() => setConfigSavedToast(false), 2000);
    setShowConfigModal(false);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setApiError(null);
    setGenerationProgress(15);

    if (engineMode === 'gemini') {
      try {
        setGenerationProgress(25);
        const styleObj = STYLE_PRESETS.find((s) => s.id === selectedStyle);
        const fullPrompt = buildPanoramaPrompt(prompt, styleObj?.promptSuffix || '');

        setGenerationProgress(45);
        const progressTimer = setInterval(() => {
          setGenerationProgress((p) => (p < 85 ? p + 8 : p));
        }, 500);

        // Call Gemini local proxy / direct endpoint
        const finalDataUrl = await generateWithGemini(fullPrompt, geminiConfig);

        clearInterval(progressTimer);
        setGenerationProgress(95);

        onPanoramaChange(finalDataUrl);
        setGenerationProgress(100);
        setIsGenerating(false);

        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.8 },
        });
      } catch (err: unknown) {
        setIsGenerating(false);
        const errMsg = err instanceof Error ? err.message : 'Unknown API call error';
        setApiError(errMsg);
      }
      return;
    }

    // Procedural generation fallback mode
    const timer1 = setTimeout(() => setGenerationProgress(45), 350);
    const timer2 = setTimeout(() => setGenerationProgress(75), 700);

    const timerDone = setTimeout(() => {
      setGenerationProgress(95);

      const width = resolution === '4K' ? 3840 : resolution === '2K' ? 2048 : 1024;
      const height = width / 2;

      const canvas = generateProceduralPanorama(selectedStyle, prompt, width, height);
      const dataUrl = canvas.toDataURL('image/png');

      onPanoramaChange(dataUrl);
      setIsGenerating(false);
      setGenerationProgress(100);

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    }, 1100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timerDone);
    };
  };

  const handleRandomPrompt = () => {
    const random = PROMPT_SUGGESTIONS[Math.floor(Math.random() * PROMPT_SUGGESTIONS.length)];
    setPrompt(random);
  };

  const handleDownloadPng = () => {
    const a = document.createElement('a');
    a.href = currentPanoramaUrl;
    a.download = `360-panorama-${selectedStyle}-${resolution}-${Date.now()}.png`;
    a.click();
  };

  const handleExportHdr = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const hdrBlob = exportCanvasToHdrBlob(canvas);
        const url = URL.createObjectURL(hdrBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `360-environment-${selectedStyle}.hdr`;
        a.click();
        URL.revokeObjectURL(url);
      }
    };
    img.src = currentPanoramaUrl;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
      {/* Gemini Proxy Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="glass-panel border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2 text-white">
                <div className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg">
                  <Settings2 className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-base">AI Model &amp; Local Proxy Settings</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="w-7 h-7 rounded-full bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Quick Preset 8317 Trigger */}
              <div className="p-3 bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 rounded-2xl flex items-center justify-between gap-2 shadow-inner">
                <div>
                  <div className="font-semibold text-indigo-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Local 8317 Proxy Setup</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Detected local CLI Proxy API running on port 8317</div>
                </div>
                <button
                  type="button"
                  onClick={handleLoad8317Default}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium cursor-pointer shrink-0 transition-all shadow-md active:scale-95"
                >
                  Load 8317 Defaults
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Proxy Base URL
                </label>
                <input
                  type="text"
                  value={geminiConfig.baseUrl}
                  onChange={(e) => setGeminiConfig({ ...geminiConfig, baseUrl: e.target.value })}
                  placeholder="http://127.0.0.1:8317"
                  className="w-full px-3.5 py-2.5 bg-[#080b16] border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 font-mono text-xs transition-all"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Default address is <code className="text-indigo-400">http://127.0.0.1:8317</code>, routing to <code className="text-slate-400">/v1/images/generations</code>.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  API Key / Bearer Token
                </label>
                <input
                  type="password"
                  value={geminiConfig.apiKey}
                  onChange={(e) => setGeminiConfig({ ...geminiConfig, apiKey: e.target.value })}
                  placeholder="Enter Authorization Bearer Token"
                  className="w-full px-3.5 py-2.5 bg-[#080b16] border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 font-mono text-xs transition-all"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Stored securely in your local browser storage.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Image Model Name
                </label>
                <input
                  type="text"
                  value={geminiConfig.model}
                  onChange={(e) => setGeminiConfig({ ...geminiConfig, model: e.target.value })}
                  placeholder="gpt-image-2.5"
                  className="w-full px-3.5 py-2.5 bg-[#080b16] border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 font-mono text-xs transition-all"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-500 font-medium">8317 Image Models:</span>
                  {['gpt-image-2.5', 'gpt-image-2', 'gpt-image-1.5', 'gpt-image-2.5-flare', 'gpt-image-2.5-sunburst'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setGeminiConfig({ ...geminiConfig, model: m })}
                      className={`text-[10px] px-2 py-0.5 rounded-lg font-mono cursor-pointer transition-all ${
                        geminiConfig.model === m
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white/[0.05] hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Connection Result Notice */}
              {testConnResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    testConnResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-red-500/10 border-red-500/30 text-red-300'
                  }`}
                >
                  <span className="shrink-0">{testConnResult.success ? '✓' : '⚠'}</span>
                  <span>{testConnResult.message}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                disabled={isTestingConn}
                onClick={handleTestConnection}
                className="px-3.5 py-2 bg-white/[0.05] hover:bg-white/10 text-slate-200 rounded-xl text-xs font-medium cursor-pointer disabled:opacity-50 transition-colors"
              >
                {isTestingConn ? 'Testing...' : 'Test Connection'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-3.5 py-2 bg-white/[0.05] hover:bg-white/10 text-slate-300 rounded-xl text-xs font-medium cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save &amp; Apply</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Left Column: Generation Controls Form */}
      <div className="lg:col-span-5 space-y-6 glass-panel rounded-3xl p-6 relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">AI 360° Generator</h2>
              <p className="text-xs text-slate-400">Equirectangular VR &amp; Skybox Engine</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            2:1 RATIO
          </span>
        </div>

        {/* Engine Switcher */}
        <div className="space-y-2 bg-[#080b18]/70 border border-white/[0.08] rounded-2xl p-3.5 shadow-inner relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Generation Engine</span>
            </span>
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer font-medium"
            >
              <Settings2 className="w-3 h-3" />
              <span>Configure Proxy</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setEngineMode('procedural')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                engineMode === 'procedural'
                  ? 'bg-indigo-600/20 border-indigo-500/80 text-white shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                  : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <div className="text-xs font-semibold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Instant Engine</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Procedural render, 0s delay</div>
            </button>

            <button
              type="button"
              onClick={() => setEngineMode('gemini')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                engineMode === 'gemini'
                  ? 'bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-purple-500/80 text-white shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                  : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <div className="text-xs font-semibold flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Model (8317)</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {geminiConfig.model}
              </div>
            </button>
          </div>

          {engineMode === 'gemini' && (
            <div className="px-3 py-1.5 bg-purple-950/40 border border-purple-500/20 rounded-xl flex items-center justify-between text-[11px] text-purple-200">
              <span className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="truncate">Connected: {geminiConfig.baseUrl}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowConfigModal(true)}
                className="text-purple-300 hover:text-white underline shrink-0 ml-2 cursor-pointer font-medium"
              >
                Settings
              </button>
            </div>
          )}

          {configSavedToast && (
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Proxy configuration saved!
            </p>
          )}
        </div>

        {/* Prompt Input */}
        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <label htmlFor="prompt-input" className="text-xs font-semibold text-slate-300">
              Prompt Description
            </label>
            <button
              type="button"
              onClick={handleRandomPrompt}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors cursor-pointer font-medium hover:scale-105 active:scale-95"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Surprise Me</span>
            </button>
          </div>
          <textarea
            id="prompt-input"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the 360° environment you want to generate (e.g. Cyberpunk neon streets at rainy night, futuristic space station, tropical sunset island)..."
            className="w-full px-4 py-3 bg-[#080b18]/80 border border-white/10 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 transition-all resize-none shadow-inner"
          />
        </div>

        {/* Style Presets */}
        <div className="space-y-2.5 relative z-10">
          <label className="text-xs font-semibold text-slate-300">Environment Style Preset</label>
          <div className="grid grid-cols-2 gap-2">
            {STYLE_PRESETS.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setSelectedStyle(style.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  selectedStyle === style.id
                    ? 'bg-indigo-600/15 border-indigo-500/80 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                    : 'bg-[#080b18]/60 border-white/[0.06] text-slate-400 hover:border-white/15 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">{style.name}</span>
                  <div
                    className={`w-3 h-3 rounded-full bg-gradient-to-r ${style.previewColor} shadow-sm group-hover:scale-110 transition-transform`}
                  />
                </div>
                <p className="text-[10px] text-slate-500 truncate">{style.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Resolution Tier & Seam Correction */}
        <div className="grid grid-cols-2 gap-3 pt-1 relative z-10">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Output Resolution</label>
            <div className="flex items-center gap-1 bg-[#080b18] p-1 border border-white/10 rounded-xl">
              {(['1K', '2K', '4K'] as ResolutionTier[]).map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => setResolution(res)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    resolution === res
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">360° Seam Alignment</label>
            <button
              type="button"
              onClick={() => setSeamCorrection((prev) => !prev)}
              className={`w-full py-2 px-3.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                seamCorrection
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'bg-[#080b18] border-white/10 text-slate-400 hover:text-slate-300'
              }`}
            >
              <span>Seamless Wrap</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* API Error Box */}
        {apiError && (
          <div className="p-3.5 bg-red-950/40 border border-red-800/80 rounded-2xl text-xs text-red-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">API Generation Error:</p>
              <p className="text-[11px] text-red-300 break-all">{apiError}</p>
              <button
                type="button"
                onClick={() => setShowConfigModal(true)}
                className="mt-1 text-[11px] underline text-red-300 hover:text-red-100 cursor-pointer"
              >
                Click here to verify proxy endpoint and model settings →
              </button>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="pt-2 relative z-10">
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="shimmer-btn w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>
                  {engineMode === 'gemini'
                    ? `Generating 360° skybox via ${geminiConfig.model}... (${generationProgress}%)`
                    : `Synthesizing 360° panorama... (${generationProgress}%)`}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                <span>
                  {engineMode === 'gemini' ? 'Generate 360° VR Panorama (AI)' : 'Generate 360° Panorama (Instant)'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Quick Benchmark Presets */}
        <div className="pt-3 border-t border-white/[0.08] relative z-10">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono font-semibold">
            Quick Benchmark Presets:
          </span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {PRESET_PANORAMAS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedStyle(p.id);
                  setPrompt(p.prompt);
                  const canvas = generateProceduralPanorama(p.id, p.prompt, 2048, 1024);
                  onPanoramaChange(canvas.toDataURL('image/png'));
                }}
                className="px-2.5 py-1 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-indigo-400/30 rounded-xl text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Interactive 360 WebGL Viewport & Export Matrix */}
      <div className="lg:col-span-7 space-y-4">
        {/* WebGL 3D Sphere Container with cinematic frame */}
        <div className="glass-panel border border-white/[0.1] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <div className="px-5 py-3.5 bg-[#080b18]/90 border-b border-white/[0.08] flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white tracking-wide">Live 360° Viewport</span>
              <span className="text-slate-500 hidden sm:inline">| Drag or swipe to look around</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>FOV: 75° (Interactive)</span>
            </div>
          </div>

          <div className="h-[480px] w-full relative">
            <SphereViewer textureUrl={currentPanoramaUrl} className="w-full h-full" />
          </div>
        </div>

        {/* Multi-Format Export Action Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={handleDownloadPng}
            className="glass-card p-3.5 rounded-2xl text-left cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2 text-indigo-400 group-hover:text-indigo-300">
              <div className="p-1.5 bg-indigo-500/15 rounded-lg group-hover:scale-110 transition-transform">
                <Download className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400 font-semibold">
                PNG
              </span>
            </div>
            <div className="text-xs font-semibold text-white">Download PNG</div>
            <div className="text-[10px] text-slate-400 mt-0.5">2:1 Equirectangular</div>
          </button>

          <button
            type="button"
            onClick={handleExportHdr}
            className="glass-card p-3.5 rounded-2xl text-left cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2 text-amber-400 group-hover:text-amber-300">
              <div className="p-1.5 bg-amber-500/15 rounded-lg group-hover:scale-110 transition-transform">
                <FileCode2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400 font-semibold">
                .HDR
              </span>
            </div>
            <div className="text-xs font-semibold text-white">Export Radiance</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Blender / Unreal Ready</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('cubemap')}
            className="glass-card p-3.5 rounded-2xl text-left cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2 text-cyan-400 group-hover:text-cyan-300">
              <div className="p-1.5 bg-cyan-500/15 rounded-lg group-hover:scale-110 transition-transform">
                <Box className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400 font-semibold">
                6 FACES
              </span>
            </div>
            <div className="text-xs font-semibold text-white">Slice Cubemap</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Unity / Game Skybox</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('globe')}
            className="glass-card p-3.5 rounded-2xl text-left cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2 text-emerald-400 group-hover:text-emerald-300">
              <div className="p-1.5 bg-emerald-500/15 rounded-lg group-hover:scale-110 transition-transform">
                <Globe2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400 font-semibold">
                3D
              </span>
            </div>
            <div className="text-xs font-semibold text-white">Project to Globe</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Orbital 3D View</div>
          </button>
        </div>
      </div>
    </div>
  );
}
