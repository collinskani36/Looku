import { useEffect, useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowDown, ArrowRight, ArrowUpRight, Clock, MapPin, Menu, Navigation, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { SlotImg } from "@/components/slot-img";
import { HERO_SLOTS, publicImageUrl, useSiteImages, type ImageSlot } from "@/hooks/use-site-images";

const phoneNumber = "+254724422486";
const whatsappUrl = `https://wa.me/${phoneNumber}`;

/** Single source of truth for the shop pin. Change the coordinates here and every map/link updates. */
const LOCATION = {
  name: "DSQUARE OFFICIAL WEAR",
  place: "Khetias Plaza Ronald Ngala Street Langas Kapseret",
  hoursDays: "Monday – Friday",
  hoursTime: "8:00 am – 6:00 pm",
  lat: 0.5151765107216796,
  lng: 35.27699545981593,
} as const;
const mapEmbedUrl = `https://www.google.com/maps?q=${LOCATION.lat},${LOCATION.lng}&z=17&output=embed`;
const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${LOCATION.lat},${LOCATION.lng}`;
const wazeUrl = `https://waze.com/ul?ll=${LOCATION.lat},${LOCATION.lng}&navigate=yes`;

const navigation = [
  { label: "Home", to: "/" },
  { label: "Collections", to: "/collections" },
  { label: "Our Craft", to: "/our-craft" },
  { label: "About Us", to: "/about-us" },
  { label: "Contact", to: "/contact" },
] as const;

export function BrandLogo({ light = false }: { light?: boolean }) {
  const navigate = useNavigate();
  const taps = useRef({ count: 0, last: 0 });

  // Triple-tap (or triple-click) the logo to open the admin sign-in. A single tap still goes home.
  function onLogoClick(event: MouseEvent<HTMLAnchorElement>) {
    const now = Date.now();
    const state = taps.current;
    state.count = now - state.last < 600 ? state.count + 1 : 1;
    state.last = now;
    if (state.count >= 3) {
      state.count = 0;
      event.preventDefault();
      navigate("/admin/login");
    }
  }

  return (
    <Link to="/" onClick={onLogoClick} aria-label="DSQUARE OFFICIAL WEAR home" className="flex shrink-0 touch-manipulation select-none items-center gap-3">
      <SlotImg slot="logo" alt="" width={45} height={45} draggable={false} className="h-11 w-11 rounded-full object-cover" />
      <span className={`flex flex-col leading-none ${light ? "text-paper" : "text-ink"}`}>
        <span className="text-[0.9rem] font-bold tracking-[0.12em]">DSQUARE</span>
        <span className="mt-1 text-[0.55rem] font-medium tracking-[0.19em]">OFFICIAL WEAR</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto grid min-h-[76px] max-w-[1440px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 sm:px-8 lg:flex lg:justify-between lg:px-14">
        <BrandLogo />
        <nav aria-label="Main navigation" className="hidden items-center gap-8 lg:flex">
          {navigation.map((item) => (
            <Link key={item.to} to={item.to} className="navigation-link text-[0.7rem] font-medium uppercase tracking-[0.13em] text-foreground/80 hover:text-foreground">
              {item.label}
            </Link>
          ))}
          <Button asChild size="sm" className="button-blue h-10 rounded-none px-5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] shadow-none">
            <Link to="/contact">Enquire now <ArrowUpRight aria-hidden="true" /></Link>
          </Button>
        </nav>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X /> : <Menu />}
        </Button>
      </div>
      {menuOpen && (
        <nav aria-label="Mobile navigation" className="border-t border-border bg-background px-5 py-4 lg:hidden">
          <div className="mx-auto flex max-w-[1440px] flex-col">
            {navigation.map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className="border-b border-border py-3 text-sm uppercase tracking-[0.12em] text-foreground">
                {item.label}
              </Link>
            ))}
            <Button asChild className="button-blue mt-4 w-full rounded-none shadow-none">
              <Link to="/contact" onClick={() => setMenuOpen(false)}>Enquire now <ArrowUpRight aria-hidden="true" /></Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 py-16 sm:px-10 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.9fr_1fr] lg:px-14 lg:py-20">
        <div>
          <BrandLogo light />
          <p className="mt-6 max-w-sm text-sm leading-7 text-paper/65">Thoughtful tailoring, contemporary official wear and clothing made with purpose in Eldoret, Kenya.</p>
        </div>
        <div>
          <h2 className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold">Explore</h2>
          <div className="mt-5 flex flex-col gap-3 text-sm text-paper/70">
            {navigation.slice(0, 4).map((item) => <Link key={item.to} to={item.to} className="transition-colors hover:text-paper">{item.label}</Link>)}
          </div>
        </div>
        <div>
          <h2 className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold">Collections</h2>
          <div className="mt-5 flex flex-col gap-3 text-sm text-paper/70">
            {["Men’s official wear", "Designer suits", "Custom tailoring", "School uniforms", "Institutional wear"].map((item) => <Link key={item} to="/collections" className="transition-colors hover:text-paper">{item}</Link>)}
          </div>
        </div>
        <div>
          <h2 className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold">Find us</h2>
          <a href={directionsUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-start gap-2 text-sm leading-7 text-paper/70 transition-colors hover:text-paper"><MapPin size={15} className="mt-[0.4rem] shrink-0 text-gold" aria-hidden="true" />{LOCATION.place}</a>
          <p className="mt-2 inline-flex items-start gap-2 text-sm leading-7 text-paper/70"><Clock size={15} className="mt-[0.4rem] shrink-0 text-gold" aria-hidden="true" />{LOCATION.hoursDays}, {LOCATION.hoursTime}</p><br />
          <a href={`tel:${phoneNumber}`} className="mt-2 inline-flex items-center gap-2 text-sm text-paper/70 transition-colors hover:text-paper"><Phone size={15} aria-hidden="true" /> +254 724 422486</a>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-3 block text-sm text-paper/70 transition-colors hover:text-paper">WhatsApp enquiries <ArrowUpRight className="ml-1 inline" size={14} aria-hidden="true" /></a>
        </div>
      </div>
      <div className="border-t border-paper/15">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-6 py-5 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-14">
          <span>© {new Date().getFullYear()} DSQUARE OFFICIAL WEAR LIMITED</span>
          <span>Crafted with purpose in Eldoret, Kenya</span>
        </div>
      </div>
    </footer>
  );
}

export function SiteFrame({ children }: { children: ReactNode }) {
  return <><SiteHeader /><main>{children}</main><SiteFooter /></>;
}

function SectionEyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`text-[0.65rem] font-semibold uppercase tracking-[0.2em] ${light ? "text-gold" : "text-blue"}`}>{children}</p>;
}

function ArrowLink({ to, children, light = false }: { to: string; children: ReactNode; light?: boolean }) {
  return <Link to={to} className={`group inline-flex items-center gap-3 border-b pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] ${light ? "border-paper/40 text-paper hover:border-gold hover:text-gold" : "border-ink/35 text-ink hover:border-blue hover:text-blue"} transition-colors`}>
    {children}<ArrowRight size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
  </Link>;
}

function EditorialStory({
  eyebrow, title, copy, cta, slot, alt, reverse = false, tone = "paper", to = "/collections",
}: {
  eyebrow: string; title: string; copy: string; cta: string; slot: ImageSlot; alt: string; reverse?: boolean; tone?: "paper" | "white"; to?: string;
}) {
  return (
    <section className={`grid min-h-[620px] lg:min-h-[690px] lg:grid-cols-2 ${tone === "paper" ? "bg-background" : "bg-card"}`}>
      <div className={`image-editorial min-h-[360px] lg:min-h-[620px] ${reverse ? "lg:order-2" : ""}`}>
        <SlotImg slot={slot} alt={alt} loading="lazy" width={1408} height={1024} className="h-full min-h-[360px] w-full object-cover lg:min-h-[620px]" />
      </div>
      <div className={`flex items-center px-8 py-16 sm:px-14 lg:px-[11%] lg:py-24 ${reverse ? "lg:order-1" : ""}`}>
        <div className="max-w-lg">
          <SectionEyebrow>{eyebrow}</SectionEyebrow>
          <h2 className="editorial-heading mt-6 text-5xl leading-[1.02] text-foreground sm:text-6xl">{title}</h2>
          <p className="mt-7 max-w-md text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">{copy}</p>
          <div className="mt-9"><ArrowLink to={to}>{cta}</ArrowLink></div>
        </div>
      </div>
    </section>
  );
}

const collections: { title: string; note: string; slot: ImageSlot; alt: string }[] = [
  { title: "Men’s Official Wear", note: "Refined, every day.", slot: "collection", alt: "A man in a charcoal suit in a modern office" },
  { title: "Designer Suits", note: "Made around you.", slot: "hero", alt: "A model wearing a tailored charcoal suit" },
  { title: "Custom Tailoring", note: "Fit with intention.", slot: "fitting", alt: "A tailor fitting a suit on a client" },
  { title: "School Uniforms", note: "A standard to wear proudly.", slot: "uniforms", alt: "Students in coordinated school uniforms" },
  { title: "Institutional Wear", note: "Made to represent.", slot: "craft", alt: "A tailor working on an institutional garment" },
];

function CollectionGrid({ compact = false }: { compact?: boolean }) {
  const items = compact ? collections.slice(0, 4) : collections;
  return <div className="grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
    {items.map((item, index) => (
      <Link key={item.title} to="/contact" className="group block">
        <div className="image-editorial relative aspect-[4/5] bg-muted">
          <SlotImg slot={item.slot} alt={item.alt} loading="lazy" width={1408} height={1024} className="h-full w-full object-cover" />
          <span className="absolute left-4 top-4 z-10 text-xs font-medium text-paper/85">0{index + 1}</span>
          <span aria-hidden="true" className="absolute bottom-4 right-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-paper/90 text-ink opacity-0 transition-opacity group-hover:opacity-100"><ArrowUpRight size={18} /></span>
        </div>
        <div className="flex items-start justify-between gap-3 pt-4">
          <div><h3 className="editorial-heading text-2xl text-foreground sm:text-3xl">{item.title}</h3><p className="mt-1 text-xs text-muted-foreground">{item.note}</p></div>
          <ArrowRight size={16} className="mt-2 shrink-0 text-gold-deep transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </div>
      </Link>
    ))}
  </div>;
}

function ContactForm() {
  const [message, setMessage] = useState("");

  function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const field = (key: string) => formData.get(key)?.toString().trim() ?? "";
    const enquiry = [
      "Hello DSQUARE OFFICIAL WEAR, I would like to make an enquiry.",
      `Name: ${field("name")}`,
      `Email: ${field("email")}`,
      `Phone: ${field("phone")}`,
      `Enquiry type: ${field("type")}`,
      `Message: ${field("message")}`,
    ].join("\n");

    // Open WhatsApp straight away (must happen inside the click, before any await, or popup blockers stop it).
    window.open(`${whatsappUrl}?text=${encodeURIComponent(enquiry)}`, "_blank", "noopener,noreferrer");
    setMessage("Your enquiry is ready in WhatsApp. Send the message there to reach our team.");
    form.reset();

    // Also keep a copy in the admin inbox. WhatsApp is the primary channel, so a failure here is only logged.
    if (isSupabaseConfigured) {
      supabase
        .from("enquiries")
        .insert({
          name: field("name"),
          email: field("email"),
          phone: field("phone"),
          enquiry_type: field("type"),
          message: field("message"),
        })
        .then(({ error }) => {
          if (error) console.error("Could not save enquiry", error);
        });
    }
  }

  return (
    <form onSubmit={submitEnquiry} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-xs font-medium text-foreground">Name<input className="form-field mt-2" type="text" name="name" autoComplete="name" required /></label>
        <label className="block text-xs font-medium text-foreground">Email<input className="form-field mt-2" type="email" name="email" autoComplete="email" required /></label>
        <label className="block text-xs font-medium text-foreground">Phone number<input className="form-field mt-2" type="tel" name="phone" autoComplete="tel" required /></label>
        <label className="block text-xs font-medium text-foreground">Enquiry type<select className="form-field mt-2" name="type" required defaultValue=""><option value="" disabled>Select an enquiry</option><option>Men’s official wear</option><option>Designer suits</option><option>Custom tailoring</option><option>School uniforms</option><option>Institutional wear</option><option>Other</option></select></label>
      </div>
      <label className="block text-xs font-medium text-foreground">Message<textarea className="form-field mt-2 min-h-36 resize-y" name="message" required /></label>
      <Button type="submit" className="button-blue h-12 rounded-none px-7 text-xs font-semibold uppercase tracking-[0.12em] shadow-none">Continue on WhatsApp <ArrowUpRight aria-hidden="true" /></Button>
      <p role="status" aria-live="polite" className="min-h-6 text-sm text-muted-foreground">{message}</p>
    </form>
  );
}

const HERO_INTERVAL_MS = 3000;
const HERO_ALT = "A model in a dark tailored suit in a modern architectural setting";

/** Full-bleed home banner. Cross-fades through every uploaded hero image every 3 seconds. */
function HeroSlideshow() {
  const { data } = useSiteImages();
  const slides = HERO_SLOTS.flatMap((slot) => {
    const row = data?.[slot];
    return row ? [{ slot, src: publicImageUrl(row.image_path), mobileSrc: row.mobile_image_path ? publicImageUrl(row.mobile_image_path) : null, alt: row.alt || HERO_ALT, key: `${slot}-${row.updated_at}` }] : [];
  });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % count), HERO_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [count, paused, active]);

  if (count === 0) {
    return <div aria-hidden="true" className="absolute inset-0 h-full w-full bg-muted" />;
  }

  const current = active % count;
  return (
    <>
      <div
        className="absolute inset-0"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
      >
        {slides.map((slide, i) => (
          <picture key={slide.key}>
            {/* Phones and portrait tablets get the tall image when one was uploaded. */}
            {slide.mobileSrc && <source media="(max-width: 1023px)" srcSet={slide.mobileSrc} />}
            <img
              src={slide.src}
              alt={slide.alt}
              width={1792}
              height={1024}
              data-active={i === current}
              aria-hidden={i !== current}
              fetchPriority={i === 0 ? "high" : "auto"}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${slide.mobileSrc ? "object-center lg:object-[61%_center]" : "object-[61%_center]"} ${i === current ? "opacity-100" : "opacity-0"}`}
            />
          </picture>
        ))}
      </div>
      {count > 1 && (
        <div className="absolute bottom-7 left-6 z-10 flex gap-2 sm:left-10 lg:left-14">
          {slides.map((slide, i) => (
            <button
              key={slide.key}
              type="button"
              aria-label={`Show slide ${i + 1} of ${count}`}
              aria-current={i === current}
              onClick={() => setActive(i)}
              className={`h-[3px] w-8 transition-colors ${i === current ? "bg-paper" : "bg-paper/40 hover:bg-paper/70"}`}
            />
          ))}
        </div>
      )}
    </>
  );
}

function VisitSection() {
  return (
    <section id="visit" aria-labelledby="visit-heading" className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex items-center px-6 py-16 sm:px-10 lg:px-14 lg:py-24">
          <div className="max-w-md">
            <SectionEyebrow>Visit us</SectionEyebrow>
            <h2 id="visit-heading" className="editorial-heading mt-5 text-5xl leading-[1.04] text-foreground sm:text-6xl">Find us at Khetias Plaza, Ronald Ngala Street.</h2>
            <p className="mt-6 flex items-start gap-2 text-sm leading-7 text-muted-foreground sm:text-base"><MapPin size={18} className="mt-1 shrink-0 text-gold-deep" aria-hidden="true" />{LOCATION.place}</p>
            <p className="mt-3 flex items-start gap-2 text-sm leading-7 text-muted-foreground sm:text-base"><Clock size={18} className="mt-1 shrink-0 text-gold-deep" aria-hidden="true" /><span>{LOCATION.hoursDays}<br />{LOCATION.hoursTime}</span></p>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">Come in to see the collections and speak with our team, or tap below and your maps app will take you to our exact pin.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild className="button-blue h-12 rounded-none px-6 text-xs font-semibold uppercase tracking-[0.12em] shadow-none"><a href={directionsUrl} target="_blank" rel="noreferrer">Get directions <Navigation aria-hidden="true" /></a></Button>
              <Button asChild variant="outline" className="h-12 rounded-none border-ink/30 bg-transparent px-6 text-xs font-semibold uppercase tracking-[0.12em] text-ink shadow-none hover:border-blue hover:bg-transparent hover:text-blue"><a href={wazeUrl} target="_blank" rel="noreferrer">Open in Waze <ArrowUpRight aria-hidden="true" /></a></Button>
            </div>
          </div>
        </div>
        <div className="relative min-h-[380px] bg-muted lg:min-h-[560px]">
          <iframe
            title={`Map showing ${LOCATION.name} at ${LOCATION.place}`}
            src={mapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="map-frame absolute inset-0 h-full w-full"
          />
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <>
      <section className="hero-photo relative flex min-h-[680px] items-end overflow-hidden bg-charcoal sm:min-h-[760px] lg:min-h-[calc(100svh-76px)] lg:items-center">
        <HeroSlideshow />
        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 pb-20 pt-36 sm:px-10 sm:pb-28 lg:px-14 lg:py-24">
          <div className="max-w-[670px] text-paper">
            <SectionEyebrow light>Made in Kenya · Worn with confidence</SectionEyebrow>
            <h1 className="editorial-heading mt-6 text-6xl leading-[0.94] sm:text-7xl lg:text-[6.4rem]">DSQUARE<br />OFFICIAL WEAR</h1>
            <p className="mt-7 text-sm font-medium tracking-[0.04em] text-paper/90 sm:text-base">Dress To Be Addressed.</p>
            <p className="mt-3 max-w-lg text-sm leading-7 text-paper/75">Exceptional tailoring, contemporary official wear and clothing crafted with purpose.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild className="button-gold h-12 rounded-none px-6 text-xs font-semibold uppercase tracking-[0.12em] shadow-none"><Link to="/collections">Explore collections <ArrowRight aria-hidden="true" /></Link></Button>
              <Button asChild variant="outline" className="button-on-dark h-12 rounded-none px-6 text-xs font-semibold uppercase tracking-[0.12em] shadow-none"><Link to="/contact">Get in touch <ArrowUpRight aria-hidden="true" /></Link></Button>
            </div>
          </div>
        </div>
        <a href="#stories" aria-label="Scroll to discover" className="absolute bottom-7 right-7 z-10 hidden items-center gap-3 text-[0.6rem] uppercase tracking-[0.17em] text-paper/70 sm:flex">Discover <ArrowDown size={16} aria-hidden="true" /></a>
      </section>

      <section id="stories" className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-14">
          <SectionEyebrow>DSQUARE OFFICIAL WEAR LIMITED</SectionEyebrow>
          <p className="text-xs text-muted-foreground">Eldoret, Kenya <span className="px-2 text-gold-deep">/</span> Clothing with intention</p>
        </div>
      </section>

      <EditorialStory eyebrow="Men’s official wear" title="The Art of Official Wear" copy="Refined silhouettes. Exceptional finishing. Clothing that makes a statement without saying a word." cta="Discover men’s wear" slot="official" alt="A Kenyan man in a tailored navy suit in a contemporary office" />
      <EditorialStory eyebrow="Designer suits" title="Tailored to Your Identity" copy="Discover the confidence of a well-crafted suit, designed around your style and made with attention to every detail." cta="Explore tailoring" slot="fitting" alt="A tailor carefully adjusts a client's fitted suit" reverse to="/our-craft" tone="white" />
      <EditorialStory eyebrow="Institutional uniforms" title="Uniforms That Represent Excellence" copy="Professional uniform solutions for schools, colleges and institutions, produced with consistency and attention to quality." cta="Institutional enquiries" slot="uniforms" alt="Kenyan students and staff in coordinated navy uniforms" to="/contact" />
      <EditorialStory eyebrow="The making" title="Crafted With Purpose" copy="Behind every finished garment is a commitment to precision, workmanship and the details that matter." cta="Discover our craft" slot="craft" alt="A Kenyan tailor chalk-marks a suit in a workshop" reverse to="/our-craft" tone="white" />

      <section className="bg-background px-6 py-20 sm:px-10 lg:px-14 lg:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between lg:mb-16">
            <div><SectionEyebrow>What we make</SectionEyebrow><h2 className="editorial-heading mt-4 text-5xl text-foreground sm:text-6xl">Made for the moments<br className="hidden sm:block" /> that matter.</h2></div>
            <ArrowLink to="/collections">View all collections</ArrowLink>
          </div>
          <CollectionGrid compact />
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-2">
          <div className="flex items-center px-7 py-16 sm:px-12 lg:px-[14%] lg:py-28">
            <div className="max-w-lg"><SectionEyebrow light>Who we are</SectionEyebrow><h2 className="editorial-heading mt-6 text-5xl leading-[1.04] sm:text-6xl">More Than Clothing.<br />A Standard of Craft.</h2><p className="mt-7 text-sm leading-8 text-paper/70">DSquare Official Wear is a Kenyan clothing and garment production business built on a passion for fashion, craftsmanship and professional dressing. From designer suits to institutional uniforms, we create clothing that combines thoughtful design with practical quality.</p><div className="mt-9"><ArrowLink to="/about-us" light>Our story</ArrowLink></div></div>
          </div>
          <div className="image-editorial min-h-[400px] lg:min-h-[660px]"><SlotImg slot="craft" alt="A tailor at work in the DSQUARE craft studio" loading="lazy" width={1408} height={1024} className="h-full min-h-[400px] w-full object-cover lg:min-h-[660px]" /></div>
        </div>
      </section>

      <section className="bg-card px-6 py-20 sm:px-10 lg:px-14 lg:py-24">
        <div className="mx-auto max-w-[1440px]"><SectionEyebrow>Why DSQUARE</SectionEyebrow><h2 className="editorial-heading mt-4 text-5xl text-foreground sm:text-6xl">The details make the difference.</h2>
          <div className="mt-12 grid gap-y-9 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {["Quality Craftsmanship", "Professional Tailoring", "Institutional Solutions", "Attention to Detail"].map((title, i) => <div key={title} className="border-t border-border pt-5"><span className="text-xs text-gold-deep">0{i + 1}</span><h3 className="editorial-heading mt-3 text-2xl text-foreground">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{["Garments made with care in every seam and finish.", "Thoughtful fit and a considered approach to personal style.", "Coordinated clothing for schools and institutions.", "A careful eye from first measurement to final finish."][i]}</p></div>)}
          </div>
        </div>
      </section>

      <VisitSection />
      <ContactCallout />
    </>
  );
}

export function CollectionsPage() {
  return <>
    <PageIntro eyebrow="The collections" title={<>Made to be<br />remembered.</>} copy="From considered everyday official wear to custom suits and coordinated institutional clothing, discover what we make." slot="collection" />
    <section className="bg-background px-6 py-16 sm:px-10 lg:px-14 lg:py-24"><div className="mx-auto max-w-[1440px]"><div className="mb-10 flex items-end justify-between gap-4"><div><SectionEyebrow>Explore the range</SectionEyebrow><h2 className="editorial-heading mt-3 text-4xl sm:text-5xl">Clothing with purpose.</h2></div><span className="hidden text-xs text-muted-foreground sm:block">01 — 05</span></div><CollectionGrid /></div></section>
    <ContactCallout />
  </>;
}

export function AboutPage() {
  return <>
    <PageIntro eyebrow="About DSQUARE" title={<>More than clothing.<br />A standard of craft.</>} copy="DSQUARE OFFICIAL WEAR LIMITED is an established fashion and clothing production business based in Eldoret, Kenya." slot="craft" />
    <section className="bg-background px-6 py-16 sm:px-10 lg:px-14 lg:py-28"><div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20"><div><SectionEyebrow>Our story</SectionEyebrow><h2 className="editorial-heading mt-5 text-5xl leading-tight">A journey shaped by clothing.</h2></div><div className="space-y-6 text-sm leading-8 text-muted-foreground sm:text-base"><p>DSQUARE’s story began in second-hand clothing and grew into a deeper commitment to garment production. That experience built a lasting appreciation for how clothing is chosen, worn and made to serve its purpose.</p><p>Today, DSQUARE OFFICIAL WEAR brings that perspective to men’s official wear, designer suits, custom tailoring, school uniforms and institutional garments.</p><p>Our work is guided by a belief in thoughtful design, practical quality and careful workmanship—creating clothing that helps people and institutions present themselves with confidence.</p></div></div></section>
    <EditorialStory eyebrow="Our belief" title="Made with purpose. Worn with confidence." copy="We bring care to every stage of the garment, from the first conversation and fabric selection to the final fitting and finish." cta="Explore our craft" slot="fitting" alt="A tailor gives a final fitting to a client in a blue suit" reverse tone="white" to="/our-craft" />
    <section className="bg-ink px-6 py-16 text-paper sm:px-10 lg:px-14 lg:py-24"><div className="mx-auto max-w-[1200px]"><SectionEyebrow light>Our mission</SectionEyebrow><p className="editorial-heading mt-5 max-w-4xl text-4xl leading-tight sm:text-6xl">To create considered clothing that brings craftsmanship and confidence to the way people show up.</p></div></section>
    <ContactCallout />
  </>;
}

export function CraftPage() {
  return <>
    <PageIntro eyebrow="Our craft" title={<>Made carefully.<br />Made to matter.</>} copy="A considered process, guided by fit, fabric and the finishing details that give every garment its character." slot="craft" />
    <section className="bg-background px-6 py-16 sm:px-10 lg:px-14 lg:py-24"><div className="mx-auto max-w-[1440px]"><div className="max-w-2xl"><SectionEyebrow>Inside the making</SectionEyebrow><h2 className="editorial-heading mt-4 text-5xl leading-tight sm:text-6xl">Attention, at every stage.</h2><p className="mt-6 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">Every garment starts with an understanding of who it is for and what it needs to do. From there, the work is shaped by material, fit and a careful finish.</p></div>
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{[
        { n: "01", title: "The conversation", text: "We begin with the occasion, the wearer and the purpose of the garment." },
        { n: "02", title: "Fabric & form", text: "Material and silhouette are considered together to shape the garment." },
        { n: "03", title: "Measure & make", text: "Measurements guide the cutting, construction and fitting process." },
        { n: "04", title: "The final finish", text: "Stitching, fit and finishing details are brought together with care." },
      ].map((step) => <article key={step.n} className="border-t border-border pt-5"><span className="text-xs text-gold-deep">{step.n}</span><h3 className="editorial-heading mt-4 text-3xl">{step.title}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{step.text}</p></article>)}</div>
    </div></section>
    <EditorialStory eyebrow="A closer fit" title="Designed around you." copy="Custom tailoring starts with the person who will wear the garment. Every fitting brings the details closer to the right fit and feel." cta="Ask about tailoring" slot="fitting" alt="A tailor adjusts the shoulder of a fitted suit" to="/contact" />
    <EditorialStory eyebrow="For institutions" title="A shared sense of standard." copy="Uniforms bring people together. We work with schools and institutions on coordinated garments made with consistency and care." cta="Discuss an institutional order" slot="uniforms" alt="Students wearing coordinated uniforms outside a campus" reverse tone="white" to="/contact" />
    <ContactCallout />
  </>;
}

export function ContactPage() {
  return <>
    <section className="bg-background px-6 py-14 sm:px-10 lg:px-14 lg:py-20"><div className="mx-auto max-w-[1440px]"><SectionEyebrow>Get in touch</SectionEyebrow><h1 className="editorial-heading mt-5 max-w-4xl text-5xl leading-[1.02] sm:text-7xl">Let’s create something exceptional.</h1><p className="mt-6 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">Whether you need a custom suit, official wear or uniforms for your institution, our team is ready to hear from you.</p>
      <div className="mt-12 grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-20"><div><h2 className="editorial-heading mb-6 text-3xl">Tell us what you have in mind.</h2><ContactForm /></div>
        <aside className="border-t border-border pt-6 lg:pl-10 lg:border-l lg:border-t-0"><SectionEyebrow>Direct enquiries</SectionEyebrow><a href={`tel:${phoneNumber}`} className="editorial-heading mt-5 block text-3xl text-foreground">+254 724 422486</a><p className="mt-2 text-sm text-muted-foreground">Call our team</p><a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-foreground underline decoration-gold underline-offset-4">WhatsApp us <ArrowUpRight size={15} aria-hidden="true" /></a><div className="mt-12 border-t border-border pt-6"><SectionEyebrow>Visit us</SectionEyebrow><p className="mt-4 text-lg text-foreground">Khetias Plaza 4th Floor Ronald Ngala Street, Eldoret</p><p className="mt-2 text-sm leading-7 text-muted-foreground">DSQUARE OFFICIAL WEAR LIMITED<br />{LOCATION.place}</p><p className="mt-4 text-sm leading-7 text-muted-foreground">Open {LOCATION.hoursDays}<br />{LOCATION.hoursTime}</p><a href={directionsUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-foreground underline decoration-gold underline-offset-4">Get directions <Navigation size={15} aria-hidden="true" /></a></div></aside>
      </div>
    </div></section>
    <section className="bg-charcoal px-6 py-16 text-paper sm:px-10 lg:px-14"><div className="mx-auto flex max-w-[1440px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div><SectionEyebrow light>Prefer a direct conversation?</SectionEyebrow><h2 className="editorial-heading mt-3 text-4xl">We’re one message away.</h2></div><Button asChild className="button-gold h-12 w-fit rounded-none px-6 text-xs font-semibold uppercase tracking-[0.12em] shadow-none"><a href={whatsappUrl} target="_blank" rel="noreferrer">Start a WhatsApp chat <ArrowUpRight aria-hidden="true" /></a></Button></div></section>
  </>;
}

function PageIntro({ eyebrow, title, copy, slot }: { eyebrow: string; title: ReactNode; copy: string; slot: ImageSlot }) {
  return <section className="grid bg-background lg:min-h-[640px] lg:grid-cols-2"><div className="flex items-center px-6 py-16 sm:px-10 lg:px-[12%] lg:py-24"><div className="max-w-xl"><SectionEyebrow>{eyebrow}</SectionEyebrow><h1 className="editorial-heading mt-5 text-5xl leading-[1.02] sm:text-7xl">{title}</h1><p className="mt-6 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">{copy}</p></div></div><div className="image-editorial min-h-[360px] lg:min-h-[640px]"><SlotImg slot={slot} alt="" loading="lazy" width={1408} height={1024} className="h-full min-h-[360px] w-full object-cover lg:min-h-[640px]" /></div></section>;
}

function ContactCallout() {
  return <section className="bg-charcoal px-6 py-16 text-paper sm:px-10 lg:px-14 lg:py-24"><div className="mx-auto flex max-w-[1440px] flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"><div className="max-w-3xl"><SectionEyebrow light>Begin a conversation</SectionEyebrow><h2 className="editorial-heading mt-4 text-5xl leading-tight sm:text-6xl">Let’s create something exceptional.</h2><p className="mt-5 max-w-xl text-sm leading-7 text-paper/70">For custom tailoring, official wear or uniforms for your institution, tell us what you have in mind.</p></div><div className="flex shrink-0 flex-wrap gap-3"><Button asChild className="button-gold h-12 rounded-none px-6 text-xs font-semibold uppercase tracking-[0.12em] shadow-none"><Link to="/contact">Make an enquiry <ArrowRight aria-hidden="true" /></Link></Button><Button asChild variant="outline" className="button-on-dark h-12 rounded-none px-6 text-xs font-semibold uppercase tracking-[0.12em] shadow-none"><a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight aria-hidden="true" /></a></Button></div></div></section>;
}