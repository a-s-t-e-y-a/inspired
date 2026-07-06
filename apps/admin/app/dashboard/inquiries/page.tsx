"use client";

import { useState } from "react";
import { useGetInquiries, useArchiveInquiry, useDeleteInquiry, Inquiry } from "@/queries/inquiries.queries";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import toast from "react-hot-toast";
import { InquiryDialog } from "./inquiry-dialog";

export default function InquiriesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const { data, isLoading } = useGetInquiries(page);
  const archiveMutation = useArchiveInquiry();
  const deleteMutation = useDeleteInquiry();

  const inquiries = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const filtered = search
    ? inquiries.filter((i) => 
        i.fullName.toLowerCase().includes(search.toLowerCase()) ||
        i.email.toLowerCase().includes(search.toLowerCase())
      )
    : inquiries;

  const handleArchive = async (id: string) => {
    try { await archiveMutation.mutateAsync(id); toast.success("Inquiry archived"); }
    catch { toast.error("Failed to archive"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this inquiry?")) return;
    try { await deleteMutation.mutateAsync(id); toast.success("Inquiry deleted"); }
    catch { toast.error("Failed to delete"); }
  };

  const openViewDialog = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setDialogOpen(true);
  };

  return (
    <div>
      <PageHeader 
        title="Inquiries" 
        description={`${total} total inquiries from website`} 
      />
      
      <div className="mb-6 mt-4">
        <Input 
          placeholder="Search by name or email..." 
          className="max-w-xs" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>
      
      <div className="border border-zinc-200 bg-white rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/50">
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center text-zinc-400 py-12">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-zinc-400 py-12">No inquiries found</TableCell></TableRow>
            ) : filtered.map((i) => (
              <TableRow key={i._id} className="hover:bg-zinc-50/50">
                <TableCell className="text-zinc-500 whitespace-nowrap">
                  {new Date(i.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-medium text-black">{i.fullName}</TableCell>
                <TableCell className="text-zinc-500">
                  {i.email}
                  <br />
                  <span className="text-xs text-zinc-400">{i.phone}</span>
                </TableCell>
                <TableCell className="text-zinc-500">
                  {i.source === 'contact_form' ? 'Book Consultation' : 'Need Help'}
                  {i.documentUrl && <span className="ml-2 text-xs bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-600">📎 Doc</span>}
                </TableCell>
                <TableCell>
                  {i.isArchived
                    ? <Badge variant="secondary">Archived</Badge>
                    : <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Active</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => openViewDialog(i)}>View</Button>
                    <Button size="sm" variant="outline" onClick={() => handleArchive(i._id)} disabled={archiveMutation.isPending || i.isArchived}>Archive</Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete(i._id)} disabled={deleteMutation.isPending}>Delete</Button>
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

      <InquiryDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        inquiry={selectedInquiry} 
      />
    </div>
  );
}
