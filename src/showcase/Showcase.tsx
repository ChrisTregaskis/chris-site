import { ActionsSection } from "./sections/ActionsSection";
import { FormSection } from "./sections/FormSection";
import { LayoutSection } from "./sections/LayoutSection";
import { MotionSection } from "./sections/MotionSection";
import { TokensSection } from "./sections/TokensSection";

/**
 * The design system on one page: tokens first, then every component. Served
 * by `pnpm dev` at /showcase.html; never built into dist/.
 */
export function Showcase() {
  return (
    <div className="min-h-screen bg-surface font-body text-body text-ink">
      <div className="mx-auto max-w-container px-gutter pb-section-lg">
        <header className="py-section">
          <p className="text-eyebrow uppercase text-muted">chris-site</p>
          <h1 className="mt-3 font-display text-display-xl font-semibold">
            Design system
          </h1>
          <p className="mt-5 max-w-measure text-lede text-muted">
            Tokens, motion presets, atoms and molecules from the locked look.
            Placeholder copy throughout.
          </p>
        </header>
        <TokensSection />
        <MotionSection />
        <ActionsSection />
        <LayoutSection />
        <FormSection />
      </div>
    </div>
  );
}
