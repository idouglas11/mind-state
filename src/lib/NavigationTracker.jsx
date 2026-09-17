import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Placeholder for Base44's built-in page-view tracker (not part of the PDF export).
export default function NavigationTracker() {
  const location = useLocation();
  useEffect(() => {
    // no-op: wire up real analytics here if needed
  }, [location]);
  return null;
}
