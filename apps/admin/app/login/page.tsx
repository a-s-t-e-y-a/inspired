"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminLogin } from "@/queries/auth.queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useAdminLogin();
  const [form, setForm] = useState({ email: "", passwordHash: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.passwordHash) {
      toast.error("Email and password are required");
      return;
    }
    try {
      await loginMutation.mutateAsync(form);
      toast.success("Logged in successfully");
      router.push("/dashboard");
    } catch {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Card className="w-full max-w-sm border border-zinc-200 shadow-sm">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-base font-semibold">Inspired Admin</CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Sign in to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                className="h-8 text-xs"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-8 text-xs"
                value={form.passwordHash}
                onChange={(e) => setForm((f) => ({ ...f, passwordHash: e.target.value }))}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="w-full h-8 text-xs bg-black hover:bg-zinc-800 text-white"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
