import { type FormEvent, useEffect, useRef, useState } from "react";
import { chatScrollTop } from "./chatScroll";
import { type Ask, type LogLine, SCRIPTED_REPLY, SUGGESTIONS } from "./demo";
import { type ChatMessage } from "./useWayfinderDemo";
import { VehicleImage } from "./VehicleImage";
import { cn } from "@/lib/cn";

interface ChatMockProps {
  messages: ChatMessage[];
  typing: boolean;
  trace: LogLine[];
  /** A pill passes its `ask` (and so its route); typed text passes none. */
  onSend: (question: string, ask?: Ask) => void;
}

const BUBBLE =
  "max-w-[85%] shrink-0 rounded-[14px] px-[11px] py-2 leading-[1.4]";
const BOT = cn(BUBBLE, "rounded-bl-[4px] bg-chat-bubble");
const CARD =
  "max-w-[92%] shrink-0 overflow-hidden rounded-input border border-chat-card-line";
/** The vehicle card leads with its picture across the full width, as a car maker's listing does. */
const LISTING = cn(CARD, "w-full max-w-sm");
const CTA =
  "mt-[6px] inline-block border-b-[1.5px] border-current text-[12.5px] font-semibold";

function Reply({ message }: { message: ChatMessage }) {
  if (message.from === "me") {
    return (
      <div
        className={cn(
          BUBBLE,
          "self-end rounded-br-[4px] bg-chat-strong text-chat-surface",
        )}
      >
        {message.text}
      </div>
    );
  }
  switch (message.kind) {
    case "greeting":
      return (
        <div className={BOT}>
          Hello. I can help you find a car, book a test drive or price up
          finance.
        </div>
      );
    case "vehicle":
      return (
        <div className={LISTING}>
          <VehicleImage />
          <div className="px-[10px] py-2 text-[13px]">
            <strong className="block text-[14px]">Model 3-row (example)</strong>
            Seven seats, hybrid. From £XX,XXX.
            <br />
            <span className={CTA}>Book a test drive</span>
          </div>
        </div>
      );
    case "booking":
      return (
        <div className={BOT}>
          Happy to book that. Which model would you like to drive, and
          what&apos;s your postcode?
        </div>
      );
    case "explain":
      return (
        <div className={BOT}>
          A hybrid pairs a petrol engine with an electric motor and a small
          battery. It charges as you drive, so there&apos;s nothing to plug in.
        </div>
      );
    case "scripted":
      return <div className={BOT}>{SCRIPTED_REPLY}</div>;
    case "finance":
      return (
        <div className={CARD}>
          <div className="px-[10px] py-2 text-[13px]">
            <strong className="block text-[14px]">From £XXX a month</strong>
            XX months, £X,XXX deposit. Placeholder figures only.
            <br />
            <span className={CTA}>Get a personalised quote</span>
          </div>
        </div>
      );
    default:
      return null;
  }
}

/**
 * A stylised brand chat widget (white, as it would sit on a brand's site)
 * with scripted replies, plus the trace of the message's route.
 */
export function ChatMock({ messages, typing, trace, onSend }: ChatMockProps) {
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const last = list?.lastElementChild;
    if (!list || !last) return;
    const box = last.getBoundingClientRect();
    list.scrollTop = chatScrollTop({
      viewHeight: list.clientHeight,
      contentHeight: list.scrollHeight,
      lastTop: box.top - list.getBoundingClientRect().top + list.scrollTop,
      lastHeight: box.height,
    });
  }, [messages.length, typing]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSend(draft);
    setDraft("");
  };

  return (
    <div data-no-select="">
      {/* The page's amber focus ring is too faint on the white widget (1.6:1), so it draws in the widget's ink here. */}
      <div className="mt-[14px] flex h-[360px] flex-col overflow-hidden rounded-[16px] bg-chat-surface text-chat-ink shadow-float wide:h-[clamp(320px,calc(100svh-280px),480px)] [&_:focus-visible]:outline-chat-strong">
        <div className="flex items-center gap-[10px] border-b border-chat-line px-3 py-[10px]">
          <span
            aria-hidden="true"
            className="grid size-[26px] place-items-center rounded-pill bg-chat-strong"
          >
            <i className="size-[10px] rounded-pill border-2 border-chat-surface" />
          </span>
          <div className="leading-[1.6]">
            <b className="text-[14px]">Wayfinder</b>
            <small className="block text-[11.5px] text-chat-muted">
              Demo brand, scripted replies
            </small>
          </div>
        </div>
        <div
          ref={listRef}
          role="log"
          aria-label="Wayfinder chat"
          className="flex flex-1 flex-col gap-2 overflow-auto p-3 text-[14px]"
        >
          {messages.map((message) => (
            <Reply key={message.id} message={message} />
          ))}
          {typing ? (
            <div className={BOT}>
              <span className="sr-only">Typing</span>
              <span className="inline-flex gap-[3px]" aria-hidden="true">
                {[0, 150, 300].map((delay) => (
                  <i
                    key={delay}
                    style={{ animationDelay: `${delay}ms` }}
                    className="size-[6px] animate-typing-dot rounded-pill bg-chat-typing motion-reduce:animate-none"
                  />
                ))}
              </span>
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-[6px] px-3 pb-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion.label}
              type="button"
              onClick={() => onSend(suggestion.question, suggestion)}
              className="cursor-pointer rounded-[20px] border border-chat-strong bg-chat-surface px-[10px] py-1 text-[12.5px] font-medium leading-[normal] text-chat-strong"
            >
              {suggestion.label}
            </button>
          ))}
        </div>
        <form
          onSubmit={submit}
          className="flex border-t border-chat-field focus-within:shadow-[inset_0_0_0_1.5px_rgb(var(--color-accent-strong))]"
        >
          <input
            aria-label="Message"
            placeholder="Ask about a car"
            autoComplete="off"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="min-w-0 flex-1 border-0 bg-transparent px-3 py-[11px] text-[15px] leading-[normal] text-chat-ink focus:outline-none"
          />
          <button
            type="submit"
            className="cursor-pointer border-0 bg-transparent px-[14px] text-[14px] font-semibold text-accent-strong"
          >
            Send
          </button>
        </form>
      </div>
      <pre
        aria-label="Trace"
        className="mb-0 mt-3 min-h-[6.4em] whitespace-pre-wrap font-code text-mono-sm text-muted [overflow-wrap:anywhere]"
      >
        {trace.length === 0
          ? "Waiting for a message."
          : trace.map((line, index) => (
              <span key={index}>
                {index > 0 ? "\n" : ""}
                <b className="font-semibold text-ink">{line.who}</b>
                {" ".repeat(Math.max(1, 9 - line.who.length))}
                {line.text}
              </span>
            ))}
      </pre>
    </div>
  );
}
