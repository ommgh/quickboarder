"use client";

import { useState } from "react";
import { auth, signOut } from "@/auth";
import {
  LogOut,
  ShoppingBag,
  User,
  Settings,
  Moon,
  Shield,
  Trash,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Settings</h1>
          <form
          // action={async () => {
          //   "use server";
          //   await signOut();
          // }}
          >
            <Button variant="destructive" type="submit">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" /> Profile
            </CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              <span className="font-medium">Name:</span> {session?.user?.name}
            </p>
            <p>
              <span className="font-medium">Email:</span> {session?.user?.email}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline">Edit Profile</Button>
          </CardFooter>
        </Card>

        {/* E-commerce Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingBag className="mr-2 h-5 w-5" /> E-commerce Integrations
            </CardTitle>
            <CardDescription>
              Connect your stores to export catalogs directly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Shopify</span>
              <Button size="sm">Connect</Button>
            </div>
            <div className="flex justify-between items-center">
              <span>Flipkart</span>
              <Button size="sm">Connect</Button>
            </div>
            <div className="flex justify-between items-center">
              <span>Amazon</span>
              <Button size="sm">Connect</Button>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" /> Preferences
            </CardTitle>
            <CardDescription>
              Customize your QuickBoarder experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Dark Mode</span>
              <Button size="sm" variant="outline">
                <Moon className="mr-2 h-4 w-4" /> Toggle
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span>Notifications</span>
              <Button size="sm" variant="outline">
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" /> Security
            </CardTitle>
            <CardDescription>Protect your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Two-factor authentication</span>
              <Button size="sm" variant="outline">
                Enable
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span>Manage sessions</span>
              <Button size="sm" variant="outline">
                View
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <Trash className="mr-2 h-5 w-5" /> Danger Zone
            </CardTitle>
            <CardDescription>Actions that cannot be undone</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
