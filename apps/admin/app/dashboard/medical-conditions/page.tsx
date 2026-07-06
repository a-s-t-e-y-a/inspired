"use client";

import { useState } from "react";
import Link from "next/link";
import { useGetMedicalConditions, useArchiveMedicalCondition, useDeleteMedicalCondition, MedicalCondition } from "@/queries/medical-conditions.queries";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import toast from "react-hot-toast";
import { ConditionDialog } from "./condition-dialog";

export default function MedicalConditionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<MedicalCondition | null>(null);

  const { data, isLoading } = useGetMedicalConditions(page);
  const archiveMutation = useArchiveMedicalCondition();
  const deleteMutation = useDeleteMedicalCondition();

  const conditions = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const filtered = search
    ? conditions.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : conditions;

  const handleArchive = async (id: string) => {
    try { await archiveMutation.mutateAsync(id); toast.success("Condition archived"); }
    catch { toast.error("Failed to archive"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this medical condition?")) return;
    try { await deleteMutation.mutateAsync(id); toast.success("Condition deleted"); }
    catch { toast.error("Failed to delete"); }
  };

  const openCreateDialog = () => {
    setSelectedCondition(null);
    setDialogOpen(true);
  };
  
  const openEditDialog = (condition: MedicalCondition) => {
    setSelectedCondition(condition);
    setDialogOpen(true);
  };

  return (
    <div>
      <PageHeader 
        title="Medical Conditions" 
        description={`${total} total`} 
        action={<Button onClick={openCreateDialog}>+ Add Condition</Button>} 
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
              <TableHead>Code</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center text-zinc-400 py-12">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-zinc-400 py-12">No conditions found</TableCell></TableRow>
            ) : filtered.map((c) => (
              <TableRow key={c._id} className="hover:bg-zinc-50/50">
                <TableCell className="font-medium text-black">
                  <Link href={`/dashboard/medical-conditions/${c._id}`} className="text-indigo-650 hover:underline hover:text-indigo-800 transition-colors">
                    {c.name}
                  </Link>
                </TableCell>
                <TableCell className="text-zinc-500">{c.code || "—"}</TableCell>
                <TableCell className="text-zinc-500">{c.relevantSpecialty?.slice(0, 1).join(", ") || "—"}</TableCell>
                <TableCell>
                  {c.isArchived
                    ? <Badge variant="secondary">Archived</Badge>
                    : <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Active</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(c)}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => handleArchive(c._id)} disabled={archiveMutation.isPending}>Archive</Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete(c._id)} disabled={deleteMutation.isPending}>Delete</Button>
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

      <ConditionDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        condition={selectedCondition} 
      />
    </div>
  );
}
