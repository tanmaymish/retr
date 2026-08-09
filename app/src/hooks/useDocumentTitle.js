import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} — Akshayvridhi` : 'Akshayvridhi';
    return () => {
      document.title = prev;
    };
  }, [title]);
}
