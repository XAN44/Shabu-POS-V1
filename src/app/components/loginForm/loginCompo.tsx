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
    <div>
      <Form {...Loginform}>
        <h1 className="text-2xl font-bold mb-4">
          เข้าสู่ระบบเพื่อเริ่มใช้บริการ!
        </h1>
        <form
          onSubmit={Loginform.handleSubmit(onSubmit)}
          className="space-y-8  "
        >
          <FormField
            control={Loginform.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>email</FormLabel>
                <FormControl>
                  <Input
                    disabled={IsPending}
                    className="w-full text-sm px-3  "
                    placeholder="example@gmail.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={Loginform.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>password</FormLabel>
                <FormControl>
                  <Input
                    disabled={IsPending}
                    type="password"
                    placeholder="****"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col md:flex-row md:space-x-4 justify-center">
            <Button disabled={IsPending} type="submit">
              เข้าสู่ระบบ
            </Button>
          </div>
        </form>
      </Form>
      <ShowStatus error={Error} success={Success} />
    </div>
  );
}

export default LoginCompo;
