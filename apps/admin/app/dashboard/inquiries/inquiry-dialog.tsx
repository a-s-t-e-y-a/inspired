"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Inquiry } from "@/queries/inquiries.queries";
import { Badge } from "@/components/ui/badge";

interface InquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inquiry: Inquiry | null;
}

export function InquiryDialog({ open, onOpenChange, inquiry }: InquiryDialogProps) {
  if (!inquiry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Inquiry Details</DialogTitle>
          <DialogDescription>
            Submitted via {inquiry.source === 'contact_form' ? 'Book Consultation' : 'Need Help'} form
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-zinc-500">Full Name</p>
              <p className="text-base font-semibold">{inquiry.fullName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Country</p>
              <p className="text-base font-semibold">{inquiry.country}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Email</p>
              <p className="text-base font-semibold">{inquiry.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Phone</p>
              <p className="text-base font-semibold">{inquiry.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Date Submitted</p>
              <p className="text-base font-semibold">{new Date(inquiry.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Status</p>
              <div className="mt-1">
                {inquiry.isArchived ? (
                  <Badge variant="secondary">Archived</Badge>
                ) : (
                  <Badge className="bg-emerald-50 text-emerald-700">Active</Badge>
                )}
              </div>
            </div>
          </div>

          {inquiry.medicalCondition && (
            <div className="border-t border-zinc-100 pt-4">
              <p className="text-sm font-medium text-zinc-500 mb-2">Medical Condition</p>
              <div className="bg-zinc-50 p-4 rounded-lg text-sm whitespace-pre-wrap text-zinc-700">
                {inquiry.medicalCondition}
              </div>
            </div>
          )}

          {inquiry.documentUrl && (
            <div className="border-t border-zinc-100 pt-4 flex flex-col items-start gap-2">
              <p className="text-sm font-medium text-zinc-500">Medical Document</p>
              <a 
                href={inquiry.documentUrl} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex"
              >
                <Button variant="outline">View Document</Button>
              </a>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-6 border-t border-zinc-100 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
