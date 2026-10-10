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
  ExternalLink,
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
  GOOGLE_OFFICIAL_CONFIG,
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
    previewColor: 'from-pink-500 to-cyan-400',
  },
  {
    id: 'nature',
    name: 'Tropical Sunset',
    description: 'Golden hour coastline, crystal water reflections, palm trees, warm skies',
    promptSuffix: 'tropical island sunset, golden reflections on ocean waves, palm trees, purple clouds',
    previewColor: 'from-amber-400 to-orange-500',
  },
  {
    id: 'space',
    name: 'Cosmic Nebula',
    description: 'Deep space stars, swirling celestial dust, planets, stellar rings',
    promptSuffix: 'deep space nebula, purple and teal cosmic dust, glowing galaxies, ringed planet, stellar skybox',
    previewColor: 'from-cyan-400 to-blue-600',
  },
  {
    id: 'interior',
    name: 'Modern Penthouse',
    description: 'Floor-to-ceiling glass panoramic loft, oak flooring, architectural lighting',
    promptSuffix: 'luxury modern penthouse interior, floor-to-ceiling glass windows, evening city view, warm oak wood',
    previewColor: 'from-teal-500 to-sky-700',
  },
  {
    id: 'anime',
    name: 'Anime Ghibli',
    description: '日系治愈水彩手绘动漫，蓝天白云、沿海公路与温暖海风',
    promptSuffix: 'Japanese anime hand-drawn watercolor aesthetic, gentle coastal breeze, lush green summer grass, fluffy white clouds, warm natural sunlight, nostalgic peaceful anime scenery',
    previewColor: 'from-sky-400 via-teal-300 to-emerald-400',
  },
  {
    id: 'fantasy',
    name: 'Celestial Ruins',
    description: 'Floating ancient temple, enchanted glowing runes, aurora borealis sky',
    promptSuffix: 'ancient fantasy temple ruins, floating celestial stones, glowing magical runes, aurora sky',
    previewColor: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'custom',
    name: 'Pure Custom',
    description: '纯净输入模式，不追加任何风格后缀，完全遵循自定义提示词',
    promptSuffix: '',
    previewColor: 'from-slate-500 to-slate-700',
  },
];

const PROMPT_SUGGESTIONS = [
  '日系治愈手绘水彩动漫风，一个红衣小女孩骑着自行车吹着海风，一边是蔚蓝大海和沿海公路，阳光明媚，满天蓬松白云',
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
      message: '已载入本地 8317 推荐配置 (gemini-3.1-flash-image)！支持谷歌大模型直接生图。',
    });
  };

  const handleLoadGoogleOfficial = () => {
    const isAlreadyGoogle = geminiConfig.baseUrl.includes('googleapis.com');
    const newCfg: GeminiConfig = {
      ...GOOGLE_OFFICIAL_CONFIG,
      apiKey: isAlreadyGoogle ? geminiConfig.apiKey : '',
    };
    setGeminiConfig(newCfg);
    setTestConnResult({
      success: true,
      message: '已切换为 Google AI Studio 官方直连模式！请在下方填入以 AIzaSy 开头的 API Key。',
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="glass-panel border border-cyan-400/30 rounded-3xl max-w-md w-full p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-2 text-white">
                <div className="p-1.5 bg-cyan-500/20 text-cyan-300 rounded-lg">
                  <Settings2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-cyan-100">AI Model &amp; Local Proxy Settings</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="w-7 h-7 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Dual Preset Switcher */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleLoadGoogleOfficial}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    geminiConfig.baseUrl.includes('googleapis.com')
                      ? 'bg-gradient-to-br from-teal-950/80 to-blue-950/80 border-teal-400/60 shadow-[0_0_15px_rgba(20,184,166,0.2)]'
                      : 'bg-[#030d1d] border-cyan-500/20 hover:border-cyan-400/40 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-teal-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Google 官方直连
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-teal-400/20 text-teal-200 rounded font-mono font-bold">
                      Imagen 3
                    </span>
                  </div>
                  <div className="text-[10.5px] text-teal-200/70">
                    原生 Google AI Studio 直连，画质顶级
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleLoad8317Default}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    geminiConfig.baseUrl.includes('8317')
                      ? 'bg-gradient-to-br from-cyan-950/80 to-blue-950/80 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'bg-[#030d1d] border-cyan-500/20 hover:border-cyan-400/40 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-cyan-300 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      本地 8317 代理
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-cyan-400/20 text-cyan-200 rounded font-mono font-bold">
                      CLI Proxy
                    </span>
                  </div>
                  <div className="text-[10.5px] text-cyan-200/70">
                    调用本地 8317 端口转接 ChatGPT 绘图
                  </div>
                </button>
              </div>

              <div>
                <label className="block text-cyan-200 font-semibold mb-1">
                  API Base URL
                </label>
                <input
                  type="text"
                  value={geminiConfig.baseUrl}
                  onChange={(e) => setGeminiConfig({ ...geminiConfig, baseUrl: e.target.value })}
                  placeholder="https://generativelanguage.googleapis.com 或 http://127.0.0.1:8317"
                  className="w-full px-3.5 py-2.5 bg-[#030a17] border border-cyan-500/30 rounded-xl text-cyan-100 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 font-mono text-xs transition-all"
                />
                <p className="text-[11px] text-cyan-300/60 mt-1">
                  {geminiConfig.baseUrl.includes('googleapis.com') ? (
                    <span className="text-teal-300 flex items-center gap-1">
                      <span>✓ 官方直连模式 (无需本地代理软件)</span>
                    </span>
                  ) : (
                    <span>本地或第三方 OpenAI 兼容反向代理地址</span>
                  )}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-cyan-200 font-semibold">
                    API Key / Bearer Token
                  </label>
                  {geminiConfig.baseUrl.includes('googleapis.com') && (
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-teal-300 hover:text-teal-100 flex items-center gap-0.5 underline"
                    >
                      <span>免费获取 Google Key</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="password"
                  value={geminiConfig.apiKey}
                  onChange={(e) => setGeminiConfig({ ...geminiConfig, apiKey: e.target.value })}
                  placeholder={
                    geminiConfig.baseUrl.includes('googleapis.com')
                      ? '输入 Google AI Studio API Key (AIzaSy...)'
                      : '输入 8317 Proxy Authorization Bearer Token'
                  }
                  className="w-full px-3.5 py-2.5 bg-[#030a17] border border-cyan-500/30 rounded-xl text-cyan-100 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 font-mono text-xs transition-all"
                />
                <p className="text-[11px] text-cyan-300/60 mt-1">
                  Key 仅保存在您当前浏览器的本地 LocalStorage，不上传任何第三方。
                </p>
              </div>

              <div>
                <label className="block text-cyan-200 font-semibold mb-1">
                  Image Model Name
                </label>
                <input
                  type="text"
                  value={geminiConfig.model}
                  onChange={(e) => setGeminiConfig({ ...geminiConfig, model: e.target.value })}
                  placeholder={
                    geminiConfig.baseUrl.includes('googleapis.com')
                      ? 'imagen-3.0-generate-002'
                      : 'gpt-image-2.5'
                  }
                  className="w-full px-3.5 py-2.5 bg-[#030a17] border border-cyan-500/30 rounded-xl text-cyan-100 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 font-mono text-xs transition-all"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-cyan-300/70 font-semibold">推荐模型:</span>
                  {(geminiConfig.baseUrl.includes('googleapis.com')
                    ? ['imagen-3.0-generate-002', 'imagen-3.0-fast-generate-001']
                    : ['gemini-3.1-flash-image', 'gpt-image-2.5', 'grok-imagine-image-2.0']
                  ).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setGeminiConfig({ ...geminiConfig, model: m })}
                      className={`text-[10px] px-2 py-0.5 rounded-lg font-mono cursor-pointer transition-all ${
                        geminiConfig.model === m
                          ? 'bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-bold shadow-sm shadow-cyan-400/30'
                          : 'bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/20'
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
                      ? 'bg-teal-500/15 border-teal-400/40 text-teal-300'
                      : 'bg-red-500/15 border-red-500/40 text-red-300'
                  }`}
                >
                  <span className="shrink-0">{testConnResult.success ? '✓' : '⚠'}</span>
                  <span>{testConnResult.message}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-cyan-500/20">
              <button
                type="button"
                disabled={isTestingConn}
                onClick={handleTestConnection}
                className="px-3.5 py-2 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-200 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors"
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
                  className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shadow-lg shadow-cyan-400/25 active:scale-95 transition-all"
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
      <div className="lg:col-span-5 space-y-6 glass-panel rounded-3xl p-6 relative overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.6)]">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-52 h-52 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-400 via-teal-400 to-blue-600 rounded-2xl text-slate-950 shadow-lg shadow-cyan-400/30 font-black">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">AI 360° Generator</h2>
              <p className="text-xs text-cyan-300/70">Equirectangular VR &amp; Skybox Engine</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/40 text-cyan-300 flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00F2FE]" />
            2:1 STANDARD
          </span>
        </div>

        {/* Engine Switcher */}
        <div className="space-y-2 bg-[#030c1c]/80 border border-cyan-500/20 rounded-2xl p-3.5 shadow-inner relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-100 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Generation Engine</span>
            </span>
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer font-semibold"
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
                  ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_20px_rgba(0,242,254,0.3)]'
                  : 'bg-cyan-950/30 border-cyan-500/15 text-cyan-200/60 hover:text-white hover:bg-cyan-950/50'
              }`}
            >
              <div className="text-xs font-bold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-teal-300" />
                <span>Instant Engine</span>
              </div>
              <div className="text-[10px] text-cyan-300/60 mt-0.5">Procedural render, 0s delay</div>
            </button>

            <button
              type="button"
              onClick={() => setEngineMode('gemini')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                engineMode === 'gemini'
                  ? 'bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-cyan-400 text-white shadow-[0_0_20px_rgba(0,242,254,0.3)]'
                  : 'bg-cyan-950/30 border-cyan-500/15 text-cyan-200/60 hover:text-white hover:bg-cyan-950/50'
              }`}
            >
              <div className="text-xs font-bold flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-cyan-300" />
                <span>AI Model (8317)</span>
              </div>
              <div className="text-[10px] text-cyan-300/80 truncate mt-0.5 font-mono">
                {geminiConfig.model}
              </div>
            </button>
          </div>

          {engineMode === 'gemini' && (
            <div className="px-3 py-1.5 bg-cyan-950/50 border border-cyan-400/30 rounded-xl flex items-center justify-between text-[11px] text-cyan-200">
              <span className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#00F2FE]" />
                <span className="truncate">Connected: {geminiConfig.baseUrl}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowConfigModal(true)}
                className="text-cyan-400 hover:text-cyan-200 underline shrink-0 ml-2 cursor-pointer font-semibold"
              >
                Settings
              </button>
            </div>
          )}

          {configSavedToast && (
            <p className="text-[11px] text-teal-300 flex items-center gap-1 font-semibold">
              <Check className="w-3 h-3" /> Proxy configuration saved!
            </p>
          )}
        </div>

        {/* Prompt Input */}
        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <label htmlFor="prompt-input" className="text-xs font-bold text-cyan-100">
              Prompt Description
            </label>
            <button
              type="button"
              onClick={handleRandomPrompt}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-all cursor-pointer font-bold hover:scale-105 active:scale-95"
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
            className="w-full px-4 py-3 bg-[#030c1c]/90 border border-cyan-500/25 rounded-2xl text-sm text-cyan-100 placeholder-cyan-500/40 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all resize-none shadow-inner"
          />
        </div>

        {/* Style Presets */}
        <div className="space-y-2.5 relative z-10">
          <label className="text-xs font-bold text-cyan-100">Environment Style Preset</label>
          <div className="grid grid-cols-2 gap-2">
            {STYLE_PRESETS.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setSelectedStyle(style.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  selectedStyle === style.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_25px_rgba(0,242,254,0.35)]'
                    : 'bg-[#030c1c]/60 border-cyan-500/15 text-cyan-200/60 hover:border-cyan-400/40 hover:text-cyan-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">{style.name}</span>
                  <div
                    className={`w-3 h-3 rounded-full bg-gradient-to-r ${style.previewColor} shadow-sm group-hover:scale-110 transition-transform shadow-[0_0_8px_rgba(0,242,254,0.4)]`}
                  />
                </div>
                <p className="text-[10px] text-cyan-300/60 truncate">{style.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Resolution Tier & Seam Correction */}
        <div className="grid grid-cols-2 gap-3 pt-1 relative z-10">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-cyan-100">Output Resolution</label>
            <div className="flex items-center gap-1 bg-[#030c1c] p-1 border border-cyan-500/20 rounded-xl">
              {(['1K', '2K', '4K'] as ResolutionTier[]).map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => setResolution(res)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    resolution === res
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-400/30'
                      : 'text-cyan-300/60 hover:text-white'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-cyan-100">360° Seam Alignment</label>
            <button
              type="button"
              onClick={() => setSeamCorrection((prev) => !prev)}
              className={`w-full py-2 px-3.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                seamCorrection
                  ? 'bg-teal-500/15 border-teal-400/60 text-teal-300 shadow-[0_0_20px_rgba(13,242,201,0.25)]'
                  : 'bg-[#030c1c] border-cyan-500/20 text-cyan-400/60 hover:text-cyan-200'
              }`}
            >
              <span>Seamless Wrap</span>
              <CheckCircle2 className="w-4 h-4 text-teal-300" />
            </button>
          </div>
        </div>

        {/* API Error Box */}
        {apiError && (
          <div className="p-3.5 bg-red-950/50 border border-red-500/50 rounded-2xl text-xs text-red-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">API Generation Error:</p>
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
            className="shimmer-btn w-full py-4 bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-cyan-400/35 hover:shadow-cyan-400/60 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer tracking-wide"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>
                  {engineMode === 'gemini'
                    ? `Generating 360° skybox via ${geminiConfig.model}... (${generationProgress}%)`
                    : `Synthesizing 360° panorama... (${generationProgress}%)`}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current text-slate-950" />
                <span>
                  {engineMode === 'gemini' ? 'Generate 360° VR Panorama (AI)' : 'Generate 360° Panorama (Instant)'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Quick Benchmark Presets */}
        <div className="pt-3 border-t border-cyan-500/20 relative z-10">
          <span className="text-[10px] text-cyan-400/80 uppercase tracking-wider font-mono font-bold">
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
                className="px-2.5 py-1 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/20 hover:border-cyan-400/50 rounded-xl text-xs text-cyan-200 hover:text-white transition-all cursor-pointer font-medium"
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
        <div className="glass-panel border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,10,30,0.8)]">
          <div className="px-5 py-3.5 bg-[#030e20]/90 border-b border-cyan-500/20 flex items-center justify-between text-xs text-cyan-200">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00F2FE]" />
              <span className="font-bold text-white tracking-wide">Live 360° Viewport</span>
              <span className="text-cyan-400/60 hidden sm:inline">| Drag or swipe to look around</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-500/30">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>FOV: 75° (Interactive)</span>
            </div>
          </div>

          <div className="h-[480px] w-full relative bg-[#020712]">
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
            <div className="flex items-center justify-between mb-2 text-cyan-400 group-hover:text-cyan-300">
              <div className="p-1.5 bg-cyan-500/15 rounded-lg group-hover:scale-110 transition-transform">
                <Download className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 font-bold border border-cyan-500/20">
                PNG
              </span>
            </div>
            <div className="text-xs font-bold text-white">Download PNG</div>
            <div className="text-[10px] text-cyan-300/60 mt-0.5">2:1 Equirectangular</div>
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
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 font-bold border border-amber-500/20">
                .HDR
              </span>
            </div>
            <div className="text-xs font-bold text-white">Export Radiance</div>
            <div className="text-[10px] text-cyan-300/60 mt-0.5">Blender / Unreal Ready</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('cubemap')}
            className="glass-card p-3.5 rounded-2xl text-left cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2 text-teal-400 group-hover:text-teal-300">
              <div className="p-1.5 bg-teal-500/15 rounded-lg group-hover:scale-110 transition-transform">
                <Box className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-950/60 text-teal-300 font-bold border border-teal-500/20">
                6 FACES
              </span>
            </div>
            <div className="text-xs font-bold text-white">Slice Cubemap</div>
            <div className="text-[10px] text-cyan-300/60 mt-0.5">Unity / Game Skybox</div>
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
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 font-bold border border-emerald-500/20">
                3D
              </span>
            </div>
            <div className="text-xs font-bold text-white">Project to Globe</div>
            <div className="text-[10px] text-cyan-300/60 mt-0.5">Orbital 3D View</div>
          </button>
        </div>
      </div>
    </div>
  );
}
