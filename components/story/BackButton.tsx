'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

// Detail-page back control: returns to the previous view (preserving filter +
// scroll), falling back to Home when there's no in-app history.
export function BackButton() {
  const router = useRouter();

  function goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Back"
      className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-200 transition-colors hover:bg-white/10"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}
