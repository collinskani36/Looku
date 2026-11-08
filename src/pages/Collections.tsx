import { PageMeta } from "@/components/page-meta";
import { CollectionsPage, SiteFrame } from "@/components/site";

export default function Collections() {
  return (
    <SiteFrame>
      <PageMeta
        title="Collections | DSQUARE OFFICIAL WEAR"
        description="Explore men's official wear, designer suits, custom tailoring, school uniforms and institutional wear from DSQUARE OFFICIAL WEAR."
      />
      <CollectionsPage />
    </SiteFrame>
  );
}
