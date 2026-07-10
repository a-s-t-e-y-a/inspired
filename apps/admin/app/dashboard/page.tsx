"use client";

import { useGetDoctors } from "@/queries/doctors.queries";
import { useGetBlogs } from "@/queries/blogs.queries";
import { useGetHospitals } from "@/queries/hospitals.queries";
import { useGetRooms } from "@/queries/rooms.queries";
import { useGetMedicalConditions } from "@/queries/medical-conditions.queries";
import { useGetInquiries } from "@/queries/inquiries.queries";
import Link from "next/link";

function StatCard({ label, count, href, loading }: { label: string; count?: number; href: string; loading: boolean }) {
  return (
    <Link
      href={href}
      className="block border border-zinc-200 bg-white rounded-xl p-6 hover:border-zinc-400 hover:shadow-sm transition-all group"
    >
      <p className="text-base text-zinc-500 font-medium group-hover:text-zinc-800 transition-colors">{label}</p>
      <p className="text-4xl font-bold mt-4 text-black tracking-tight">
        {loading ? <span className="text-zinc-300">—</span> : (count ?? 0)}
      </p>
    </Link>
  );
}

export default function DashboardPage() {
  const { data: doctors, isLoading: dL } = useGetDoctors(1);
  const { data: hospitals, isLoading: hL } = useGetHospitals(1);
  const { data: rooms, isLoading: rL } = useGetRooms(1);
  const { data: conditions, isLoading: cL } = useGetMedicalConditions(1);
  const { data: inquiries, isLoading: iL } = useGetInquiries(1);
  const { data: blogs, isLoading: bL } = useGetBlogs(1);

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black tracking-tight">Dashboard</h1>
        <p className="text-base text-zinc-500 mt-1">Overview of all resources</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Doctors" count={doctors?.total} href="/dashboard/doctors" loading={dL} />
        <StatCard label="Hospitals" count={hospitals?.total} href="/dashboard/hospitals" loading={hL} />
        <StatCard label="Rooms" count={rooms?.total} href="/dashboard/rooms" loading={rL} />
        <StatCard label="Medical Conditions" count={conditions?.total} href="/dashboard/medical-conditions" loading={cL} />
        <StatCard label="Inquiries" count={inquiries?.total} href="/dashboard/inquiries" loading={iL} />
        <StatCard label="Blog Posts" count={blogs?.total} href="/dashboard/blog" loading={bL} />
      </div>
    </div>
  );
}
