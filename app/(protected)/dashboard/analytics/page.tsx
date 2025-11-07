import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getUserSubscription } from "@/data/user";

import Link from "next/link";
import { HighlightedBarChart } from "@/components/ui/highlighted-bar-chart";
import { GlowingStrokeRadarChart } from "@/components/dashboard/radar-chart";
import { PingingDotChart } from "@/components/dashboard/line-chart";

export default async function AnalyticsPage() {
  const session = await auth();
  const userSubscription = await getUserSubscription(session?.user.id!);

  if (userSubscription === "FREE") {
    return (
      <div className="flex items-center justify-center h-[100%]">
        <div className="absolute backdrop-blur-xs inset-0 z-10">
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <h2 className="text-2xl font-bold">
              Unlock Analytics for Your Store
            </h2>
            <p className="max-w-md text-center">
              Upgrade to PRO or ENTERPRISE to access detailed analytics and
              insights about your business performance.
            </p>
            <Link href="/pricing">
              <Button variant="default">Upgrade Now</Button>
            </Link>
          </div>
        </div>
        <AnalyticsContent />
      </div>
    );
  }

  return <AnalyticsContent />;
}

function AnalyticsContent() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 h-screen">
      <HighlightedBarChart />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <GlowingStrokeRadarChart />
        <PingingDotChart />
      </div>
    </div>
  );
}
