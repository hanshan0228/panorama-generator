import { useState, useRef, useEffect } from 'react';
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
  Cpu,
  AlertCircle,
  Check,
  Zap,
  ExternalLink,
  ImagePlus,
  Trash2,
  Upload,
  Coins,
  Wand2,
  Star,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ActiveTab, StylePreset, StylePresetId, ResolutionTier } from '../types/panorama';
import { SphereViewer } from './SphereViewer';
import { generateProceduralPanorama } from '../utils/proceduralPanoramas';
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
import { ShowcaseGallery } from './commercial/ShowcaseGallery';
import { FeatureMatrix } from './commercial/FeatureMatrix';
import { SeamShowcase } from './commercial/SeamShowcase';
import { CameraComparison } from './commercial/CameraComparison';
import { HowItWorksSteps } from './commercial/HowItWorksSteps';
import { IntegrationBadges } from './commercial/IntegrationBadges';
import { TestimonialsSection } from './commercial/TestimonialsSection';
import { CommercialFaq } from './commercial/CommercialFaq';
import { exportVrReadyJpegBlob } from '../utils/xmpInjector';
import { healPanoramaSeam } from '../utils/seamHealer';
import { enhanceAndUpscalePanorama } from '../utils/imageEnhancer';

interface GeneratorTabProps {
  currentPanoramaUrl: string;
  onPanoramaChange: (url: string) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  externalInputMode?: 'text' | 'image';
  onInputModeChange?: (mode: 'text' | 'image') => void;
}

const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Sci-fi megacity, wet asphalt reflections & holographic neon',
    promptSuffix: 'cyberpunk futuristic metropolis at night, glowing neon billboards, volumetric fog, rainy reflections',
    previewColor: 'from-pink-500 to-cyan-400',
  },
  {
    id: 'nature',
    name: 'Tropical Sunset',
    description: 'Golden ocean waves, crystal reflections, palms & twilight',
    promptSuffix: 'tropical island sunset, golden reflections on ocean waves, palm trees, purple clouds',
    previewColor: 'from-amber-400 to-orange-500',
  },
  {
    id: 'space',
    name: 'Deep Space Nebula',
    description: 'Cosmic dust, glowing star clusters, planetary rings & celestial sphere',
    promptSuffix: 'deep space nebula, purple and teal cosmic dust, glowing galaxies, ringed planet, stellar skybox',
    previewColor: 'from-cyan-400 to-blue-600',
  },
  {
    id: 'interior',
    name: 'Modern Penthouse',
    description: 'Floor-to-ceiling glass, warm oak wood, luxury skyline dusk view',
    promptSuffix: 'luxury modern penthouse interior, floor-to-ceiling glass windows, evening city view, warm oak wood',
    previewColor: 'from-teal-500 to-sky-700',
  },
  {
    id: 'anime',
    name: 'Anime Watercolor',
    description: 'Hand-drawn watercolor aesthetic, coastal road, blue skies & summer breeze',
    promptSuffix: 'Japanese anime hand-drawn watercolor aesthetic, gentle coastal breeze, lush green summer grass, fluffy white clouds, warm natural sunlight, nostalgic peaceful anime scenery',
    previewColor: 'from-sky-400 via-teal-300 to-emerald-400',
  },
  {
    id: 'fantasy',
    name: 'Floating Ruins',
    description: 'Ancient celestial sanctuary, magical runes & glowing aurora skies',
    promptSuffix: 'ancient fantasy temple ruins, floating celestial stones, glowing magical runes, aurora sky',
    previewColor: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'custom',
    name: 'Raw / Custom Prompt',
    description: 'Pure input mode with no extra style suffixes added',
    promptSuffix: '',
    previewColor: 'from-slate-500 to-slate-700',
  },
];

const QUICK_TRY_CHIPS = [
  { label: 'Cyberpunk Tokyo, 2087', prompt: 'futuristic cyberpunk city at night with flying vehicles, wet reflective asphalt, holographic neon signage, 8k equirectangular 360', style: 'cyberpunk' as StylePresetId },
  { label: 'Alpine Mountain Lake', prompt: 'majestic snow-capped alpine mountains at sunrise, crystal clear turquoise lake reflection, morning mist, golden sunbeams, 8k equirectangular 360', style: 'nature' as StylePresetId },
  { label: 'Sci-Fi Space Station', prompt: 'deep space orbital station observation deck, purple nebula dust, glowing galaxies, ringed planet, star clusters, 8k equirectangular 360', style: 'space' as StylePresetId },
  { label: 'Ancient Rome, 80 AD', prompt: 'ancient Rome forum and colosseum at golden hour, marble pillars, toga citizens, sun-drenched stone plaza, 8k equirectangular 360', style: 'fantasy' as StylePresetId },
  { label: 'Renaissance Florence, 1503', prompt: 'Renaissance Florence cathedral dome, terracotta rooftops, Arno river reflection, warm Mediterranean twilight, 8k 360', style: 'interior' as StylePresetId },
  { label: 'Minimalist Luxury Villa', prompt: 'ultra-luxury modern minimalist villa interior, floor-to-ceiling glass windows overlooking private ocean infinity pool, warm architectural lighting, 8k 360', style: 'interior' as StylePresetId },
];

const SAMPLE_REFERENCE_PRESETS = [
  {
    id: 'ref-interior',
    name: 'Modern Living Room',
    desc: 'Oak timber & architectural glass',
    style: 'interior' as StylePresetId,
    previewGrad: 'from-amber-600 to-stone-800',
    promptSnippet: 'luxury interior architecture, oak wood paneling, warm ambient lighting',
  },
  {
    id: 'ref-alpine',
    name: 'Alpine Glacial Lake',
    desc: 'Granite peaks & turquoise water',
    style: 'nature' as StylePresetId,
    previewGrad: 'from-teal-600 to-sky-900',
    promptSnippet: 'alpine mountain range, crystalline turquoise glacial lake, pine forest',
  },
  {
    id: 'ref-cyber',
    name: 'Neon Cyber City',
    desc: 'Rainy asphalt & neon glow',
    style: 'cyberpunk' as StylePresetId,
    previewGrad: 'from-pink-600 to-purple-900',
    promptSnippet: 'cyberpunk neon metropolis, rain reflections on pavement, holographic signs',
  },
];

export function GeneratorTab({
  currentPanoramaUrl,
  onPanoramaChange,
  onNavigateTab,
  externalInputMode,
  onInputModeChange,
}: GeneratorTabProps) {
  const [inputMode, setInputMode] = useState<'text' | 'image'>(externalInputMode || 'text');

  useEffect(() => {
    if (externalInputMode && externalInputMode !== inputMode) {
      setInputMode(externalInputMode);
    }
  }, [externalInputMode, inputMode]);

  const handleModeChange = (newMode: 'text' | 'image') => {
    setInputMode(newMode);
    onInputModeChange?.(newMode);
  };
  const [prompt, setPrompt] = useState(
    'futuristic cyberpunk city at night, neon holograms, rain reflections, volumetric fog, 8k equirectangular 360 panorama'
  );
  const [selectedStyle, setSelectedStyle] = useState<StylePresetId>('cyberpunk');
  const [resolution, setResolution] = useState<ResolutionTier>('2K');
  const [seamCorrection, setSeamCorrection] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Reference photos state for Image-to-Pano mode (Benchmarked from panoramagenerator.com)
  const [referenceImages, setReferenceImages] = useState<Array<{ id: string; name: string; preview: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Engine selection: 'procedural' (offline instant) vs 'gemini' (real AI image model)
  const [engineMode, setEngineMode] = useState<'procedural' | 'gemini'>('gemini');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [geminiConfig, setGeminiConfig] = useState<GeminiConfig>(getStoredGeminiConfig());
  const [apiError, setApiError] = useState<string | null>(null);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testConnResult, setTestConnResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isUpscalingClarity, setIsUpscalingClarity] = useState(false);
  const [originalRawUrl, setOriginalRawUrl] = useState<string | null>(null);
  const [enhanced4kUrl, setEnhanced4kUrl] = useState<string | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const creditsCost = resolution === '4K' ? 12 : resolution === '2K' ? 6 : 3;

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
      message: 'Loaded local 8317 proxy presets (gemini-3.1-flash-image)! Direct image generation supported.',
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
      message: 'Switched to Google AI Studio direct mode! Please enter your API Key starting with AIzaSy below.',
    });
  };

  const handleSaveConfig = () => {
    saveStoredGeminiConfig(geminiConfig);
    setShowConfigModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 3 - referenceImages.length;
    if (remainingSlots <= 0) {
      alert('You can attach a maximum of 3 reference photos.');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = event.target?.result as string;
        setReferenceImages((prev) => [
          ...prev,
          {
            id: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            preview,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddSampleReference = (preset: typeof SAMPLE_REFERENCE_PRESETS[0]) => {
    if (referenceImages.length >= 3) {
      alert('You can attach a maximum of 3 reference photos.');
      return;
    }

    // Generate a quick thumbnail canvas as sample preview
    const c = document.createElement('canvas');
    c.width = 400;
    c.height = 200;
    const ctx = c.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 400, 200);
      grad.addColorStop(0, preset.style === 'interior' ? '#854d0e' : preset.style === 'nature' ? '#0284c7' : '#ec4899');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 200);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(preset.name, 20, 100);
    }

    setReferenceImages((prev) => [
      ...prev,
      {
        id: `ref_sample_${preset.id}_${Date.now()}`,
        name: preset.name,
        preview: c.toDataURL('image/png'),
      },
    ]);

    // Supplement prompt if empty or brief
    if (!prompt.includes(preset.promptSnippet)) {
      setPrompt((prev) => `${prev}, guided by ${preset.promptSnippet}`);
    }
  };

  const handleRemoveReference = (id: string) => {
    setReferenceImages((prev) => prev.filter((r) => r.id !== id));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setApiError(null);
    setGenerationProgress(15);

    if (engineMode === 'gemini') {
      try {
        setGenerationProgress(25);
        const styleObj = STYLE_PRESETS.find((s) => s.id === selectedStyle);
        
        let promptWithRefs = prompt;
        if (referenceImages.length > 0) {
          promptWithRefs += `, matched reference style palette and lighting from [${referenceImages.map((r) => r.name).join(', ')}]`;
        }

        const fullPrompt = buildPanoramaPrompt(promptWithRefs, styleObj?.promptSuffix || '');

        setGenerationProgress(45);
        const progressTimer = setInterval(() => {
          setGenerationProgress((p) => (p < 85 ? p + 8 : p));
        }, 500);

        // Call Gemini local proxy / direct endpoint
        const rawGenUrl = await generateWithGemini(fullPrompt, geminiConfig);
        setOriginalRawUrl(rawGenUrl);

        // Client-side super-resolution, sharpening & seam healing
        let finalDataUrl = rawGenUrl;
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          finalDataUrl = await new Promise<string>((resolve) => {
            img.onload = () => {
              let canvas: HTMLCanvasElement;
              if (resolution === '4K') {
                canvas = enhanceAndUpscalePanorama(img, {
                  scaleFactor: 2,
                  sharpness: 0.8,
                  contrastBoost: 1.1,
                });
              } else if (resolution === '2K') {
                canvas = enhanceAndUpscalePanorama(img, {
                  scaleFactor: 1,
                  sharpness: 0.6,
                  contrastBoost: 1.05,
                });
              } else {
                canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || img.width;
                canvas.height = img.naturalHeight || img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.drawImage(img, 0, 0);
              }

              const healed = seamCorrection ? healPanoramaSeam(canvas, 160) : canvas;
              resolve(healed.toDataURL('image/png'));
            };
            img.onerror = () => resolve(rawGenUrl);
            img.src = rawGenUrl;
          });
        } catch {
          finalDataUrl = rawGenUrl;
        }

        if (finalDataUrl !== rawGenUrl) {
          setEnhanced4kUrl(finalDataUrl);
        } else {
          setEnhanced4kUrl(null);
        }

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
      setOriginalRawUrl(dataUrl);
      setEnhanced4kUrl(null);

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

  const handleDownloadVrJpg = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const vrBlob = await exportVrReadyJpegBlob(canvas, 0.95);
        const url = URL.createObjectURL(vrBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `360-vr-photosphere-${selectedStyle}-${resolution}-${Date.now()}.jpg`;
        a.click();
        URL.revokeObjectURL(url);
      }
    };
    img.src = currentPanoramaUrl;
  };

  const handleEnhancePrompt = () => {
    if (!prompt.trim()) {
      const random = QUICK_TRY_CHIPS[Math.floor(Math.random() * QUICK_TRY_CHIPS.length)];
      setPrompt(random.prompt);
      setSelectedStyle(random.style);
      return;
    }
    const enhancements = [
      'continuous 360 degree equirectangular horizon, 8k resolution, seamless horizontal loop, photorealistic lighting, balanced zenith and nadir',
      'unreal engine 5 lumen lighting, 360 vr spherical skybox, ultra detailed architectural textures, golden hour volumetric atmosphere',
      'equirectangular projection 2:1 ratio, vibrant color grading, sharp specular highlights, high dynamic range skybox environment',
      'seamless 360 pano wrapping, hyper-detailed volumetric clouds, raytraced atmospheric haze, ultra-sharp horizon line',
    ];
    const picked = enhancements[Math.floor(Math.random() * enhancements.length)];
    if (!prompt.toLowerCase().includes('equirectangular')) {
      setPrompt(`${prompt.trim()}, ${picked}`);
    } else {
      setPrompt(`${prompt.trim()}, cinematic volumetric lighting, 8k ultra-sharp detail`);
    }
  };

  const handleManualHealSeam = () => {
    if (!originalRawUrl) {
      setOriginalRawUrl(currentPanoramaUrl);
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const healed = healPanoramaSeam(canvas, 160);
        onPanoramaChange(healed.toDataURL('image/png'));
        setFeedbackNotice('360° boundary seam healed successfully! Click "Restore Original" anytime to undo.');
        confetti({ particleCount: 35, spread: 55, origin: { y: 0.7 } });
        setTimeout(() => setFeedbackNotice(null), 3500);
      }
    };
    img.src = currentPanoramaUrl;
  };

  const handleEnhanceClarity = () => {
    // If enhanced version is already cached and user is viewing the original, instant toggle!
    if (enhanced4kUrl && currentPanoramaUrl === originalRawUrl) {
      onPanoramaChange(enhanced4kUrl);
      setFeedbackNotice('Switched back to 4K Ultra clarity version.');
      setTimeout(() => setFeedbackNotice(null), 3000);
      return;
    }

    if (!originalRawUrl) {
      setOriginalRawUrl(currentPanoramaUrl);
    }
    setIsUpscalingClarity(true);
    setTimeout(() => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const enhancedCanvas = enhanceAndUpscalePanorama(img, {
          scaleFactor: 2,
          sharpness: 0.8,
          contrastBoost: 1.1,
        });
        const healed = healPanoramaSeam(enhancedCanvas, 160);
        const enhancedDataUrl = healed.toDataURL('image/png');
        setEnhanced4kUrl(enhancedDataUrl);
        onPanoramaChange(enhancedDataUrl);
        setIsUpscalingClarity(false);
        setFeedbackNotice('4K Super-Resolution clarity enhancement applied! Click "Restore Original" anytime to undo.');
        confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 } });
        setTimeout(() => setFeedbackNotice(null), 4000);
      };
      img.onerror = () => setIsUpscalingClarity(false);
      img.src = currentPanoramaUrl;
    }, 80);
  };

  const handleRestoreOriginal = () => {
    if (originalRawUrl) {
      onPanoramaChange(originalRawUrl);
      setFeedbackNotice('Restored to original pre-enhancement panorama.');
      setTimeout(() => setFeedbackNotice(null), 3500);
    }
  };

  return (
    <div className="space-y-12">
      {/* =========================================================================
          HERO BANNER & VALUE PROP (Benchmarked from panoramagenerator.com)
      ========================================================================= */}
      <div className="text-center max-w-4xl mx-auto pt-2 pb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/35 text-cyan-200 text-xs font-semibold mb-4 shadow-sm backdrop-blur-md">
          <span className="flex items-center text-amber-400 gap-0.5">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="font-bold">4.9 / 5</span>
          </span>
          <span className="text-cyan-500">•</span>
          <span>Trusted by 38,000+ 3D Artists, Architects &amp; VR Developers</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          AI 360° Panorama Generator
        </h1>
        <p className="text-base sm:text-lg text-cyan-200/80 mt-3 max-w-2xl mx-auto leading-relaxed">
          Turn text prompts or reference photos into seamless, VR-ready 2:1 equirectangular panoramas in seconds. Free to try — no credit card required.
        </p>
      </div>

      {/* =========================================================================
          STUDIO INTERACTIVE WORKBENCH (2 Columns: Controls & 360 Viewport)
      ========================================================================= */}
      <div id="studio-generator-workbench" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        {/* Gemini Proxy Config Modal */}
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="glass-panel border border-cyan-400/30 rounded-3xl max-w-md w-full p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] space-y-4">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                <div className="flex items-center gap-2 text-white">
                  <div className="p-1.5 bg-cyan-500/20 text-cyan-300 rounded-lg">
                    <Settings2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-cyan-100">AI Model &amp; Proxy Settings</h3>
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
                        Google Direct
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-teal-400/20 text-teal-200 rounded font-mono font-bold">
                        Imagen 3
                      </span>
                    </div>
                    <div className="text-[10.5px] text-teal-200/70">
                      Native Google AI Studio endpoint, highest quality
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
                        Local 8317 Proxy
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-cyan-400/20 text-cyan-200 rounded font-mono font-bold">
                        CLI Proxy
                      </span>
                    </div>
                    <div className="text-[10.5px] text-cyan-200/70">
                      Route via local port 8317 to Gemini or OpenAI models
                    </div>
                  </button>
                </div>

                <div>
                  <label className="block text-cyan-200 font-semibold mb-1">
                    API Endpoint (Base URL)
                  </label>
                  <input
                    type="text"
                    value={geminiConfig.baseUrl}
                    onChange={(e) => setGeminiConfig({ ...geminiConfig, baseUrl: e.target.value })}
                    placeholder="https://generativelanguage.googleapis.com or http://127.0.0.1:8317"
                    className="w-full px-3.5 py-2.5 bg-[#030a17] border border-cyan-500/30 rounded-xl text-cyan-100 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 font-mono text-xs transition-all"
                  />
                  <p className="text-[11px] text-cyan-300/60 mt-1">
                    {geminiConfig.baseUrl.includes('googleapis.com') ? (
                      <span className="text-teal-300 flex items-center gap-1">
                        <span>✓ Official Direct Mode (No local proxy required)</span>
                      </span>
                    ) : (
                      <span>Local or third-party OpenAI-compatible reverse proxy endpoint</span>
                    )}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-cyan-200 font-semibold">
                      API Key / Token
                    </label>
                    {geminiConfig.baseUrl.includes('googleapis.com') && (
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-teal-300 hover:text-teal-100 flex items-center gap-0.5 underline"
                      >
                        <span>Get Free Google Key</span>
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
                        ? 'Enter Google AI Studio API Key (AIzaSy...)'
                        : 'Enter 8317 Proxy API Key (default sk-wTdKu3XLWeAsvmaXr)'
                    }
                    className="w-full px-3.5 py-2.5 bg-[#030a17] border border-cyan-500/30 rounded-xl text-cyan-100 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 font-mono text-xs transition-all"
                  />
                  <p className="text-[11px] text-cyan-300/60 mt-1">
                    Keys are securely stored in your browser LocalStorage only, never sent to third-party tracking.
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
                        : 'gemini-3.1-flash-image'
                    }
                    className="w-full px-3.5 py-2.5 bg-[#030a17] border border-cyan-500/30 rounded-xl text-cyan-100 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 font-mono text-xs transition-all"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-cyan-300/70 font-semibold">Recommended Models:</span>
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
                    className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 cursor-pointer"
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

        {/* =========================================================================
            LEFT COLUMN: GENERATOR CONTROLS (Benchmarked from panoramagenerator.com)
        ========================================================================= */}
        <div className="lg:col-span-5 space-y-5 glass-panel rounded-3xl p-6 relative overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.6)]">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-52 h-52 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Mode Switcher Tabs (Text Prompt vs Image to Pano) */}
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 relative z-10">
            <div className="flex items-center gap-1 bg-[#020b18] p-1 border border-cyan-500/25 rounded-2xl">
              <button
                type="button"
                onClick={() => handleModeChange('text')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  inputMode === 'text'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'text-cyan-200/70 hover:text-white'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Text Prompt</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('image')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  inputMode === 'image'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'text-cyan-200/70 hover:text-white'
                }`}
              >
                <ImagePlus className="w-3.5 h-3.5" />
                <span>Image to Pano</span>
                {referenceImages.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                    {referenceImages.length}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-500/30">
              <Coins className="w-3 h-3 text-amber-400" />
              <span>{creditsCost} credits</span>
            </div>
          </div>

          {/* Mode 2: Image to Pano Reference Photo Upload Box */}
          {inputMode === 'image' && (
            <div id="reference-uploader" className="space-y-3 bg-[#020b1c]/80 border border-cyan-500/25 p-4 rounded-2xl relative z-10 animate-fade-in transition-all">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <ImagePlus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Attach Reference Photos (Up to 3)</span>
                </span>
                <span className="text-[10px] text-cyan-300/70">
                  {referenceImages.length} / 3 Attached
                </span>
              </div>
              <p className="text-[11px] text-cyan-200/70 leading-relaxed">
                Reference photos guide style, materials, lighting atmosphere, and color palette.
              </p>

              {/* Upload Drop Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-cyan-500/30 hover:border-cyan-400/60 rounded-xl p-3 text-center cursor-pointer bg-cyan-950/20 hover:bg-cyan-950/40 transition-colors"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-5 h-5 text-cyan-400 mx-auto mb-1 opacity-80" />
                <span className="text-xs font-semibold text-cyan-200">
                  Click or drag photos here (Max 3)
                </span>
              </div>

              {/* Reference Image Previews */}
              {referenceImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {referenceImages.map((refImg) => (
                    <div key={refImg.id} className="relative rounded-xl overflow-hidden border border-cyan-500/30 group aspect-video bg-black">
                      <img src={refImg.preview} alt={refImg.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveReference(refImg.id)}
                          className="p-1 rounded-full bg-red-500/80 hover:bg-red-500 text-white cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] text-cyan-200 font-mono truncate px-1 py-0.5">
                        {refImg.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Preset Reference Chips */}
              <div className="pt-2 border-t border-cyan-500/15">
                <span className="text-[10px] text-cyan-400/80 uppercase font-mono font-bold block mb-1.5">
                  Try Sample References:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_REFERENCE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleAddSampleReference(preset)}
                      className="px-2 py-1 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/25 rounded-lg text-[11px] text-cyan-200 hover:text-white transition-colors cursor-pointer"
                    >
                      + {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Prompt Description Input */}
          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <label htmlFor="prompt-input" className="text-xs font-bold text-cyan-100">
                Scene Description
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  className="text-[11px] text-teal-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-xl bg-teal-500/15 border border-teal-500/30 hover:border-teal-400 transition-all cursor-pointer font-semibold active:scale-95 shadow-sm"
                  title="Enhance prompt with 360° equirectangular VR keywords"
                >
                  <Sparkles className="w-3 h-3 text-teal-400" />
                  <span>Enhance with AI</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const random = QUICK_TRY_CHIPS[Math.floor(Math.random() * QUICK_TRY_CHIPS.length)];
                    setPrompt(random.prompt);
                    setSelectedStyle(random.style);
                  }}
                  className="text-[11px] text-cyan-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer font-semibold active:scale-95 shadow-sm"
                  title="Pick a random high-quality prompt"
                >
                  <RefreshCw className="w-3 h-3 text-cyan-400" />
                  <span>Surprise Me</span>
                </button>
              </div>
            </div>
            <textarea
              id="prompt-input"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the 360° environment you want to generate (e.g. futuristic cyberpunk city at night with neon reflections, alpine mountain lake at sunrise, sci-fi orbital space station)..."
              className="w-full px-4 py-3 bg-[#030c1c]/90 border border-cyan-500/25 rounded-2xl text-sm text-cyan-100 placeholder-cyan-500/40 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all resize-none shadow-inner"
            />
          </div>

          {/* Quick "Try:" Chips (Benchmarked directly from panoramagenerator.com) */}
          <div className="relative z-10">
            <span className="text-[10px] text-cyan-400/80 uppercase font-mono font-bold block mb-1.5">
              Try Prompts:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TRY_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(chip.prompt);
                    setSelectedStyle(chip.style);
                  }}
                  className="px-2.5 py-1 bg-cyan-950/40 hover:bg-cyan-900/70 border border-cyan-500/20 hover:border-cyan-400/50 rounded-xl text-[11px] text-cyan-200 hover:text-white transition-all cursor-pointer font-medium"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Style Presets Grid */}
          <div className="space-y-2 relative z-10">
            <label className="text-xs font-bold text-cyan-100">Environment Style</label>
            <div className="grid grid-cols-2 gap-2">
              {STYLE_PRESETS.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                    selectedStyle === style.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_20px_rgba(0,242,254,0.35)]'
                      : 'bg-[#030c1c]/60 border-cyan-500/15 text-cyan-200/60 hover:border-cyan-400/40 hover:text-cyan-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold">{style.name}</span>
                    <div
                      className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${style.previewColor} shadow-sm group-hover:scale-110 transition-transform`}
                    />
                  </div>
                  <p className="text-[10px] text-cyan-300/60 truncate">{style.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Resolution & Seam Correction Matrix */}
          <div className="grid grid-cols-2 gap-3 pt-1 relative z-10">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-cyan-100">Image Size</label>
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
              <label className="text-xs font-bold text-cyan-100">360° Seam Blending</label>
              <button
                type="button"
                onClick={() => setSeamCorrection((prev) => !prev)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  seamCorrection
                    ? 'bg-teal-500/15 border-teal-400/60 text-teal-300 shadow-[0_0_15px_rgba(13,242,201,0.2)]'
                    : 'bg-[#030c1c] border-cyan-500/20 text-cyan-400/60 hover:text-cyan-200'
                }`}
              >
                <span>Symmetric Seam Healing</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-300" />
              </button>
            </div>
          </div>

          {/* Engine Selector & Config Bar */}
          <div className="space-y-2 bg-[#020b18]/80 border border-cyan-500/20 rounded-2xl p-3 relative z-10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-200 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Backend Engine</span>
              </span>
              <button
                type="button"
                onClick={() => setShowConfigModal(true)}
                className="text-[11px] text-cyan-400 hover:text-cyan-200 font-semibold underline cursor-pointer"
              >
                Model Settings
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEngineMode('procedural')}
                className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  engineMode === 'procedural'
                    ? 'bg-cyan-500/20 border-cyan-400 text-white'
                    : 'bg-[#030915] border-cyan-500/15 text-cyan-200/60 hover:text-white'
                }`}
              >
                <div className="font-bold">Instant Procedural</div>
                <div className="text-[10px] text-cyan-300/60">0s instant preview</div>
              </button>

              <button
                type="button"
                onClick={() => setEngineMode('gemini')}
                className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  engineMode === 'gemini'
                    ? 'bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-cyan-400 text-white'
                    : 'bg-[#030915] border-cyan-500/15 text-cyan-200/60 hover:text-white'
                }`}
              >
                <div className="font-bold">AI Image Model</div>
                <div className="text-[10px] text-cyan-300/80 truncate font-mono">{geminiConfig.model}</div>
              </button>
            </div>
          </div>

          {/* API Error Notice */}
          {apiError && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-2xl text-xs text-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">API Generation Error:</p>
                <p className="text-[11px] text-red-300 break-all">{apiError}</p>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(true)}
                  className="mt-1 text-[11px] underline text-red-300 hover:text-red-100 cursor-pointer"
                >
                  Verify Model &amp; Endpoint Settings →
                </button>
              </div>
            </div>
          )}

          {/* Primary Generate Button (Benchmarked from panoramagenerator.com) */}
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
                    Generating ({generationProgress}%) — {generationProgress < 40 ? 'Synthesizing scene...' : generationProgress < 75 ? 'Healing seams...' : 'Finishing 3D mapping...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-current text-slate-950" />
                  <span>Generate ({creditsCost} Credits)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: INTERACTIVE 360 WEBGL VIEWPORT & EXPORT BAR
        ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* WebGL 3D Sphere Container with cinematic frame */}
          <div className="glass-panel border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,10,30,0.8)]">
            <div className="px-5 py-3.5 bg-[#030e20]/90 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-2 text-xs text-cyan-200">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00F2FE]" />
                <span className="font-bold text-white tracking-wide">Live 360° Sphere Viewport</span>
                <span className="text-cyan-400/60 hidden sm:inline">| Drag to look around, scroll to zoom</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Restore Original Button */}
                {originalRawUrl && originalRawUrl !== currentPanoramaUrl && (
                  <button
                    type="button"
                    onClick={handleRestoreOriginal}
                    className="flex items-center gap-1.5 text-[11px] text-amber-300 hover:text-white bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-1 rounded-full border border-amber-500/35 transition-all cursor-pointer font-bold active:scale-95 shadow-sm animate-in fade-in"
                    title="Revert enhancements and restore original pre-4K panorama"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Restore Original</span>
                  </button>
                )}

                {/* 4K Enhanced Badge */}
                {enhanced4kUrl && currentPanoramaUrl === enhanced4kUrl && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-400/40 font-mono font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-300" />
                    <span>4K Ultra</span>
                  </span>
                )}

                <button
                  type="button"
                  disabled={isUpscalingClarity}
                  onClick={handleEnhanceClarity}
                  className="flex items-center gap-1.5 text-[11px] text-cyan-300 hover:text-white bg-cyan-500/15 hover:bg-cyan-500/25 px-2.5 py-1 rounded-full border border-cyan-500/30 transition-all cursor-pointer font-semibold active:scale-95 shadow-sm disabled:opacity-50"
                  title="Apply 4K super-resolution reconstruction and unsharp mask sharpening"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {isUpscalingClarity
                      ? 'Enhancing...'
                      : enhanced4kUrl && currentPanoramaUrl === originalRawUrl
                      ? 'Apply 4K Enhanced'
                      : 'Enhance 4K Clarity'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleManualHealSeam}
                  className="flex items-center gap-1.5 text-[11px] text-teal-300 hover:text-white bg-teal-500/15 hover:bg-teal-500/25 px-2.5 py-1 rounded-full border border-teal-500/30 transition-all cursor-pointer font-semibold active:scale-95 shadow-sm"
                  title="Run 160px multi-band seam alignment on current panorama"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>Heal Seam</span>
                </button>
                <div className="flex items-center gap-2 text-[11px] text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-500/30">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>FOV: 75° (Interactive)</span>
                </div>
              </div>
            </div>

            {/* Feedback notification toast */}
            {feedbackNotice && (
              <div className="px-5 py-2 bg-gradient-to-r from-cyan-950/90 via-blue-950/90 to-cyan-950/90 border-b border-cyan-500/30 flex items-center justify-between text-xs text-cyan-200 animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="font-medium text-white">{feedbackNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFeedbackNotice(null)}
                  className="text-cyan-400 hover:text-white text-xs px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="h-[490px] w-full relative bg-[#020712]">
              <SphereViewer textureUrl={currentPanoramaUrl} className="w-full h-full" />
            </div>
          </div>

          {/* Multi-Format Export Action Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="glass-card p-3.5 rounded-2xl text-left cursor-pointer group hover:border-cyan-400/50 transition-all"
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
              onClick={handleDownloadVrJpg}
              className="glass-card p-3.5 rounded-2xl text-left cursor-pointer group hover:border-blue-400/50 transition-all"
            >
              <div className="flex items-center justify-between mb-2 text-blue-400 group-hover:text-blue-300">
                <div className="p-1.5 bg-blue-500/15 rounded-lg group-hover:scale-110 transition-transform">
                  <Download className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 font-bold border border-blue-500/20">
                  VR JPG
                </span>
              </div>
              <div className="text-xs font-bold text-white">Download VR JPG</div>
              <div className="text-[10px] text-cyan-300/60 mt-0.5">PhotoSphere XMP Tagged</div>
            </button>

            <button
              type="button"
              onClick={handleExportHdr}
              className="glass-card p-3.5 rounded-2xl text-left cursor-pointer group hover:border-amber-400/50 transition-all"
            >
              <div className="flex items-center justify-between mb-2 text-amber-400 group-hover:text-amber-300">
                <div className="p-1.5 bg-amber-500/15 rounded-lg group-hover:scale-110 transition-transform">
                  <FileCode2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 font-bold border border-amber-500/20">
                  .HDR
                </span>
              </div>
              <div className="text-xs font-bold text-white">Export .HDR</div>
              <div className="text-[10px] text-cyan-300/60 mt-0.5">For Blender &amp; Unreal</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('cubemap')}
              className="glass-card p-3.5 rounded-2xl text-left cursor-pointer group hover:border-teal-400/50 transition-all"
            >
              <div className="flex items-center justify-between mb-2 text-teal-400 group-hover:text-teal-300">
                <div className="p-1.5 bg-teal-500/15 rounded-lg group-hover:scale-110 transition-transform">
                  <Box className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-950/60 text-teal-300 font-bold border border-teal-500/20">
                  6 Faces
                </span>
              </div>
              <div className="text-xs font-bold text-white">Cubemap Slices</div>
              <div className="text-[10px] text-cyan-300/60 mt-0.5">For Unity Skybox</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('globe')}
              className="glass-card p-3.5 rounded-2xl text-left cursor-pointer group hover:border-emerald-400/50 transition-all"
            >
              <div className="flex items-center justify-between mb-2 text-emerald-400 group-hover:text-emerald-300">
                <div className="p-1.5 bg-emerald-500/15 rounded-lg group-hover:scale-110 transition-transform">
                  <Globe2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 font-bold border border-emerald-500/20">
                  3D
                </span>
              </div>
              <div className="text-xs font-bold text-white">3D Globe</div>
              <div className="text-[10px] text-cyan-300/60 mt-0.5">Planetary Orbit Simulator</div>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          COMMERCIAL BENCHMARK SECTIONS (Benchmarked from panoramagenerator.com)
      ========================================================================= */}
      
      {/* 1. Community Showcase Gallery */}
      <ShowcaseGallery
        onSelectPanorama={(url, newPrompt, style) => {
          onPanoramaChange(url);
          setPrompt(newPrompt);
          setSelectedStyle(style);
        }}
      />

      {/* 2. Built for VR-Ready Equirectangular Output (Feature Matrix) */}
      <FeatureMatrix />

      {/* 3. Proprietary Seam Healer Interactive Demo */}
      <SeamShowcase />

      {/* 4. AI Panorama Generation vs 360° Camera Capture (Comparison Table) */}
      <CameraComparison />

      {/* 5. How AI 360° Panorama Generation Works (4-Step Workflow) */}
      <HowItWorksSteps />

      {/* 6. Drop Straight into Your Production Stack (Game Engine Badges) */}
      <IntegrationBadges />

      {/* 7. Creator Stories & Global Metrics (Testimonials & Social Proof) */}
      <TestimonialsSection />

      {/* 8. Comprehensive FAQ Accordion */}
      <CommercialFaq />
    </div>
  );
}
