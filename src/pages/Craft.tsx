import { PageMeta } from "@/components/page-meta";
import { CraftPage, SiteFrame } from "@/components/site";

export default function Craft() {
  return (
    <SiteFrame>
      <PageMeta
        title="Our Craft | DSQUARE OFFICIAL WEAR"
        description="Discover the craftsmanship, fabric selection and finishing behind every DSQUARE OFFICIAL WEAR garment."
      />
      <CraftPage />
    </SiteFrame>
  );
}
