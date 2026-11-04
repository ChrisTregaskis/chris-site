/**
 * About, take B (bolder): one large display line, its last words in the
 * accent, then the same facts in fewer words, pointing back at the three
 * chapters above.
 */
export function AboutCopyB() {
  return (
    <>
      <p className="m-0 mb-6 max-w-[17ch] text-balance font-display text-display-md font-semibold">
        I like the bit where a rough idea becomes{" "}
        <span className="text-accent">something people use.</span>
      </p>
      <p className="m-0 mb-4 max-w-[34em] text-body-lg">
        I&apos;m a senior full-stack TypeScript developer, working end to end:
        React and Node, AI agents and the cloud underneath. You&apos;ve just
        scrolled past three: the architecture of an AI guide, a platform for a
        start-up and an app with an audience of one.
      </p>
      <p className="m-0 mb-4 max-w-[34em] text-body-lg text-muted">
        Away from the keyboard, it&apos;s the simple joys: my wife and kids,
        family game and film nights, walks in the British countryside, dusting
        off the drums and the odd Steam sale.
      </p>
    </>
  );
}
