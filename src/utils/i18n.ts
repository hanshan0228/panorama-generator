export type SupportedLang = 'en' | 'ja' | 'de' | 'es' | 'zh';

export interface TranslationDictionary {
  brandStudio: string;
  tools: string;
  studio: string;
  viewer: string;
  cubemap: string;
  globe: string;
  pricing: string;
  upgradePro: string;
  freeCredits: string;
  
  // Studio Workbench
  heroTitle: string;
  heroSubtitle: string;
  promptLabel: string;
  promptPlaceholder: string;
  enhanceAi: string;
  surpriseMe: string;
  promptHelperTitle: string;
  generateBtn: string;
  generating: string;
  
  // Actions
  downloadPng: string;
  downloadVrJpg: string;
  exportHdr: string;
  exportVideo: string;
  cubemapSlices: string;
  embedViewer: string;
  healSeam: string;
  enhanceClarity: string;
  restoreOriginal: string;

  // Embed Modal
  embedTitle: string;
  embedSubtitle: string;
  copyCode: string;
  codeCopied: string;
  includeBacklink: string;
  autoRotate: string;
}

export const TRANSLATIONS: Record<SupportedLang, TranslationDictionary> = {
  en: {
    brandStudio: 'AI 360° Panorama & VR Skybox Engine',
    tools: 'Tools',
    studio: 'Studio',
    viewer: '360° Viewer',
    cubemap: 'Cubemap',
    globe: '3D Globe',
    pricing: 'Pricing',
    upgradePro: 'Upgrade to Pro',
    freeCredits: '50 Free Credits',

    heroTitle: 'AI 360° Panorama Generator',
    heroSubtitle: 'Turn text prompts or reference photos into seamless, VR-ready 2:1 equirectangular panoramas in seconds. Free to try — no credit card required.',
    promptLabel: 'Scene Description',
    promptPlaceholder: 'Describe the 360° environment you want to generate (e.g. futuristic cyberpunk city at night with neon reflections, alpine mountain lake at sunrise, sci-fi orbital space station)...',
    enhanceAi: 'Enhance with AI',
    surpriseMe: 'Surprise Me',
    promptHelperTitle: '360° Prompt Studio (Keyword Helper)',
    generateBtn: 'Generate',
    generating: 'Generating',

    downloadPng: 'Download PNG',
    downloadVrJpg: 'Download VR JPG',
    exportHdr: 'Export .HDR',
    exportVideo: 'Export Video',
    cubemapSlices: 'Cubemap Slices',
    embedViewer: 'Embed on Website',
    healSeam: 'Heal Seam',
    enhanceClarity: 'Enhance 4K Clarity',
    restoreOriginal: 'Restore Original',

    embedTitle: 'Embed Interactive 360° Viewer',
    embedSubtitle: 'Add this interactive 360° sphere directly to your WordPress, Webflow, Shopify, or portfolio site with responsive iframe embedding.',
    copyCode: 'Copy Embed Code',
    codeCopied: 'Embed Code Copied!',
    includeBacklink: 'Include "Powered by PanoramaAI" Badge',
    autoRotate: 'Enable Smooth Auto-Rotation',
  },
  ja: {
    brandStudio: 'AI 360度パノラマ ＆ VRスカイボックス生成エンジン',
    tools: 'ツール',
    studio: 'スタジオ',
    viewer: '360°ビューア',
    cubemap: 'キューブマップ',
    globe: '3D地球儀',
    pricing: '料金プラン',
    upgradePro: 'Proにアップグレード',
    freeCredits: '無料クレジット 50',

    heroTitle: 'AI 360度パノラマ画像生成',
    heroSubtitle: 'テキストや参照写真から数秒でVR対応のシームレスな2:1正距円筒図法パノラマを生成。クレジットカード不要で無料体験可能。',
    promptLabel: 'シーンの説明',
    promptPlaceholder: '生成したい360°の環境を入力してください（例：夜のサイバーパンク都市、日の出の高山湖、宇宙ステーションの展望デッキ）...',
    enhanceAi: 'AIでプロンプト強化',
    surpriseMe: 'おまかせ生成',
    promptHelperTitle: '360°プロンプトスタジオ（キーワード支援）',
    generateBtn: 'パノラマを生成',
    generating: '生成中',

    downloadPng: 'PNGダウンロード',
    downloadVrJpg: 'VR JPGダウンロード',
    exportHdr: '.HDR出力',
    exportVideo: '回転動画を出力',
    cubemapSlices: 'キューブマップ分割',
    embedViewer: 'Webサイトに埋め込み',
    healSeam: 'シーム補正',
    enhanceClarity: '4K超解像強化',
    restoreOriginal: '元画像に戻す',

    embedTitle: 'インタラクティブ360°ビューアの埋め込み',
    embedSubtitle: 'WordPress、Webflow、ポートフォリオサイト等にレスポンシブなiframeで360度ビューアを埋め込めます。',
    copyCode: '埋め込みコードをコピー',
    codeCopied: 'コードをコピーしました！',
    includeBacklink: '「Powered by PanoramaAI」バッジを表示',
    autoRotate: '自動回転を有効化',
  },
  de: {
    brandStudio: 'KI 360° Panorama & VR Skybox Generator',
    tools: 'Werkzeuge',
    studio: 'Studio',
    viewer: '360° Betrachter',
    cubemap: 'Cubemap',
    globe: '3D Globus',
    pricing: 'Preise',
    upgradePro: 'Auf Pro upgraden',
    freeCredits: '50 Gratis-Credits',

    heroTitle: 'KI 360° Panorama Generator',
    heroSubtitle: 'Verwandeln Sie Textbeschreibungen oder Fotos in nahtlose, VR-fähige 2:1 Panoramen in Sekundenschnelle. Kostenlos testen ohne Kreditkarte.',
    promptLabel: 'Szenenbeschreibung',
    promptPlaceholder: 'Beschreiben Sie die gewünschte 360°-Umgebung (z.B. futuristische Cyberpunk-Stadt bei Nacht, Gebirgssee bei Sonnenaufgang)...',
    enhanceAi: 'Mit KI verbessern',
    surpriseMe: 'Zufallsprompt',
    promptHelperTitle: '360° Prompt-Studio (Schlagwort-Helfer)',
    generateBtn: 'Generieren',
    generating: 'Wird generiert',

    downloadPng: 'PNG herunterladen',
    downloadVrJpg: 'VR JPG herunterladen',
    exportHdr: '.HDR exportieren',
    exportVideo: 'Video exportieren',
    cubemapSlices: 'Cubemap 6 Seiten',
    embedViewer: 'In Webseite einbetten',
    healSeam: 'Naht korrigieren',
    enhanceClarity: '4K Schärfe verbessern',
    restoreOriginal: 'Original wiederherstellen',

    embedTitle: 'Interaktiven 360°-Betrachter einbetten',
    embedSubtitle: 'Fügen Sie diese 360°-Ansicht mit einem responsiven Iframe direkt in Ihre WordPress-, Webflow- oder Shopify-Website ein.',
    copyCode: 'Code kopieren',
    codeCopied: 'Code kopiert!',
    includeBacklink: '„Powered by PanoramaAI“-Link einfügen',
    autoRotate: 'Sanfte Drehung aktivieren',
  },
  es: {
    brandStudio: 'Motor IA de Panoramas 360° y Skyboxes VR',
    tools: 'Herramientas',
    studio: 'Estudio',
    viewer: 'Visor 360°',
    cubemap: 'Cubemap',
    globe: 'Globo 3D',
    pricing: 'Precios',
    upgradePro: 'Actualizar a Pro',
    freeCredits: '50 Créditos Gratis',

    heroTitle: 'Generador de Panoramas 360° con IA',
    heroSubtitle: 'Convierte texto o fotos en panoramas esféricos 2:1 listos para RV en segundos. Pruébalo gratis sin tarjeta de crédito.',
    promptLabel: 'Descripción de la Escena',
    promptPlaceholder: 'Describe el entorno 360° que deseas generar (ej. metrópoli cyberpunk de noche, lago alpino al amanecer)...',
    enhanceAi: 'Mejorar con IA',
    surpriseMe: 'Sorpréndeme',
    promptHelperTitle: 'Estudio de Prompts 360° (Asistente de Palabras)',
    generateBtn: 'Generar',
    generating: 'Generando',

    downloadPng: 'Descargar PNG',
    downloadVrJpg: 'Descargar VR JPG',
    exportHdr: 'Exportar .HDR',
    exportVideo: 'Exportar Video',
    cubemapSlices: 'Caras Cubemap',
    embedViewer: 'Incrustar en Web',
    healSeam: 'Corregir Unión',
    enhanceClarity: 'Mejorar a 4K',
    restoreOriginal: 'Restaurar Original',

    embedTitle: 'Incrustar Visor 360° Interactivo',
    embedSubtitle: 'Añade este visor interactivo 360° directamente a tu sitio web mediante un iframe adaptable.',
    copyCode: 'Copiar Código',
    codeCopied: '¡Código Copiado!',
    includeBacklink: 'Incluir Enlace de Crédito',
    autoRotate: 'Habilitar Rotación Automática',
  },
  zh: {
    brandStudio: 'AI 360° 全景图与 VR Skybox 天空盒生成引擎',
    tools: '全部工具',
    studio: '生成工作台',
    viewer: '360° 预览器',
    cubemap: '六面盒切片',
    globe: '3D 拟真星球',
    pricing: '计费套餐',
    upgradePro: '升级到 Pro',
    freeCredits: '50 点免费额度',

    heroTitle: 'AI 360° 全景图与天空盒生成器',
    heroSubtitle: '几秒内将提示词或参考照片转换为无缝缝合的 2:1 球面等距柱状全景图。免费体验，无需信用卡。',
    promptLabel: '全景场景描述',
    promptPlaceholder: '描述您想要生成的 360° 环境（例如：赛博朋克夜景都市霓虹雨水倒影、日出高山冰川湖泊、深空轨道空间站）...',
    enhanceAi: 'AI 增强提示词',
    surpriseMe: '随机灵感',
    promptHelperTitle: '360° 提示词工作坊（高频关键词助手）',
    generateBtn: '立即生成全景',
    generating: '正在生成中',

    downloadPng: '下载 2:1 PNG',
    downloadVrJpg: '下载 VR JPG (带XMP)',
    exportHdr: '导出 32位 .HDR',
    exportVideo: '导出 360° 旋转视频',
    cubemapSlices: '切片 6 面体 ZIP',
    embedViewer: '嵌入到我的网站',
    healSeam: '缝合线渐变修复',
    enhanceClarity: '4K 超分辨率增强',
    restoreOriginal: '恢复初始图像',

    embedTitle: '一键将 360° 交互全景嵌入您的网站',
    embedSubtitle: '直接复制自适应 iframe 代码，轻松将此 360° 沉浸式全景视窗置入您的 WordPress、Shopify、独立站或作品集中。',
    copyCode: '复制嵌入代码 (iframe)',
    codeCopied: '嵌入代码已复制！',
    includeBacklink: '保留「Powered by PanoramaAI Studio」外链角标',
    autoRotate: '开启丝滑自动环绕旋转',
  },
};

const LANG_STORAGE_KEY = 'panorama_user_lang';

export function getStoredLanguage(): SupportedLang {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem(LANG_STORAGE_KEY) as SupportedLang | null;
  if (saved && (saved in TRANSLATIONS)) return saved;

  const browserLang = navigator.language?.toLowerCase() || '';
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('ja')) return 'ja';
  if (browserLang.startsWith('de')) return 'de';
  if (browserLang.startsWith('es')) return 'es';
  return 'en';
}

export function saveStoredLanguage(lang: SupportedLang): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  document.documentElement.lang = lang;
}

export function useI18n(lang: SupportedLang): TranslationDictionary {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}
