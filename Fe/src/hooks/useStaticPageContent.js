import { useEffect, useState } from 'react';
import { getPublicStaticPage } from '../services/staticPageApi.js';

export default function useStaticPageContent(slug, fallbackContent = {}) {
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

  return content;
}
