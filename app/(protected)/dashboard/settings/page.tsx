import { auth, signOut } from "@/auth";
import { LogOut, ShoppingBag, Shield, Trash, CreditCard } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserSubscription } from "@/data/user";
import { getNextBillingDate } from "@/data/subscription";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user;
  const plan = getUserSubscription(user?.id!);
  const nextBillingDate = getNextBillingDate(user?.id!);

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen overflow-x-hidden">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        </div>

        <Card className="flex flex-row justify-between px-2">
          <CardContent className="flex items-center space-x-4">
            <Avatar className="h-14 w-14">
              <AvatarImage
                src={user?.image ?? undefined}
                alt={user?.name ?? ""}
              />
              <AvatarFallback>
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </CardContent>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/auth/login" });
            }}
          >
            <Button variant="ghost" type="submit" className="mt-2.5">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center text-lg">
              <CreditCard className="mr-2 h-5 w-5" /> Billing
            </CardTitle>
            <Link
              href={(await plan) === "FREE" ? "/pricing" : "/dashboard/billing"}
            >
              <Button variant="outline" size="sm">
                {(await plan) === "FREE" ? "Upgrade" : "Manage"}
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                Current Plan:{" "}
                <span className="font-medium text-foreground">{plan}</span>
              </p>
              {(await plan) !== "FREE" && (
                <p className="text-sm text-muted-foreground">
                  Next Payment:{" "}
                  <span className="font-medium">{nextBillingDate}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center text-lg">
              <ShoppingBag className="mr-2 h-5 w-5" /> Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["Shopify", "Flipkart", "Amazon"].map((platform) => (
              <div
                key={platform}
                className="flex items-center justify-between rounded-md border p-3 overflow-x-hidden"
              >
                <span>{platform}</span>
                <Button size="sm">Connect</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center text-lg">
              <Shield className="mr-2 h-5 w-5" /> Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span>Two-factor authentication</span>
              <Button size="sm" variant="outline">
                Enable
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-destructive text-lg">
              <Trash className="mr-2 h-5 w-5" /> Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
