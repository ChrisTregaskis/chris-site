import { CVDrawer } from "@/features/cv-request";
import { EnquiryButton, EnquiryDrawer } from "@/features/enquiry";
import { AboutSection } from "@/sections/about/AboutSection";
import { AiWorkflowSection } from "@/sections/ai-workflow/AiWorkflowSection";
import { BurpeesSection } from "@/sections/burpees/BurpeesSection";
import { Contact } from "@/sections/contact/Contact";
import { EcommerceSection } from "@/sections/ecommerce/EcommerceSection";
import { Hero } from "@/sections/hero/Hero";
import { PhysioSection } from "@/sections/physio/PhysioSection";
import { PrototypesSection } from "@/sections/prototypes/PrototypesSection";
import { WayfinderSection } from "@/sections/wayfinder/WayfinderSection";
import { Container } from "@/ui/atoms/Container";
import { TopNav } from "@/ui/molecules/TopNav";

const NAV_LINKS = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

/** chris-tregaskis.uk: one long page, a sticky top bar, and the enquiry and CV drawers. */
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
            action={<EnquiryButton variant="ghost" size="sm" />}
          />
        </Container>
      </div>
      <main id="main">
        <Hero />
        <WayfinderSection />
        <PhysioSection />
        <BurpeesSection />
        <PrototypesSection />
        <EcommerceSection />
        <AiWorkflowSection />
        <AboutSection />
        <Contact />
      </main>
      <Container as="footer">
        <p className="m-0 pb-[50px] pt-[30px] text-caption text-muted">
          © {new Date().getFullYear()} Chris Tregaskis
        </p>
      </Container>
      <EnquiryDrawer />
      <CVDrawer />
    </>
  );
}
