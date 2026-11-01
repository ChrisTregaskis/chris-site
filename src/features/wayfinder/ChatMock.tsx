import { type FormEvent, useEffect, useRef, useState } from "react";
import { SUGGESTIONS, type LogLine } from "./demo";
import { type ChatMessage } from "./useWayfinderDemo";
import { cn } from "@/lib/cn";

interface ChatMockProps {
  messages: ChatMessage[];
  typing: boolean;
  trace: LogLine[];
  onSend: (question: string) => void;
}

const BUBBLE =
  "max-w-[85%] shrink-0 rounded-[14px] px-[11px] py-2 leading-[1.4]";
const BOT = cn(BUBBLE, "rounded-bl-[4px] bg-chat-bubble");
const CARD =
  "max-w-[92%] shrink-0 overflow-hidden rounded-input border border-chat-card-line";
const CTA =
  "mt-[6px] inline-block border-b-[1.5px] border-current text-[12.5px] font-semibold";

function Car() {
  return (
    <svg viewBox="0 0 120 44" className="h-[42px] w-[118px]" aria-hidden="true">
      <path
        d="M8 32 L14 20 Q18 14 28 13 L70 12 Q80 12 88 18 L100 24 Q112 26 113 32 L113 34 L8 34 Z"
        className="fill-chat-surface stroke-chat-strong stroke-[1.5]"
      />
      <circle cx="30" cy="34" r="7" className="fill-chat-strong" />
      <circle cx="92" cy="34" r="7" className="fill-chat-strong" />
    </svg>
  );
}

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
        <div className={CARD}>
          <div className="grid h-[62px] place-items-center bg-gradient-to-br from-chat-media-from to-chat-media-to">
            <Car />
          </div>
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
          Your nearest retailer has these slots on Saturday:
          <div className="mt-[6px] flex flex-wrap gap-[6px]">
            {["09:30", "11:00", "14:15"].map((slot) => (
              <span
                key={slot}
                className="rounded-[20px] border border-chat-strong px-[9px] py-[2px] text-[12px]"
              >
                {slot}
              </span>
            ))}
          </div>
        </div>
      );
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
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages.length, typing]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSend(draft);
    setDraft("");
  };

  return (
    <div data-no-select="">
      <div className="mt-[14px] flex h-[320px] flex-col overflow-hidden rounded-[16px] bg-chat-surface text-chat-ink shadow-float wide:h-[380px]">
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
              <span className="inline-flex gap-[3px]" aria-label="Typing">
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
              onClick={() => onSend(suggestion.question)}
              className="cursor-pointer rounded-[20px] border border-chat-strong bg-chat-surface px-[10px] py-1 text-[12.5px] font-medium leading-[normal] text-chat-strong"
            >
              {suggestion.label}
            </button>
          ))}
        </div>
        <form
          onSubmit={submit}
          className="flex border-t border-chat-line focus-within:shadow-ring-accent"
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
