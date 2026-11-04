import { LOOK_NAMES, LOOKS, readLook } from "./look";

/**
 * A small fixed switcher between the baseline and the three looks, shown
 * only when the URL carries `?look=` (and hidden with `&switcher=off`, for
 * screenshots).
 */
export function LookSwitcher() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("look") || params.get("switcher") === "off") return null;
  const current = readLook(window.location.search);
  const items = [
    { key: "base", label: "Baseline" },
    ...LOOKS.map((look) => ({
      key: look,
      label: `${look.toUpperCase()} ${LOOK_NAMES[look]}`,
    })),
  ];
  return (
    <nav
      aria-label="Design exploration looks"
      className="fixed bottom-4 right-4 z-[60] flex gap-1 rounded-pill bg-scrim/90 p-1 text-caption shadow-float backdrop-blur-md"
    >
      {items.map((item) => {
        const on = (current ?? "base") === item.key;
        return (
          <a
            key={item.key}
            href={`?look=${item.key}`}
            aria-current={on ? "page" : undefined}
            className={
              on
                ? "rounded-pill bg-accent px-3 py-[6px] font-semibold text-on-accent no-underline"
                : "rounded-pill px-3 py-[6px] text-ink no-underline hover:bg-raised"
            }
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
