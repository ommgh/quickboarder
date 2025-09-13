import React from "react";
import { auth, signOut } from "@/auth";
import { ArrowLeftCircle, LogOut } from "lucide-react";
import Link from "next/link";

const SettingsPage = async () => {
  const session = await auth();

  return (
    <div>
      <div className=" flex h-screen items-center justify-center">
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <div className="text-3xl items-center justify-center mb-5">
            {session?.user.name}
          </div>
          <button
            className="flex ml-8 items-center justify-center"
            type="submit"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
