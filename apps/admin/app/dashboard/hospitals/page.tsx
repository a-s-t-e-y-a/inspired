"use client";

import { useState } from "react";
import Link from "next/link";
import { useGetHospitals, useArchiveHospital, useDeleteHospital, Hospital } from "@/queries/hospitals.queries";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import toast from "react-hot-toast";
import { HospitalDialog } from "./hospital-dialog";

export default function HospitalsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  const { data, isLoading } = useGetHospitals(page);
  const archiveMutation = useArchiveHospital();
  const deleteMutation = useDeleteHospital();

  const hospitals = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const filtered = search
    ? hospitals.filter((h) => h.name.toLowerCase().includes(search.toLowerCase()))
    : hospitals;

  const handleArchive = async (id: string) => {
    try { await archiveMutation.mutateAsync(id); toast.success("Hospital archived"); }
    catch { toast.error("Failed to archive"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this hospital?")) return;
    try { await deleteMutation.mutateAsync(id); toast.success("Hospital deleted"); }
    catch { toast.error("Failed to delete"); }
  };

  const openCreateDialog = () => {
    setSelectedHospital(null);
    setDialogOpen(true);
  };
  
  const openEditDialog = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setDialogOpen(true);
  };

  return (
    <div>
      <PageHeader 
        title="Hospitals" 
        description={`${total} total`} 
        action={<Button onClick={openCreateDialog}>+ Add Hospital</Button>} 
      />
      
      <div className="mb-6">
        <Input 
          placeholder="Search on this page..." 
          className="max-w-xs" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>
      
      <div className="border border-zinc-200 bg-white rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/50">
              <TableHead>Name</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center text-zinc-400 py-12">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-zinc-400 py-12">No hospitals found</TableCell></TableRow>
            ) : filtered.map((h) => (
              <TableRow key={h._id} className="hover:bg-zinc-50/50">
                <TableCell className="font-medium text-black">
                  <Link href={`/dashboard/hospitals/${h._id}`} className="text-indigo-650 hover:underline hover:text-indigo-800 transition-colors">
                    {h.name}
                  </Link>
                </TableCell>
                <TableCell className="text-zinc-500">{h.medicalSpecialty?.slice(0, 2).join(", ") || "—"}</TableCell>
                <TableCell>
                  {h.isArchived
                    ? <Badge variant="secondary">Archived</Badge>
                    : <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Active</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(h)}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => handleArchive(h._id)} disabled={archiveMutation.isPending}>Archive</Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete(h._id)} disabled={deleteMutation.isPending}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-zinc-500">Page {page} of {totalPages} &middot; {total} total</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
            <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
          </div>
        </div>
      )}

      <HospitalDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        hospital={selectedHospital} 
      />
    </div>
  );
}
