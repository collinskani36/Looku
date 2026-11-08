import { PageMeta } from "@/components/page-meta";
import { ContactPage, SiteFrame } from "@/components/site";

export default function Contact() {
  return (
    <SiteFrame>
      <PageMeta
        title="Contact | DSQUARE OFFICIAL WEAR"
        description="Contact DSQUARE OFFICIAL WEAR in Eldoret, Kenya, about custom suits, official wear or institutional uniforms."
      />
      <ContactPage />
    </SiteFrame>
  );
}
