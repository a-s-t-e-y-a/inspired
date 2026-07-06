"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetHospital } from "@/queries/hospitals.queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getFullImageUrl } from "@/lib/file-upload";
import { HospitalDialog } from "../hospital-dialog";
import { 
  ArrowLeft, Edit, Mail, Phone, ShieldCheck, MapPin, Globe, Award, FileText, CheckCircle2, XCircle, Clock, Building
} from "lucide-react";

export default function HospitalDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: hospital, isLoading, error } = useGetHospital(id);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-zinc-500 font-medium">Loading hospital profile...</div>
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="text-red-500 font-medium">Failed to load hospital profile.</div>
        <Link href="/dashboard/hospitals">
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to List</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-zinc-150 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/hospitals">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
            </Button>
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="text-sm text-zinc-500 font-medium">Hospital Detail</span>
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
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {hospital.logo ? (
                  <div className="h-16 w-16 rounded-lg border border-zinc-200 overflow-hidden bg-zinc-50 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={getFullImageUrl(hospital.logo)} 
                      alt="Logo" 
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0 text-zinc-400">
                    <Building className="h-8 w-8" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-zinc-900">{hospital.name}</h1>
                  {hospital.slogan && <p className="text-indigo-600 font-medium text-xs mt-0.5 italic">"{hospital.slogan}"</p>}
                  <p className="text-zinc-500 mt-1 text-sm">{hospital.description || "No description provided."}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                {hospital.isArchived ? (
                  <Badge variant="secondary">Archived</Badge>
                ) : (
                  <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Active</Badge>
                )}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 bg-zinc-50 px-2 py-1 rounded border border-zinc-100 mt-1">
                  {hospital.isAcceptingNewPatients ? (
                    <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Accepting Patients</span>
                  ) : (
                    <span className="text-amber-600 flex items-center gap-1"><XCircle className="h-3 w-3" /> Not Accepting Patients</span>
                  )}
                </div>
              </div>
            </div>

            {/* General Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 text-sm">
              {(hospital as any).owner && (
                <div className="flex items-center gap-2 text-zinc-600">
                  <Building className="h-4 w-4 text-zinc-450" />
                  <span><strong>Owner:</strong> {(hospital as any).owner}</span>
                </div>
              )}
              {hospital.url && (
                <div className="flex items-center gap-2 text-zinc-600">
                  <Globe className="h-4 w-4 text-zinc-450" />
                  <a href={hospital.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate">
                    {hospital.url}
                  </a>
                </div>
              )}
              {hospital.priceRange && (
                <div className="flex items-center gap-2 text-zinc-600">
                  <span className="font-semibold text-zinc-900">Price Range:</span>
                  <Badge variant="outline" className="text-zinc-650 bg-zinc-50 border-zinc-200">{hospital.priceRange}</Badge>
                </div>
              )}
              {(hospital as any).disambiguatingDescription && (
                <div className="text-xs text-zinc-500 md:col-span-2 italic">
                  <strong>Notes:</strong> {(hospital as any).disambiguatingDescription}
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
                <div className="flex items-center gap-2 text-zinc-600">
                  <Mail className="h-4 w-4 text-zinc-400" />
                  <span className="font-medium text-zinc-900">Email:</span>
                  <span>{hospital.email || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-600">
                  <Phone className="h-4 w-4 text-zinc-400" />
                  <span className="font-medium text-zinc-900">Telephone:</span>
                  <span>{hospital.telephone || "—"}</span>
                </div>
                {(hospital as any).faxNumber && (
                  <div className="flex items-center gap-2 text-zinc-600">
                    <FileText className="h-4 w-4 text-zinc-400" />
                    <span className="font-medium text-zinc-900">Fax:</span>
                    <span>{(hospital as any).faxNumber}</span>
                  </div>
                )}
              </div>

              {(hospital as any).address && (
                <div className="bg-zinc-50 border border-zinc-150 rounded-lg p-4 space-y-2">
                  <div className="font-semibold text-zinc-950 text-xs uppercase tracking-wider">Office Address</div>
                  <div className="text-zinc-600 leading-relaxed text-xs">
                    {(hospital as any).address.streetAddress && <div>{(hospital as any).address.streetAddress}</div>}
                    <div>
                      {[(hospital as any).address.addressLocality, (hospital as any).address.addressRegion, (hospital as any).address.postalCode]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                    {(hospital as any).address.addressCountry && <div>{(hospital as any).address.addressCountry}</div>}
                  </div>
                  {(hospital as any).geo && ((hospital as any).geo.latitude || (hospital as any).geo.longitude) && (
                    <div className="text-[10px] text-zinc-400 font-mono pt-1.5 border-t border-zinc-200">
                      GPS: Lat {(hospital as any).geo.latitude}, Lng {(hospital as any).geo.longitude}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Opening Hours Specification */}
          {(hospital as any).openingHoursSpecification && (hospital as any).openingHoursSpecification.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-400" /> Operating Schedule
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-sm">
                {(hospital as any).openingHoursSpecification.map((row: any, i: number) => (
                  <div key={i} className="flex justify-between items-center bg-zinc-50 border border-zinc-150 rounded px-3 py-2">
                    <span className="font-semibold text-zinc-800">{row.dayOfWeek}</span>
                    <span className="text-zinc-600 font-mono text-xs">{row.opens} – {row.closes}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Specialties & Previews & SEO */}
        <div className="space-y-6">
          {/* Classification details */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-2">Classification</h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Medical Specialties</div>
                <div className="flex flex-wrap gap-1.5">
                  {hospital.medicalSpecialty && hospital.medicalSpecialty.length > 0 ? (
                    hospital.medicalSpecialty.map((spec) => (
                      <Badge key={spec} variant="outline" className="bg-blue-50/50 border-blue-100 text-blue-700">{spec}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-400 italic">—</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Available Services</div>
                <div className="flex flex-wrap gap-1.5">
                  {hospital.availableService && hospital.availableService.length > 0 ? (
                    hospital.availableService.map((srv) => (
                      <Badge key={srv} variant="outline" className="bg-zinc-50 border-zinc-200 text-zinc-600">{srv}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-400 italic">—</span>
                  )}
                </div>
              </div>

              {((hospital as any).awards && (hospital as any).awards.length > 0) && (
                <div>
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-zinc-450" /> Awards & Recognitions
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(hospital as any).awards.map((aw: string) => (
                      <Badge key={aw} variant="outline" className="bg-amber-50/30 border-amber-200/50 text-amber-800">{aw}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {((hospital as any).alumni && (hospital as any).alumni.length > 0) && (
                <div>
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Notable Alumni</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(hospital as any).alumni.map((al: string) => (
                      <Badge key={al} variant="outline" className="bg-zinc-50 border-zinc-200 text-zinc-600">{al}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Media/Images Previews */}
          {hospital.image && hospital.image.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-zinc-900">Hospital Photos</h2>
              <div className="grid grid-cols-2 gap-3 pt-1">
                {hospital.image.map((img, i) => (
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
          {(hospital as any).seo && ((hospital as any).seo.metaTitle || (hospital as any).seo.metaDescription || ((hospital as any).seo.keywords && (hospital as any).seo.keywords.length > 0)) && (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-2">Search Optimization</h2>
              <div className="space-y-3 text-xs leading-relaxed text-zinc-600">
                {(hospital as any).seo.metaTitle && (
                  <div>
                    <span className="font-semibold text-zinc-900 block mb-0.5">Meta Title</span>
                    <span className="bg-zinc-50 px-2 py-1 rounded border border-zinc-100 block">{(hospital as any).seo.metaTitle}</span>
                  </div>
                )}
                {(hospital as any).seo.metaDescription && (
                  <div>
                    <span className="font-semibold text-zinc-900 block mb-0.5">Meta Description</span>
                    <span className="bg-zinc-50 px-2 py-1 rounded border border-zinc-100 block">{(hospital as any).seo.metaDescription}</span>
                  </div>
                )}
                {(hospital as any).seo.keywords && (hospital as any).seo.keywords.length > 0 && (
                  <div>
                    <span className="font-semibold text-zinc-900 block mb-1">Keywords</span>
                    <div className="flex flex-wrap gap-1">
                      {(hospital as any).seo.keywords.map((kw: string) => (
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

      <HospitalDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        hospital={hospital} 
      />
    </div>
  );
}
