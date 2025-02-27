"use client";

import { CardWrapper } from "./card-wrapper";
import { BeatLoader } from "react-spinners";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { newVerification } from "@/actions/new-verification";
import { FormSuccess } from "../form-sucess";
import { FormError } from "../form-error";

const SearchParamsHandler = ({ setToken }: { setToken: (token: string | null) => void }) => {
  const searchParams = useSearchParams();
  setToken(searchParams.get("token"));
  return null;
};

export const NewVerificationForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const onSubmit = useCallback(() => {
    if (!token) {
      setError("Missing token");
      return;
    }
    newVerification(token)
      .then((data) => {
        setError(data.error || null);
        setSuccess(data.success || null);
      })
      .catch(() => {
        setError("Something went wrong");
      });
  }, [token]);

  useEffect(() => {
    if (token) {
      onSubmit();
    }
  }, [onSubmit, token]);

  return (
    <CardWrapper
      headerLabel="Verify your email"
      backButtonHref="/auth/login"
      backButtonLabel="Back to login"
    >
      <Suspense fallback={null}>
        <SearchParamsHandler setToken={setToken} />
      </Suspense>
      <div className="flex items-center w-full justify-center">
        {!success && !error && <BeatLoader />}
        <FormSuccess message={success || undefined} />
        <FormError message={error || undefined} />
      </div>
    </CardWrapper>
  );
};
