-- Engagement comes from the original discussion (Reddit), Digg-style — not from
-- internal SPAWN activity. We reuse like_count (upvotes) and comment_count
-- (thread comments) for the numbers, and add the link + source here.

alter table stories add column if not exists discussion_url text;
alter table stories add column if not exists discussion_source text;
-- discussion_source: 'reddit' when a thread was found, 'none' once we've looked
-- and found nothing (so we don't re-query it every run), null = not yet checked.
