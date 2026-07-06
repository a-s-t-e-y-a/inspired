"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetDoctor } from "@/queries/doctors.queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getFullImageUrl } from "@/lib/file-upload";
import { DoctorDialog } from "../doctor-dialog";
import {
  ArrowLeft, Edit, Mail, Phone, ShieldCheck, MapPin, Globe, Award, FileText, CheckCircle2, XCircle
} from "lucide-react";

export default function DoctorDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: doctorData, isLoading, error } = useGetDoctor(id);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-zinc-500 font-medium">Loading doctor profile...</div>
      </div>
    );
  }

  if (error || !doctorData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="text-red-500 font-medium">Failed to load doctor profile.</div>
        <Link href="/dashboard/doctors">
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to List</Button>
        </Link>
      </div>
    );
  }

  const doc = doctorData as any;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-zinc-150 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/doctors">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
            </Button>
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="text-sm text-zinc-500 font-medium">Doctor Detail</span>
        </div>
        <Button onClick={() => setIsEditDialogOpen(true)}>
          <Edit className="h-4 w-4 mr-1.5" /> Edit Profile
        </Button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Columns - Core Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">{doc.name}</h1>
                <p className="text-zinc-500 mt-1 text-sm">{doc.description || "No description provided."}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {doc.isArchived ? (
                  <Badge variant="secondary">Archived</Badge>
                ) : (
                  <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Active</Badge>
                )}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 bg-zinc-50 px-2 py-1 rounded border border-zinc-100 mt-1">
                  {doc.isAcceptingNewPatients ? (
                    <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Accepting Patients</span>
                  ) : (
                    <span className="text-amber-600 flex items-center gap-1"><XCircle className="h-3 w-3" /> Not Accepting Patients</span>
                  )}
                </div>
              </div>
            </div>

            {/* General Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 text-sm">
              {doc.usNPI && (
                <div className="flex items-center gap-2 text-zinc-650">
                  <ShieldCheck className="h-4 w-4 text-indigo-500" />
                  <span><strong>US NPI:</strong> {doc.usNPI}</span>
                </div>
              )}
              {doc.url && (
                <div className="flex items-center gap-2 text-zinc-650">
                  <Globe className="h-4 w-4 text-zinc-450" />
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-indigo-650 hover:underline truncate">
                    {doc.url}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Contact & Address Card */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-zinc-400" /> Contact & Location
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-650">
                  <Mail className="h-4 w-4 text-zinc-450" />
                  <span className="font-medium text-zinc-900">Email:</span>
                  <span>{doc.email || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-650">
                  <Phone className="h-4 w-4 text-zinc-455" />
                  <span className="font-medium text-zinc-900">Telephone:</span>
                  <span>{doc.telephone || "—"}</span>
                </div>
                {doc.faxNumber && (
                  <div className="flex items-center gap-2 text-zinc-650">
                    <FileText className="h-4 w-4 text-zinc-450" />
                    <span className="font-medium text-zinc-900">Fax:</span>
                    <span>{doc.faxNumber}</span>
                  </div>
                )}
              </div>

              {doc.address && (
                <div className="bg-zinc-50 border border-zinc-150 rounded-lg p-4 space-y-2">
                  <div className="font-semibold text-zinc-950 text-xs uppercase tracking-wider">Office Address</div>
                  <div className="text-zinc-650 leading-relaxed text-xs">
                    {doc.address.streetAddress && <div>{doc.address.streetAddress}</div>}
                    <div>
                      {[doc.address.addressLocality, doc.address.addressRegion, doc.address.postalCode]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                    {doc.address.addressCountry && <div>{doc.address.addressCountry}</div>}
                  </div>
                  {doc.geo && (doc.geo.latitude || doc.geo.longitude) && (
                    <div className="text-[10px] text-zinc-400 font-mono pt-1.5 border-t border-zinc-200">
                      GPS: Lat {doc.geo.latitude}, Lng {doc.geo.longitude}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Hospital Affiliations */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Award className="h-4 w-4 text-zinc-450" /> Affiliated Hospitals
            </h2>
            <div className="flex flex-wrap gap-2 pt-1">
              {doc.hospitalAffiliation && doc.hospitalAffiliation.length > 0 ? (
                doc.hospitalAffiliation.map((hosp: any) => {
                  const isPopulated = typeof hosp === "object" && hosp !== null;
                  const name = isPopulated ? hosp.name : "Hospital ID: " + hosp;
                  const id = isPopulated ? hosp._id : hosp;
                  return (
                    <Link key={id} href={`/dashboard/hospitals/${id}`}>
                      <Badge className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-150 cursor-pointer transition-colors">
                        {name}
                      </Badge>
                    </Link>
                  );
                })
              ) : (
                <span className="text-sm text-zinc-450 italic">No affiliations saved.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Specialties & Previews & SEO */}
        <div className="space-y-6">
          {/* Taxonomy Details */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-2">Classification</h2>

            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Occupational Category</div>
                <div className="flex flex-wrap gap-1.5">
                  {doc.occupationalCategory && doc.occupationalCategory.length > 0 ? (
                    doc.occupationalCategory.map((cat: any) => (
                      <Badge key={cat} variant="outline" className="bg-zinc-50 border-zinc-200 text-zinc-655">{cat}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-450 italic">—</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Medical Specialties</div>
                <div className="flex flex-wrap gap-1.5">
                  {doc.medicalSpecialty && doc.medicalSpecialty.length > 0 ? (
                    doc.medicalSpecialty.map((spec: any) => (
                      <Badge key={spec} variant="outline" className="bg-blue-50/50 border-blue-100 text-blue-700">{spec}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-450 italic">—</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Available Services</div>
                <div className="flex flex-wrap gap-1.5">
                  {doc.availableService && doc.availableService.length > 0 ? (
                    doc.availableService.map((srv: any) => (
                      <Badge key={srv} variant="outline" className="bg-zinc-50 border-zinc-200 text-zinc-650">{srv}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-450 italic">—</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Media/Images Previews */}
          {doc.image && doc.image.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-zinc-900">Uploaded Photos</h2>
              <div className="grid grid-cols-2 gap-3 pt-1">
                {doc.image.map((img: string, i: number) => (
                  <div key={i} className="aspect-square relative rounded-lg border border-zinc-150 overflow-hidden bg-zinc-50 shadow-inner group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getFullImageUrl(img)}
                      alt={`Photo ${i + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEO Performance Card */}
          {doc.seo && (doc.seo.metaTitle || doc.seo.metaDescription || (doc.seo.keywords && doc.seo.keywords.length > 0)) && (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-2">Search Optimization</h2>
              <div className="space-y-3 text-xs leading-relaxed text-zinc-650">
                {doc.seo.metaTitle && (
                  <div>
                    <span className="font-semibold text-zinc-900 block mb-0.5">Meta Title</span>
                    <span className="bg-zinc-50 px-2 py-1 rounded border border-zinc-100 block">{doc.seo.metaTitle}</span>
                  </div>
                )}
                {doc.seo.metaDescription && (
                  <div>
                    <span className="font-semibold text-zinc-900 block mb-0.5">Meta Description</span>
                    <span className="bg-zinc-50 px-2 py-1 rounded border border-zinc-100 block">{doc.seo.metaDescription}</span>
                  </div>
                )}
                {doc.seo.keywords && doc.seo.keywords.length > 0 && (
                  <div>
                    <span className="font-semibold text-zinc-900 block mb-1">Keywords</span>
                    <div className="flex flex-wrap gap-1">
                      {doc.seo.keywords.map((kw: string) => (
                        <Badge key={kw} variant="outline" className="text-[10px] bg-zinc-50 py-0 text-zinc-500 border-zinc-100">{kw}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <DoctorDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        doctor={doc}
      />
    </div>
  );
}
