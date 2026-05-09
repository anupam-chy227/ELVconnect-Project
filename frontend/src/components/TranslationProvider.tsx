"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/api";
import {
  applyDocumentLanguage,
  getLanguageByCode,
  getSavedLanguageCode,
  LANGUAGE_CHANGE_EVENT,
} from "@/lib/experience-preferences";
import { getLocalTranslation } from "@/lib/local-translations";

type TranslationResponse = {
  translations: Array<{
    source: string;
    translated: string;
  }>;
};

type TranslatableAttribute = "placeholder" | "aria-label" | "title" | "alt";

type TranslationTarget =
  | { kind: "text"; node: Text; source: string }
  | { kind: "attribute"; element: Element; attribute: TranslatableAttribute; source: string };

const CACHE_PREFIX = "elv-translation-cache-v2";
const MAX_CACHE_ENTRIES = 1200;
const REQUEST_BATCH_SIZE = 80;
const SCAN_DELAY_MS = 160;
const TRANSLATABLE_ATTRIBUTES: TranslatableAttribute[] = ["placeholder", "aria-label", "title", "alt"];

const TEXT_SKIP_SELECTOR = [
  "script",
  "style",
  "noscript",
  "code",
  "pre",
  "svg",
  "textarea",
  "select",
  "option",
  "input",
  "[contenteditable='true']",
  "[data-no-translate]",
  "[aria-hidden='true']",
  "[hidden]",
].join(",");

const ATTRIBUTE_SKIP_SELECTOR = [
  "script",
  "style",
  "noscript",
  "code",
  "pre",
  "svg",
  "[data-no-translate]",
  "[aria-hidden='true']",
  "[hidden]",
].join(",");

const PROTECTED_EXACT_TEXT = new Set([
  "ELV",
  "ELV Connect",
  "ELV Verse",
  "CCTV",
  "NVR",
  "DVR",
  "IP",
  "UPI",
  "GST",
  "KYC",
  "PAN",
  "API",
  "AMC",
  "BOQ",
  "SLA",
  "OTP",
  "ID",
  "QR",
  "GPS",
  "AI",
  "PDF",
  "CSV",
  "Ctrl K",
]);

function splitOuterWhitespace(value: string) {
  const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/);

  return {
    leading: match?.[1] ?? "",
    core: match?.[2] ?? value,
    trailing: match?.[3] ?? "",
  };
}

function normalizeSourceText(value: string) {
  return splitOuterWhitespace(value).core.replace(/\s+/g, " ").trim();
}

function isCodeLike(value: string) {
  return (
    /^[A-Z0-9_-]{2,}$/.test(value) ||
    /^[A-Z]{2,}[-_][A-Z0-9-]+$/.test(value) ||
    /^[a-z]+(_[a-z0-9]+)+$/.test(value) ||
    /^#[A-Z0-9-]{3,}$/i.test(value)
  );
}

function isSafeUiText(value: string) {
  const text = value.trim();

  if (text.length < 2 || text.length > 700) return false;
  if (!/\p{L}/u.test(text)) return false;
  if (PROTECTED_EXACT_TEXT.has(text)) return false;
  if (/^[\d\s.,:%/+()-]+$/.test(text)) return false;
  if (/^[₹$€£]\s?[\d,]+(?:\.\d+)?(?:\s?[A-Z]{2,3})?$/i.test(text)) return false;
  if (/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(text)) return false;
  if (/(https?:\/\/|www\.|\.com\b|\.in\b)/i.test(text)) return false;
  if (isCodeLike(text)) return false;

  return true;
}

function shouldSkipTextNode(node: Text) {
  const parent = node.parentElement;

  if (!parent) return true;
  if (parent.closest(TEXT_SKIP_SELECTOR)) return true;
  if (parent.classList.contains("material-symbols-outlined")) return true;

  return false;
}

function shouldSkipAttribute(element: Element, attribute: TranslatableAttribute) {
  if (element.closest(ATTRIBUTE_SKIP_SELECTOR)) return true;
  if (attribute === "alt" && element.closest("a[data-no-translate]")) return true;

  return false;
}

function loadCache(languageCode: string) {
  const cache = new Map<string, string>();

  if (typeof window === "undefined") {
    return cache;
  }

  try {
    const stored = localStorage.getItem(`${CACHE_PREFIX}:${languageCode}`);
    if (!stored) return cache;

    const parsed = JSON.parse(stored) as Record<string, unknown>;
    Object.entries(parsed).forEach(([source, translated]) => {
      if (typeof translated === "string") {
        cache.set(source, translated);
      }
    });
  } catch {
    localStorage.removeItem(`${CACHE_PREFIX}:${languageCode}`);
  }

  return cache;
}

function saveCache(languageCode: string, cache: Map<string, string>) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const entries = Array.from(cache.entries()).slice(-MAX_CACHE_ENTRIES);
    localStorage.setItem(`${CACHE_PREFIX}:${languageCode}`, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // Browser storage can be unavailable or full; translation should remain best effort.
  }
}

export default function TranslationProvider({ children }: { children: ReactNode }) {
  const [languageCode, setLanguageCode] = useState(() => getSavedLanguageCode());
  const observerRef = useRef<MutationObserver | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());
  const pendingSourcesRef = useRef<Set<string>>(new Set());
  const textOriginalsRef = useRef<WeakMap<Text, string>>(new WeakMap());
  const attributeOriginalsRef = useRef<WeakMap<Element, Map<TranslatableAttribute, string>>>(new WeakMap());
  const trackedTextNodesRef = useRef<Set<Text>>(new Set());
  const trackedAttributeElementsRef = useRef<Set<Element>>(new Set());
  const activeLanguageRef = useRef(languageCode);
  const isApplyingRef = useRef(false);

  useEffect(() => {
    const syncLanguage = () => {
      const nextLanguageCode = getSavedLanguageCode();
      applyDocumentLanguage(nextLanguageCode);
      setLanguageCode(nextLanguageCode);
    };

    syncLanguage();
    window.addEventListener(LANGUAGE_CHANGE_EVENT, syncLanguage);
    window.addEventListener("storage", syncLanguage);

    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, syncLanguage);
      window.removeEventListener("storage", syncLanguage);
    };
  }, []);

  useEffect(() => {
    const language = getLanguageByCode(languageCode);
    activeLanguageRef.current = language.code;
    applyDocumentLanguage(language.code);

    const clearScanTimer = () => {
      if (scanTimerRef.current) {
        window.clearTimeout(scanTimerRef.current);
        scanTimerRef.current = null;
      }
    };

    const restoreOriginals = () => {
      isApplyingRef.current = true;

      trackedTextNodesRef.current.forEach((node) => {
        const original = textOriginalsRef.current.get(node);
        if (!original || !node.isConnected) {
          trackedTextNodesRef.current.delete(node);
          return;
        }

        node.data = original;
      });

      trackedAttributeElementsRef.current.forEach((element) => {
        const attributes = attributeOriginalsRef.current.get(element);
        if (!attributes || !element.isConnected) {
          trackedAttributeElementsRef.current.delete(element);
          return;
        }

        attributes.forEach((original, attribute) => {
          element.setAttribute(attribute, original);
        });
      });

      window.requestAnimationFrame(() => {
        isApplyingRef.current = false;
      });
    };

    const applyTranslation = (target: TranslationTarget, translated: string) => {
      if (!translated || translated === target.source) {
        return;
      }

      if (target.kind === "text") {
        const original = textOriginalsRef.current.get(target.node);
        if (!original || !target.node.isConnected) return;

        const parts = splitOuterWhitespace(original);
        target.node.data = `${parts.leading}${translated}${parts.trailing}`;
        return;
      }

      if (!target.element.isConnected) return;
      target.element.setAttribute(target.attribute, translated);
    };

    const requestTranslations = async (sources: string[]) => {
      const sourceBatch = sources
        .filter((source) => !cacheRef.current.has(source) && !pendingSourcesRef.current.has(source))
        .slice(0, REQUEST_BATCH_SIZE);

      if (!sourceBatch.length) {
        return;
      }

      sourceBatch.forEach((source) => pendingSourcesRef.current.add(source));
      const requestLanguageCode = language.code;
      const resolveTranslation = (source: string, translated?: string) => {
        const remoteTranslation = translated?.trim() ? translated : "";

        if (remoteTranslation && remoteTranslation !== source) {
          return remoteTranslation;
        }

        return getLocalTranslation(requestLanguageCode, source);
      };

      try {
        const response = await apiClient.post<TranslationResponse>("/translate/batch", {
          targetLanguage: requestLanguageCode,
          sourceLanguage: "en",
          texts: sourceBatch,
        });

        if (activeLanguageRef.current !== requestLanguageCode) {
          return;
        }

        response.translations.forEach(({ source, translated }) => {
          cacheRef.current.set(source, resolveTranslation(source, translated));
        });
        saveCache(requestLanguageCode, cacheRef.current);
        scheduleScan();
      } catch {
        sourceBatch.forEach((source) => cacheRef.current.set(source, resolveTranslation(source)));
        saveCache(requestLanguageCode, cacheRef.current);
        scheduleScan();
      } finally {
        sourceBatch.forEach((source) => pendingSourcesRef.current.delete(source));
      }
    };

    const queueTarget = (source: string, target: TranslationTarget, requestSet: Set<string>) => {
      const cachedTranslation = cacheRef.current.get(source);

      if (cachedTranslation) {
        applyTranslation(target, cachedTranslation);
        return;
      }

      requestSet.add(source);
    };

    const scanDocument = () => {
      if (language.translateCode === "en" || isApplyingRef.current || !document.body) {
        return;
      }

      const requestSet = new Set<string>();
      isApplyingRef.current = true;

      const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
          if (!(node instanceof Text) || shouldSkipTextNode(node)) {
            return NodeFilter.FILTER_REJECT;
          }

          const source = normalizeSourceText(textOriginalsRef.current.get(node) ?? node.data);
          return isSafeUiText(source) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
      });

      let currentNode = textWalker.nextNode();
      while (currentNode) {
        const textNode = currentNode as Text;
        const original = textOriginalsRef.current.get(textNode) ?? textNode.data;
        textOriginalsRef.current.set(textNode, original);
        trackedTextNodesRef.current.add(textNode);

        const source = normalizeSourceText(original);
        queueTarget(source, { kind: "text", node: textNode, source }, requestSet);
        currentNode = textWalker.nextNode();
      }

      document.body.querySelectorAll<HTMLElement>("[placeholder],[aria-label],[title],[alt]").forEach((element) => {
        TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
          if (!element.hasAttribute(attribute) || shouldSkipAttribute(element, attribute)) {
            return;
          }

          const currentValue = element.getAttribute(attribute) ?? "";
          const existingAttributes = attributeOriginalsRef.current.get(element) ?? new Map<TranslatableAttribute, string>();
          const original = existingAttributes.get(attribute) ?? currentValue;
          const source = normalizeSourceText(original);

          if (!isSafeUiText(source)) {
            return;
          }

          existingAttributes.set(attribute, original);
          attributeOriginalsRef.current.set(element, existingAttributes);
          trackedAttributeElementsRef.current.add(element);
          queueTarget(source, { kind: "attribute", element, attribute, source }, requestSet);
        });
      });

      window.requestAnimationFrame(() => {
        isApplyingRef.current = false;
      });

      void requestTranslations(Array.from(requestSet));
    };

    function scheduleScan() {
      clearScanTimer();
      scanTimerRef.current = window.setTimeout(scanDocument, SCAN_DELAY_MS);
    }

    observerRef.current?.disconnect();
    clearScanTimer();
    restoreOriginals();
    cacheRef.current = loadCache(language.code);
    pendingSourcesRef.current.clear();

    if (language.translateCode === "en") {
      document.documentElement.removeAttribute("data-translation-language");
      return () => {
        clearScanTimer();
        observerRef.current?.disconnect();
      };
    }

    document.documentElement.setAttribute("data-translation-language", language.code);
    observerRef.current = new MutationObserver(() => {
      if (!isApplyingRef.current) {
        scheduleScan();
      }
    });
    observerRef.current.observe(document.body, {
      childList: true,
      characterData: true,
      attributes: true,
      subtree: true,
      attributeFilter: TRANSLATABLE_ATTRIBUTES,
    });
    scheduleScan();

    return () => {
      clearScanTimer();
      observerRef.current?.disconnect();
    };
  }, [languageCode]);

  return <>{children}</>;
}
