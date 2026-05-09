import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserSubscription } from "@/data/user";
import { IconLock, IconSparkles } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HighlightedBarChart } from "@/components/ui/highlighted-bar-chart";
import { GlowingStrokeRadarChart } from "@/components/dashboard/radar-chart";
import { PingingDotChart } from "@/components/dashboard/line-chart";

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userSubscription = await getUserSubscription(session.user.id);
  const isFreeUser = userSubscription === "FREE";

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Analytics Content (visible to all, blurred for free users) */}
      <div
        className={
          isFreeUser ? "pointer-events-none select-none blur-[2px]" : ""
        }
      >
        <div className="flex flex-col gap-6 p-4 lg:p-6 h-screen overflow-hidden">
          <HighlightedBarChart />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <GlowingStrokeRadarChart />
            <PingingDotChart />
          </div>
        </div>
      </div>

      {/* Upgrade Overlay (only for free users) */}
      {isFreeUser && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="mx-auto max-w-md text-center space-y-6 p-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <IconLock className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Unlock Analytics for Your Store
              </h2>
              <p className="text-muted-foreground">
                Upgrade to PRO or ENTERPRISE to access detailed analytics and
                insights about your store performance.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/pricing">
                <Button size="lg" className="w-full sm:w-auto">
                  <IconSparkles className="mr-2 h-4 w-4" />
                  Upgrade Now
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
