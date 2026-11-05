import { CVDrawer } from "@/features/cv-request";
import { EnquiryButton, EnquiryDrawer } from "@/features/enquiry";
import { AboutSection } from "@/sections/about/AboutSection";
import { BurpeesSection } from "@/sections/burpees/BurpeesSection";
import { Contact } from "@/sections/contact/Contact";
import { Hero } from "@/sections/hero/Hero";
import { PhysioSection } from "@/sections/physio/PhysioSection";
import { WayfinderSection } from "@/sections/wayfinder/WayfinderSection";
import { useAnchorScroll } from "@/hooks/useAnchorScroll";
import { Container } from "@/ui/atoms/Container";
import { type TopNavLink, TopNav } from "@/ui/molecules/TopNav";
import { type NavMenuItem, NavMenu } from "@/ui/organisms/NavMenu";
import { type PhoneMenuLink, PhoneMenu } from "@/ui/organisms/PhoneMenu";

const NAME = "Chris Tregaskis";
const HOME_HREF = "#top";

/** The Work menu: each case study by its number, straight to its opener. */
const WORK_ITEMS: NavMenuItem[] = [
  { href: "#work", label: "Wayfinder", numeral: "1" },
  { href: "#how-it-was-built", label: "How it was built", sub: true },
  { href: "#physio", label: "Physio and wellness", numeral: "2" },
  { href: "#burpees", label: "Badass Burpees", numeral: "3" },
];

const PAGE_LINKS: PhoneMenuLink[] = [
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

const NAV_LINKS: TopNavLink[] = [
  { label: "Work", control: <NavMenu label="Work" items={WORK_ITEMS} /> },
  ...PAGE_LINKS,
];

/**
 * chris-tregaskis.uk: one long page, a sticky top bar, and the enquiry and CV
 * drawers. Below `wide` the bar's links and Get in touch fold into its phone
 * menu (the same links, Get in touch at the foot).
 */
export function App() {
  useAnchorScroll();
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-badge bg-accent px-4 py-2 font-semibold text-on-accent focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <div className="sticky top-0 z-30 bg-gradient-to-b from-surface/70 to-surface/0 backdrop-blur-md">
        <Container>
          <TopNav
            name={NAME}
            homeHref={HOME_HREF}
            links={NAV_LINKS}
            action={
              <EnquiryButton
                variant="ghost"
                size="sm"
                className="text-accent"
              />
            }
            menu={
              <PhoneMenu
                name={NAME}
                homeHref={HOME_HREF}
                items={WORK_ITEMS}
                links={PAGE_LINKS}
                action={<EnquiryButton />}
              />
            }
          />
        </Container>
      </div>
      <main id="main">
        <Hero />
        <WayfinderSection />
        <PhysioSection />
        <BurpeesSection />
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
