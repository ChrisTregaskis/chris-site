import { CVDrawer, CVRequestButton } from "@/features/cv-request";
import { Contact } from "@/sections/contact/Contact";
import { Hero } from "@/sections/hero/Hero";
import { Container } from "@/ui/atoms/Container";
import { TopNav } from "@/ui/molecules/TopNav";

const NAV_LINKS = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

/** chris-tregaskis.uk: one long page, a sticky top bar and the CV drawer. */
export function App() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-badge bg-accent px-4 py-2 font-semibold text-on-accent focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <div className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md">
        <Container>
          <TopNav
            name="Chris Tregaskis"
            links={NAV_LINKS}
            action={<CVRequestButton variant="ghost" size="sm" />}
          />
        </Container>
      </div>
      <main id="main">
        <Hero />
        <div id="work" />
        <Contact />
      </main>
      <Container as="footer">
        <p className="m-0 pb-[50px] pt-[30px] text-caption text-muted">
          © {new Date().getFullYear()} Chris Tregaskis
        </p>
      </Container>
      <CVDrawer />
    </>
  );
}
