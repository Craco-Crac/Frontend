"use client";

import React from "react";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { AtSymbolIcon, ExclamationCircleIcon, KeyIcon } from "@heroicons/react/24/outline";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { usersApi } from "@/config/axios.config";

import { Button } from "@/app/ui/button";

export default function Login() {
    const [pending, setPending] = React.useState(false);
    const [errMessage, setErrMessage] = React.useState("");
    const router = useRouter();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        setPending(true);
        setErrMessage("");
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const form_values = Object.fromEntries(formData);

        try {
            const response = await usersApi.post("/users/auth/login", form_values);
            if (response.status === 200) {
                router.push("/");
            }
        } catch (error: any) {
            if (isAxiosError(error)) {
                if (error.response?.status == 401) {
                    setErrMessage("Invalid credentials");
                } else {
                    error.response?.data.message ?
                        setErrMessage(error.response?.data.message) : setErrMessage(error.message);
                }
            } else {
                setErrMessage("Undefined error");
            }
        }
        setPending(false);
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
            <form onSubmit={onSubmit} className="space-y-3 w-full max-w-md">
                <div className="flex-1 rounded-lg bg-gray-50 p-6 font-lusitana"> {/* Custom font class applied */}
                    <h1 className="mb-3 text-2xl text-black">Please log in to continue.</h1>
                    <div className="w-full">
                        <div>
                            <label className="mb-3 mt-5 block text-xs font-medium text-gray-900 " htmlFor="email">
                                Username
                            </label>
                            <div className="relative">
                                <input
                                    className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 text-black"
                                    id="username"
                                    type="username"
                                    name="username"
                                    placeholder="Enter your email address"
                                    required
                                />
                                <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="mb-3 mt-5 block text-xs font-medium text-gray-900" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 text-black"
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder="Enter password"
                                    required
                                    minLength={6}
                                />
                                <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                            </div>
                        </div>
                    </div>
                    <Button type="submit" className="mt-4 w-full" aria-disabled={pending} disabled={pending}>
                        Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
                    </Button>
                    <Link href="/register">
                        <Button className="mt-1 w-full" aria-disabled={pending} disabled={pending}>
                            Sign up <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
                        </Button>
                    </Link>
                    <div className="flex h-8 items-end space-x-1">
                        {errMessage != "" && (
                            <>
                                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                                <p aria-live="polite" className="text-sm text-red-500">
                                    {errMessage}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}