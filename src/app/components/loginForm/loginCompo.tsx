"use client";

import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { loginSchema } from "../../schema/LoginSchema";
import * as z from "zod";
import { login_action } from "../../action/Action_login";
import ShowStatus from "../showStatus";
import { Building2 } from "lucide-react"; // ไอคอนธุรกิจ

function LoginCompo() {
  const [Error, setIsError] = useState<string | undefined>();
  const [Success, setIsSuccess] = useState<string | undefined>();
  const [IsPending, startTransition] = useTransition();

  const Loginform = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (value: z.infer<typeof loginSchema>) => {
    setIsSuccess("");
    setIsError("");
    startTransition(() => {
      login_action(value).then((data) => {
        setIsSuccess(data?.success);
        setIsError(data?.error);
      });
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center   p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full mb-3">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            ระบบเจ้าของธุรกิจ
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            เข้าสู่ระบบเพื่อจัดการร้านของคุณได้อย่างมืออาชีพ
          </p>
        </div>

        {/* Form */}
        <Form {...Loginform}>
          <form
            onSubmit={Loginform.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={Loginform.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">อีเมล</FormLabel>
                  <FormControl>
                    <Input
                      disabled={IsPending}
                      className="w-full"
                      placeholder="example@gmail.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={Loginform.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">รหัสผ่าน</FormLabel>
                  <FormControl>
                    <Input
                      disabled={IsPending}
                      type="password"
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />

            <Button
              disabled={IsPending}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              เข้าสู่ระบบ
            </Button>
          </form>
        </Form>

        {/* Status */}
        <div className="mt-4">
          <ShowStatus error={Error} success={Success} />
        </div>

        {/* Extra Info */}
        <p className="mt-6 text-xs text-center text-gray-400">
          หน้านี้สำหรับ{" "}
          <span className="font-medium text-gray-500">เจ้าของธุรกิจ</span>{" "}
          เท่านั้น
        </p>
      </div>
    </div>
  );
}

export default LoginCompo;
