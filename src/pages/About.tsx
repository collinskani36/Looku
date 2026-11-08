import { PageMeta } from "@/components/page-meta";
import { AboutPage, SiteFrame } from "@/components/site";

export default function About() {
  return (
    <SiteFrame>
      <PageMeta
        title="About Us | DSQUARE OFFICIAL WEAR"
        description="Learn about DSQUARE OFFICIAL WEAR LIMITED, a Kenyan clothing and garment production business based in Eldoret."
      />
      <AboutPage />
    </SiteFrame>
  );
}
