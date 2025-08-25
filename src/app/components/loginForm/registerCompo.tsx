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
import { registerSchema } from "../../schema/LoginSchema";
import * as z from "zod";
import { register_action } from "../../action/Action_register";
import ShowStatus from "../showStatus";

function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [Error, setIsError] = useState<string | undefined>("");
  const [Success, setIsSuccess] = useState<string | undefined>("");

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (value: z.infer<typeof registerSchema>) => {
    setIsSuccess("");
    setIsError("");
    startTransition(() => {
      register_action(value).then((data) => {
        setIsSuccess(data.success);
        setIsError(data.error);
      });
    });
  };

  return (
    <div>
      <Form {...form}>
        <h1 className="text-2xl font-bold mb-4">สมัครสมาชิกเพื่อใช้บริการ!</h1>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8  ">
          <FormField
            control={form.control}
            name="email"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel>email</FormLabel>
                <FormControl>
                  <Input
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
            control={form.control}
            name="password"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel>password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="****" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col md:flex-row md:space-x-4 justify-center">
            <Button type="submit" disabled={isPending}>
              สมัครสมาชิก
            </Button>
          </div>
        </form>
      </Form>
      <ShowStatus error={Error} success={Success} />
    </div>
  );
}

export default RegisterForm;
