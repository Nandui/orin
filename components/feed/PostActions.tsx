'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from '@base-ui-components/react/menu';
import {
  Check,
  ExternalLink,
  Eye,
  Link2,
  MessageSquare,
  MoreHorizontal,
  Share2,
} from 'lucide-react';
import { formatCount } from '@/lib/utils';

// The feed item's action row. Every control does something real: open the
// story, share/copy a link (Web Share API with a clipboard fallback), open the
// original source, and a read-only view count.
export function PostActions({
  storyId,
  title,
  sourceUrl,
  views,
}: {
  storyId: string;
  title: string;
  sourceUrl: string;
  views: number;
}) {
  const [copied, setCopied] = useState(false);
  const detail = `/story/${storyId}`;

  function permalink() {
    return typeof window !== 'undefined'
      ? `${window.location.origin}${detail}`
      : detail;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(permalink());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function share() {
    const url = permalink();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    await copyLink();
  }

  const btn =
    'flex items-center gap-1.5 rounded-full p-2 text-neutral-500 transition-colors';

  return (
    <div className="mt-2 flex max-w-md items-center justify-between text-neutral-500">
      <Link
        href={detail}
        aria-label="Open story and analysis"
        className={`${btn} hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]`}
      >
        <MessageSquare className="h-[18px] w-[18px]" />
      </Link>

      <button
        type="button"
        onClick={share}
        aria-label="Share"
        className={`${btn} hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]`}
      >
        {copied ? (
          <Check className="h-[18px] w-[18px] text-green-400" />
        ) : (
          <Share2 className="h-[18px] w-[18px]" />
        )}
      </button>

      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Read at source"
        className={`${btn} hover:bg-green-500/10 hover:text-green-400`}
      >
        <ExternalLink className="h-[18px] w-[18px]" />
      </a>

      {views > 0 ? (
        <span className="flex items-center gap-1.5 px-2 text-[13px]">
          <Eye className="h-[18px] w-[18px]" />
          {formatCount(views)}
        </span>
      ) : (
        <span />
      )}

      <Menu.Root>
        <Menu.Trigger
          aria-label="More"
          className={`${btn} hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]`}
        >
          <MoreHorizontal className="h-[18px] w-[18px]" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={6} align="end" className="z-50">
            <Menu.Popup className="min-w-44 rounded-xl border border-[var(--line)] bg-[#16181c] p-1 text-sm text-neutral-200 shadow-xl shadow-black/50 outline-none">
              <Menu.Item
                onClick={copyLink}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 outline-none data-[highlighted]:bg-white/5"
              >
                <Link2 className="h-4 w-4" /> Copy link
              </Menu.Item>
              <Menu.Item
                onClick={() => window.open(sourceUrl, '_blank', 'noopener')}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 outline-none data-[highlighted]:bg-white/5"
              >
                <ExternalLink className="h-4 w-4" /> Open original source
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
  );
}
