import { ChannelConnect } from "@/components/dashboard/channel-connect";
import { SectionCards } from "@/components/dashboard/section-cards";
import { HighlightedBarChart } from "@/components/ui/highlighted-bar-chart";
export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-4">
          <SectionCards />

          <div className="px-4 lg:px-6">
            <ChannelConnect
              connections={[
                "/logos/amazon.svg",
                "/logos/ebay.svg",
                "/logos/shopify.svg",
                "/logos/flipkart.svg",
              ]}
            />
            <HighlightedBarChart />
          </div>
        </div>
      </div>
    </div>
  );
}
