import axios from 'axios';
import { env } from '../../config/env';
import type { TranslateBatchInput } from './translate.schema';

type TranslationItem = {
  source: string;
  translated: string;
};

type LibreTranslateResponse = {
  translatedText?: string;
};

const APP_TO_LIBRE_LANGUAGE: Record<string, string> = {
  'en-IN': 'en',
  'hi-IN': 'hi',
  'bn-IN': 'bn',
  'te-IN': 'te',
  'mr-IN': 'mr',
  'ta-IN': 'ta',
  'ur-IN': 'ur',
  'gu-IN': 'gu',
  'kn-IN': 'kn',
  'ml-IN': 'ml',
  'pa-IN': 'pa',
};

const SUPPORTED_LIBRE_LANGUAGES = new Set(Object.values(APP_TO_LIBRE_LANGUAGE));
const CACHE_LIMIT = 2500;
const TRANSLATION_TIMEOUT_MS = 8000;
const TRANSLATION_CONCURRENCY = 4;
const translationCache = new Map<string, string>();

function normalizeLanguage(code: string | undefined, fallback = 'en') {
  const normalized = code?.trim();

  if (!normalized) {
    return fallback;
  }

  const mapped = APP_TO_LIBRE_LANGUAGE[normalized];
  if (mapped) {
    return mapped;
  }

  return SUPPORTED_LIBRE_LANGUAGES.has(normalized) ? normalized : fallback;
}

function getCacheKey(sourceLanguage: string, targetLanguage: string, text: string) {
  return `${sourceLanguage}:${targetLanguage}:${text}`;
}

function rememberTranslation(key: string, value: string) {
  if (translationCache.size >= CACHE_LIMIT) {
    const oldestKey = translationCache.keys().next().value;
    if (oldestKey) {
      translationCache.delete(oldestKey);
    }
  }

  translationCache.set(key, value);
}

function getLibreTranslateEndpoint() {
  const baseUrl = env.LIBRETRANSLATE_URL?.trim();

  if (!baseUrl) {
    return null;
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  return normalizedBaseUrl.endsWith('/translate') ? normalizedBaseUrl : `${normalizedBaseUrl}/translate`;
}

async function translateOneText(sourceText: string, sourceLanguage: string, targetLanguage: string) {
  const endpoint = getLibreTranslateEndpoint();

  if (!endpoint || sourceLanguage === targetLanguage || !sourceText.trim()) {
    return sourceText;
  }

  try {
    const payload: {
      q: string;
      source: string;
      target: string;
      format: 'text';
      api_key?: string;
    } = {
      q: sourceText,
      source: sourceLanguage,
      target: targetLanguage,
      format: 'text',
    };

    if (env.LIBRETRANSLATE_API_KEY) {
      payload.api_key = env.LIBRETRANSLATE_API_KEY;
    }

    const response = await axios.post<LibreTranslateResponse>(endpoint, payload, {
      timeout: TRANSLATION_TIMEOUT_MS,
      headers: { 'Content-Type': 'application/json' },
    });
    const translatedText = response.data.translatedText;

    return typeof translatedText === 'string' && translatedText.trim() ? translatedText : sourceText;
  } catch {
    return sourceText;
  }
}

async function translateMissingTexts(texts: string[], sourceLanguage: string, targetLanguage: string) {
  for (let index = 0; index < texts.length; index += TRANSLATION_CONCURRENCY) {
    const chunk = texts.slice(index, index + TRANSLATION_CONCURRENCY);

    await Promise.all(
      chunk.map(async (sourceText) => {
        const key = getCacheKey(sourceLanguage, targetLanguage, sourceText);
        const translatedText = await translateOneText(sourceText, sourceLanguage, targetLanguage);
        rememberTranslation(key, translatedText);
      }),
    );
  }
}

export async function getBatchTranslations(input: TranslateBatchInput): Promise<TranslationItem[]> {
  const sourceLanguage = normalizeLanguage(input.sourceLanguage, 'en');
  const targetLanguage = normalizeLanguage(input.targetLanguage, 'en');

  if (targetLanguage === 'en' || sourceLanguage === targetLanguage || !getLibreTranslateEndpoint()) {
    return input.texts.map((source) => ({ source, translated: source }));
  }

  const uniqueTexts = Array.from(new Set(input.texts));
  const missingTexts = uniqueTexts.filter((sourceText) => {
    if (!sourceText.trim()) {
      return false;
    }

    const key = getCacheKey(sourceLanguage, targetLanguage, sourceText);
    return !translationCache.has(key);
  });

  await translateMissingTexts(missingTexts, sourceLanguage, targetLanguage);

  return input.texts.map((source) => {
    const key = getCacheKey(sourceLanguage, targetLanguage, source);
    return {
      source,
      translated: translationCache.get(key) ?? source,
    };
  });
}
