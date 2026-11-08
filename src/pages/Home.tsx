import { PageMeta } from "@/components/page-meta";
import { HomePage, SiteFrame } from "@/components/site";

export default function Home() {
  return (
    <SiteFrame>
      <PageMeta
        title="DSQUARE OFFICIAL WEAR | Dressed To Be Addressed"
        description="Discover men's official wear, designer suits, custom tailoring and institutional garments from DSQUARE OFFICIAL WEAR in Eldoret, Kenya."
      />
      <HomePage />
    </SiteFrame>
  );
}
