/** The chat log's inner padding (`p-3`), kept above a reply read from its top. */
export const LOG_PAD = 12;

interface ChatScrollInput {
  /** The log's visible height (`clientHeight`). */
  viewHeight: number;
  /** The log's full content height (`scrollHeight`). */
  contentHeight: number;
  /** The newest message's top, measured from the top of the log's content. */
  lastTop: number;
  /** The newest message's height. */
  lastHeight: number;
}

/**
 * Where the chat log scrolls after a new message: to the bottom, as chats
 * do, unless the newest message is taller than the room the log has (the
 * vehicle card on a phone). Then it is read from its top, so its picture
 * shows rather than only its last lines.
 */
export function chatScrollTop({
  viewHeight,
  contentHeight,
  lastTop,
  lastHeight,
}: ChatScrollInput): number {
  const bottom = Math.max(0, contentHeight - viewHeight);
  if (lastHeight <= viewHeight - LOG_PAD * 2) return bottom;
  return Math.min(bottom, Math.max(0, lastTop - LOG_PAD));
}
