import { PageMeta } from "@/components/page-meta";
import { HomePage, SiteFrame } from "@/components/site";

export default function Home() {
  return (
    <SiteFrame>
      <PageMeta
        title="DSQUARE OFFICIAL WEAR | Defined by Craft"
        description="Discover men's official wear, designer suits, custom tailoring and institutional garments from DSQUARE OFFICIAL WEAR in Eldoret, Kenya."
      />
      <HomePage />
    </SiteFrame>
  );
}
