import { DataTable } from "@/components/dashboard/data-table";

import { SectionCards } from "@/components/dashboard/section-cards";
import { HighlightedBarChart } from "@/components/ui/highlighted-bar-chart";
import data from "./data.json";
export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-2">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <HighlightedBarChart />
          </div>
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}
