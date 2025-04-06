"use client";
import * as z from "zod";
import { CardWrapper } from "./card-wrapper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { LoginSchema } from "@/schemas";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-sucess";
import { login } from "@/actions/login";
import { Input } from "../ui/input";

// Create a separate component that uses useSearchParams
const LoginFormWithSearchParams = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const searchParams = useSearchParams();
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Email already in use with different provider"
      : "";

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      login(values).then((data) => {
        setError(data?.error);
        setSuccess(data?.success);
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Welcome back!"
      backButtonHref="/auth/register"
      backButtonLabel="Dont have an account? Sign up"
      showSocials
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      {...field}
                      type="email"
                      placeholder="om.works01@gmail.com"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      type="password"
                      placeholder="********"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error || urlError} />
          <FormSuccess message={success} />
          <Button type="submit" disabled={isPending} className="w-full">
            LogIn
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

const LoginFormFallback = () => {
  return (
    <CardWrapper
      headerLabel="Welcome back!"
      backButtonHref="/auth/register"
      backButtonLabel="Dont have an account? Sign up"
      showSocials
    >
      <div className="space-y-6">
        <div className="space-y-4">
          {/* Placeholder for form fields */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Email</div>
            <div className="h-10 w-full bg-gray-100 rounded-md animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Password</div>
            <div className="h-10 w-full bg-gray-100 rounded-md animate-pulse"></div>
          </div>
        </div>
        <div className="h-10 w-full bg-gray-100 rounded-md animate-pulse"></div>
      </div>
    </CardWrapper>
  );
};

export const LoginForm = () => {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginFormWithSearchParams />
    </Suspense>
  );
};
