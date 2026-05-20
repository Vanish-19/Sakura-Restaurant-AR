import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getPublicStaticPage } from '../services/staticPageApi.js';

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function mergeDeep(baseValue, localeValue) {
  if (localeValue === undefined || localeValue === null) return baseValue;

  if (Array.isArray(localeValue)) return localeValue;

  if (isPlainObject(baseValue) && isPlainObject(localeValue)) {
    const next = { ...baseValue };
    Object.entries(localeValue).forEach(([key, value]) => {
      next[key] = mergeDeep(next[key], value);
    });
    return next;
  }

  return localeValue;
}

function getLocalizedContent(content, language) {
  const baseContent = content || {};
  const localeKey = language === 'jpn' ? 'jpn' : language;
  const localeContent =
    baseContent?.translations?.[localeKey] ||
    baseContent?.locales?.[localeKey] ||
    baseContent?.i18n?.[localeKey];

  if (!localeContent || localeKey === 'vi') {
    return baseContent;
  }

  return mergeDeep(baseContent, localeContent);
}

export default function useStaticPageContent(slug, fallbackContent = {}) {
  const { i18n } = useTranslation();
  const [content, setContent] = useState(fallbackContent);

  useEffect(() => {
    let active = true;

    getPublicStaticPage(slug)
      .then((response) => {
        if (!active) return;
        const nextContent = response?.data?.content;
        if (nextContent && typeof nextContent === 'object') {
          setContent(nextContent);
        }
      })
      .catch(() => {
        if (active) setContent(fallbackContent);
      });

    return () => {
      active = false;
    };
  }, [slug, fallbackContent]);

  return useMemo(
    () => getLocalizedContent(content, i18n.resolvedLanguage || i18n.language || 'vi'),
    [content, i18n.language, i18n.resolvedLanguage],
  );
}
