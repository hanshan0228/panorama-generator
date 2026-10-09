import { healPanoramaSeam } from './seamHealer';

export interface GeminiConfig {
  apiKey: string;
  baseUrl: string; // e.g. "http://localhost:8045" or "https://generativelanguage.googleapis.com"
  model: string;   // e.g. "imagen-3.0-generate-002" or "gemini-2.5-flash-image" / "gemini-pro-vision"
}

export const DEFAULT_GEMINI_CONFIG: GeminiConfig = {
  apiKey: '56ac8711b49a4d7db9cf4edffd3fc215',
  baseUrl: 'http://127.0.0.1:8317',
  model: 'gpt-image-2.5',
};

const GEMINI_CONFIG_STORAGE_KEY = 'panorama_gemini_config';

export function getStoredGeminiConfig(): GeminiConfig {
  try {
    const raw = localStorage.getItem(GEMINI_CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Automatically migrate from old placeholder 8045 or non-existent models to live 8317
      if (
        !parsed.baseUrl ||
        parsed.baseUrl.includes('8045') ||
        parsed.model === 'gemini-3-flash' ||
        parsed.model === 'imagen-3.0-generate-002'
      ) {
        return {
          ...DEFAULT_GEMINI_CONFIG,
          apiKey: parsed.apiKey || DEFAULT_GEMINI_CONFIG.apiKey,
        };
      }
      return { ...DEFAULT_GEMINI_CONFIG, ...parsed };
    }
  } catch {
    // fallback
  }
  return DEFAULT_GEMINI_CONFIG;
}

export function saveStoredGeminiConfig(config: GeminiConfig): void {
  try {
    localStorage.setItem(GEMINI_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // fallback
  }
}

/**
 * Test connectivity with local or remote proxy.
 */
export async function testProxyConnection(config: GeminiConfig): Promise<{
  success: boolean;
  models?: string[];
  message: string;
}> {
  const normalizedBase = (config.baseUrl || 'http://127.0.0.1:8317').replace(/\/+$/, '');
  const apiKey = config.apiKey.trim();
  const endpoint = normalizedBase.endsWith('/v1')
    ? `${normalizedBase}/models`
    : `${normalizedBase}/v1/models`;

  const headers: Record<string, string> = {};
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      if (res.status === 401) {
        return {
          success: false,
          message: 'Proxy returned 401 Unauthorized. Please check your API Key.',
        };
      }
      return {
        success: false,
        message: `Proxy returned HTTP ${res.status} error`,
      };
    }

    const data = await res.json();
    const models: string[] = Array.isArray(data.data)
      ? data.data.map((m: { id: string }) => m.id)
      : [];

    return {
      success: true,
      models,
      message: `Connected! ${models.length} models detected (Recommended: gpt-image-2.5).`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: `Cannot connect to ${normalizedBase}. Please ensure proxy server is running. (${err instanceof Error ? err.message : String(err)})`,
    };
  }
}

/**
 * Known artist / trademark keywords that trigger OpenAI DALL-E safety moderation blocks
 * (Code 400: "Your request was rejected by the safety system / moderation_blocked").
 * We automatically replace them with rich, safe, evocative artistic descriptors!
 */
const SAFETY_REPLACEMENTS: Array<{ pattern: RegExp; replacement: string }> = [
  {
    pattern: /宫崎骏(风格)?|吉卜力(工作室)?|hayao\s*miyazaki|studio\s*ghibli/gi,
    replacement: '经典日系治愈水彩手绘动漫风，唯美夏日天空与自然光影 (Japanese anime hand-drawn watercolor aesthetic, nostalgic summer breeze, lush green grass, fluffy white clouds, warm natural sunlight)',
  },
  {
    pattern: /新海诚(风格)?|makoto\s*shinkai/gi,
    replacement: '超精细唯美光影动漫风，璀璨天空与壮丽云彩 (vibrant atmospheric anime cinematic lighting, detailed cumulus clouds, high-contrast emotional sky)',
  },
  {
    pattern: /迪士尼(风格)?|disney(\s*animation)?/gi,
    replacement: '经典3D奇幻动画电影质感 (3D stylized animation cinematic render, magical atmosphere)',
  },
  {
    pattern: /皮克斯(风格)?|pixar(\s*animation)?/gi,
    replacement: '3D卡通CG动画电影质感 (3D animated feature film render, soft subsurface scattering)',
  },
];

export function sanitizePromptForSafety(rawPrompt: string): { sanitized: string; replaced: boolean } {
  let text = rawPrompt;
  let replaced = false;

  for (const item of SAFETY_REPLACEMENTS) {
    if (item.pattern.test(text)) {
      text = text.replace(item.pattern, item.replacement);
      replaced = true;
    }
  }

  return { sanitized: text, replaced };
}

/**
 * Builds a 360 VR Equirectangular skybox prompt with rigorous topological constraints.
 * Ensures the AI generates a full-bleed panoramic environment rather than a framed picture.
 */
export function buildPanoramaPrompt(userPrompt: string, styleSuffix = ''): string {
  const { sanitized } = sanitizePromptForSafety(userPrompt.trim());
  const suffix = styleSuffix ? `, ${styleSuffix}` : '';
  // Equirectangular 360 panoramic magic tokens:
  // Forbids borders, frames, vignettes, and circular fisheyes so the AI generates a true full-bleed 360 environment!
  return `${sanitized}${suffix}, full 360 degree equirectangular projection panorama, 360 spherical VR skybox, 2:1 ratio texture map, seamless horizontal wrap, highly detailed, photorealistic 8k environment, full frame edge to edge, no borders, no circular lens, no black frame, no vignettes`;
}

/**
 * Request real image generation via Gemini Imagen / OpenAI-compatible local proxy.
 * Supports both:
 * 1. Native Google AI Studio / Gemini endpoint format
 * 2. Standard OpenAI-compatible /v1/images/generations format often used by local proxy bridges (One-API, New-API, etc.)
 */
export async function generateWithGemini(
  prompt: string,
  config: GeminiConfig
): Promise<string> {
  const normalizedBase = (config.baseUrl || 'http://127.0.0.1:8317').replace(/\/+$/, '');
  const apiKey = (config.apiKey || '56ac8711b49a4d7db9cf4edffd3fc215').trim();
  const model = config.model.trim() || 'gpt-image-2.5';

  const isGoogleDirect = normalizedBase.includes('googleapis.com');
  let rawImageUrl: string | null = null;

  if (!isGoogleDirect) {
    // 1. Standard OpenAI-compatible /v1/images/generations (used by 8317 cli-proxy-api, One-API, etc.)
    const endpoint = normalizedBase.endsWith('/v1')
      ? `${normalizedBase}/images/generations`
      : `${normalizedBase}/v1/images/generations`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout for image diffusion

    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          model,
          prompt,
          n: 1,
          size: '1792x1024',
          response_format: 'b64_json',
        }),
      });

      // If the model rejects 1792x1024 due to size constraints, automatically retry with 1024x1024
      if (!res.ok && res.status === 400) {
        const errPeek = await res.clone().text();
        if (errPeek.toLowerCase().includes('size')) {
          res = await fetch(endpoint, {
            method: 'POST',
            headers,
            signal: controller.signal,
            body: JSON.stringify({
              model,
              prompt,
              n: 1,
              size: '1024x1024',
              response_format: 'b64_json',
            }),
          });
        }
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAbort = err instanceof Error && err.name === 'AbortError';
      throw new Error(
        isAbort
          ? 'Image generation timed out after 90s. The AI model took too long to compute. Please retry.'
          : `Failed to connect to proxy endpoint [${endpoint}]. Please check if proxy is active. (${err instanceof Error ? err.message : String(err)})`
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      const errText = await res.text();
      let parsedMsg = errText;
      let isSafetyBlock = false;
      try {
        const json = JSON.parse(errText);
        parsedMsg = json.error?.message || json.message || errText;
        if (json.error?.code === 'moderation_blocked' || parsedMsg.toLowerCase().includes('safety system')) {
          isSafetyBlock = true;
        }
      } catch {
        if (errText.toLowerCase().includes('safety system')) {
          isSafetyBlock = true;
        }
      }

      if (isSafetyBlock) {
        throw new Error(
          `提示词触发了 AI 平台的版权与内容安全审核 (Rejected by safety system) [HTTP 400]：\n\n` +
          `AI 模型（OpenAI）禁止在提示词中直接使用特定著名艺术家姓名（如“宫崎骏”、“吉卜力”）或商业 IP。\n\n` +
          `💡 解决建议：请避免直接写“宫崎骏”，系统已支持自动别名转换，或请手动改用画风描述（如“日系治愈水彩手绘风、夏日蓝天白云大海”，或直接选择“日系治愈动漫”预设）即可完美生成！`
        );
      }

      throw new Error(`Proxy error [HTTP ${res.status}]: ${parsedMsg}`);
    }

    const data = await res.json();
    if (data.data && data.data[0]) {
      const item = data.data[0];
      if (item.b64_json) {
        rawImageUrl = item.b64_json.startsWith('data:image')
          ? item.b64_json
          : `data:image/png;base64,${item.b64_json}`;
      } else if (item.url) {
        rawImageUrl = item.url;
      }
    }

    if (!rawImageUrl) {
      throw new Error(`No image data received from proxy. Response: ${JSON.stringify(data).slice(0, 160)}`);
    }
  } else {
    // 2. Google Native Imagen API format:
    // POST https://generativelanguage.googleapis.com/v1beta/models/{model}:predict?key={apiKey}
    const keyParam = apiKey ? `?key=${encodeURIComponent(apiKey)}` : '';
    const googleEndpoint = `${normalizedBase}/v1beta/models/${model}:predict${keyParam}`;

    const res = await fetch(googleEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '16:9',
          outputMimeType: 'image/png',
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google native API request failed [HTTP ${res.status}]: ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    const prediction = data.predictions?.[0];
    const b64 = prediction?.bytesBase64Encoded;

    if (!b64) {
      throw new Error('No image bytes received. Please check model name and API response.');
    }

    rawImageUrl = `data:image/png;base64,${b64}`;
  }

  // 3. Post-processing: Render full-bleed 2:1 equirectangular sphere (360° coverage, NO empty background borders!)
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const targetW = 2048;
        const targetH = 1024;
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // Fill 100% full-frame 360 degree sphere without any empty background borders!
          ctx.drawImage(img, 0, 0, targetW, targetH);
          // Heal the 360° horizontal wrap boundary so left and right seam connects seamlessly
          const healedCanvas = healPanoramaSeam(canvas, 140);
          resolve(healedCanvas.toDataURL('image/png'));
        } else {
          resolve(rawImageUrl as string);
        }
      } catch {
        resolve(rawImageUrl as string);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image texture into 360 viewer'));
    img.src = rawImageUrl as string;
  });
}
