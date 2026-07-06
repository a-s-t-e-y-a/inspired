"use client";

import { useState } from "react";
import { useGetAdmins, useCreateAdmin, useDeleteAdmin } from "@/queries/admins.queries";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: admins, isLoading } = useGetAdmins();
  const createAdmin = useCreateAdmin();
  const deleteAdmin = useDeleteAdmin();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    try {
      await createAdmin.mutateAsync({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      toast.success(`Admin "${form.name}" created successfully`);
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create admin");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAdmin.mutateAsync(id);
      toast.success("Admin deleted");
      setDeleteConfirmId(null);
    } catch {
      toast.error("Failed to delete admin");
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-4xl space-y-10">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Manage administrator accounts and access control.
        </p>
      </div>

      {/* ── Admin Users Table ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-800">Admin Users</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              All accounts with admin access to this dashboard.
            </p>
          </div>
          <span className="text-xs bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full font-medium">
            {admins?.length ?? 0} admin{admins?.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="border border-zinc-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-zinc-400 animate-pulse">
              Loading admins...
            </div>
          ) : !admins?.length ? (
            <div className="p-8 text-center text-sm text-zinc-400">
              No admins found.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wide">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wide">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wide">
                    Last Login
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wide">
                    Created
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-zinc-800 text-white text-xs flex items-center justify-center font-semibold uppercase flex-shrink-0">
                          {admin.name.charAt(0)}
                        </div>
                        <span className="font-medium text-zinc-800">{admin.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{admin.email}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {formatDate(admin.lastLoginAt)}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {formatDate(admin.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {deleteConfirmId === admin._id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-zinc-500">Sure?</span>
                          <button
                            onClick={() => handleDelete(admin._id)}
                            disabled={deleteAdmin.isPending}
                            className="text-xs px-2.5 py-1 rounded bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                          >
                            {deleteAdmin.isPending ? "Deleting..." : "Yes, delete"}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-xs px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(admin._id)}
                          className="text-xs text-zinc-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ── Create New Admin Form ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-800">Create New Admin</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            New admin will be able to log in immediately with these credentials.
          </p>
        </div>

        <form
          onSubmit={handleCreate}
          className="border border-zinc-200 rounded-xl p-6 space-y-4 bg-white"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-600">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Dr. Sharma"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 transition"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-600">Email</label>
              <input
                type="email"
                placeholder="admin@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 transition"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-600">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-600">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                required
                className={`w-full px-3 py-2 border rounded-lg text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 transition ${
                  form.confirmPassword && form.password !== form.confirmPassword
                    ? "border-red-300 focus:ring-red-200"
                    : "border-zinc-200 focus:ring-zinc-300"
                }`}
              />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-red-500">Passwords don&apos;t match</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
            <p className="text-xs text-zinc-400">
              Admin will be able to log in at{" "}
              <span className="font-mono">/login</span>
            </p>
            <button
              type="submit"
              disabled={
                createAdmin.isPending ||
                !form.name ||
                !form.email ||
                !form.password ||
                form.password !== form.confirmPassword
              }
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {createAdmin.isPending ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Admin"
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
