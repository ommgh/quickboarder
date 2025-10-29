import { Background } from "@/components/background";
import { FAQ } from "@/components/blocks/faq";
import { Features } from "@/components/blocks/features";
import { Hero } from "@/components/blocks/hero";
import { Pricing } from "@/components/blocks/pricing";
import { ResourceAllocation } from "@/components/blocks/resource-allocation";

export default function Home() {
  return (
    <>
      <Background className="via-muted to-muted/80">
        <Hero />
        <Features />
        <ResourceAllocation />
      </Background>
      <Background variant="bottom">
        <Pricing />
        <FAQ />
      </Background>
    </>
  );
}
