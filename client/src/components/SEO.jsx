import { useEffect } from 'react';

const SITE_URL = 'https://tggolfcarts.com';
const DEFAULT_TITLE = 'TG Golf Carts | Key Biscayne, FL';

function setMetaTag(attr, key, content) {
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export default function SEO({ title, description, path = '/', noindex = false }) {
  useEffect(() => {
    document.title = title ? `${title} | TG Golf Carts` : DEFAULT_TITLE;

    if (description) {
      setMetaTag('name', 'description', description);
    }

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${SITE_URL}${path}`);

    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
  }, [title, description, path, noindex]);

  return null;
}
