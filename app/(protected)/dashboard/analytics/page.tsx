import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getUserSubscription } from "@/data/user";
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive";
import Link from "next/link";

export default async function AnalyticsPage() {
  const session = await auth();
  const userSubscription = await getUserSubscription(session?.user.id!);

  if (userSubscription === "FREE") {
    return (
      <div className="relative h-full">
        <div className="absolute inset-0 backdrop-blur-md z-10">
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Unlock Analytics for Your Store
            </h2>
            <p className="text-gray-600 max-w-md text-center">
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
  return <ChartAreaInteractive />;
}
