"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminSignup } from "@/queries/auth.queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const signupMutation = useAdminSignup();
  const [form, setForm] = useState({
    name: "",
    email: "",
    passwordHash: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.passwordHash) {
      toast.error("All fields are required");
      return;
    }
    if (form.passwordHash.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    try {
      await signupMutation.mutateAsync(form);
      toast.success("Admin account created! Please log in.");
      router.push("/login");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Signup failed. Make sure ALLOW_ADMIN_SIGNUP=true on the backend.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Card className="w-full max-w-sm border border-zinc-200 shadow-sm">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-base font-semibold">
            Create Admin Account
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            One-time setup — disable{" "}
            <code className="bg-zinc-100 px-1 rounded">ALLOW_ADMIN_SIGNUP</code>{" "}
            after this.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Admin Name"
                className="h-8 text-xs"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, passwordHash: e.target.value }))
                }
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="w-full h-8 text-xs bg-black hover:bg-zinc-800 text-white"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
