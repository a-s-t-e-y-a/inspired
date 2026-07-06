"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetMedicalCondition } from "@/queries/medical-conditions.queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getFullImageUrl } from "@/lib/file-upload";
import { ConditionDialog } from "../condition-dialog";
import { 
  ArrowLeft, Edit, Mail, Phone, ShieldCheck, MapPin, Globe, Award, FileText, CheckCircle2, XCircle, HeartPulse, Activity, AlertTriangle, Info
} from "lucide-react";

export default function MedicalConditionDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: conditionData, isLoading, error } = useGetMedicalCondition(id);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-zinc-500 font-medium">Loading condition profile...</div>
      </div>
    );
  }

  if (error || !conditionData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="text-red-500 font-medium">Failed to load medical condition details.</div>
        <Link href="/dashboard/medical-conditions">
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to List</Button>
        </Link>
      </div>
    );
  }

  const cond = conditionData as any;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-zinc-150 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/medical-conditions">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
            </Button>
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="text-sm text-zinc-500 font-medium">Medical Condition Detail</span>
        </div>
        <Button onClick={() => setIsEditDialogOpen(true)}>
          <Edit className="h-4 w-4 mr-1.5" /> Edit Condition
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
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-zinc-900">{cond.name}</h1>
                  {cond.code && (
                    <Badge variant="outline" className="font-mono text-zinc-650 bg-zinc-50 border-zinc-200">
                      Code: {cond.code}
                    </Badge>
                  )}
                </div>
                {cond.alternateName && (
                  <p className="text-xs text-zinc-400 font-medium mt-0.5">Alternate Name: {cond.alternateName}</p>
                )}
                <p className="text-zinc-500 mt-2 text-sm">{cond.description || "No description provided."}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {cond.isArchived ? (
                  <Badge variant="secondary">Archived</Badge>
                ) : (
                  <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Active</Badge>
                )}
              </div>
            </div>

            {/* General Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 text-sm">
              {cond.url && (
                <div className="flex items-center gap-2 text-zinc-655 md:col-span-2">
                  <Globe className="h-4 w-4 text-zinc-450" />
                  <span className="font-medium text-zinc-900">Reference:</span>
                  <a href={cond.url} target="_blank" rel="noopener noreferrer" className="text-indigo-655 hover:underline truncate">
                    {cond.url}
                  </a>
                </div>
              )}
              {cond.disambiguatingDescription && (
                <div className="text-xs text-zinc-500 md:col-span-2 italic bg-zinc-50 p-2.5 rounded border border-zinc-100 flex items-start gap-2">
                  <Info className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Disambiguation:</strong> {cond.disambiguatingDescription}</span>
                </div>
              )}
            </div>
          </div>

          {/* Clinical Details */}
          {(cond.pathophysiology || cond.epidemiology || cond.expectedPrognosis || cond.naturalProgression) && (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-2 flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-zinc-450" /> Clinical Presentation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                {cond.pathophysiology && (
                  <div className="space-y-1">
                    <span className="font-semibold text-zinc-800 block">Pathophysiology</span>
                    <p className="text-zinc-600 text-xs leading-relaxed">{cond.pathophysiology}</p>
                  </div>
                )}
                {cond.epidemiology && (
                  <div className="space-y-1">
                    <span className="font-semibold text-zinc-800 block">Epidemiology</span>
                    <p className="text-zinc-600 text-xs leading-relaxed">{cond.epidemiology}</p>
                  </div>
                )}
                {cond.expectedPrognosis && (
                  <div className="space-y-1">
                    <span className="font-semibold text-zinc-800 block">Expected Prognosis</span>
                    <p className="text-zinc-600 text-xs leading-relaxed">{cond.expectedPrognosis}</p>
                  </div>
                )}
                {cond.naturalProgression && (
                  <div className="space-y-1">
                    <span className="font-semibold text-zinc-800 block">Natural Progression</span>
                    <p className="text-zinc-600 text-xs leading-relaxed">{cond.naturalProgression}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Causes, Risk Factors, Prevention */}
          {(cond.cause || cond.riskFactor || cond.primaryPrevention || cond.secondaryPrevention) && (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-zinc-450" /> Etiology & Prevention
              </h2>
              
              <div className="space-y-4 text-sm">
                {cond.cause && cond.cause.length > 0 && (
                  <div>
                    <span className="font-semibold text-zinc-800 block mb-1.5">Triggers & Causes</span>
                    <div className="flex flex-wrap gap-1">
                      {cond.cause.map((c: any) => (
                        <Badge key={c} variant="outline" className="bg-red-50/30 border-red-200 text-red-700">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {cond.riskFactor && cond.riskFactor.length > 0 && (
                  <div>
                    <span className="font-semibold text-zinc-800 block mb-1.5">Risk Factors</span>
                    <div className="flex flex-wrap gap-1">
                      {cond.riskFactor.map((rf: any) => (
                        <Badge key={rf} variant="outline" className="bg-zinc-50 border-zinc-200 text-zinc-650">{rf}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {cond.primaryPrevention && (
                  <div className="space-y-1 bg-zinc-50/50 p-3 rounded border border-zinc-100">
                    <span className="font-semibold text-zinc-800 block">Primary Prevention</span>
                    <p className="text-zinc-600 text-xs leading-relaxed">{cond.primaryPrevention}</p>
                  </div>
                )}

                {cond.secondaryPrevention && (
                  <div className="space-y-1 bg-zinc-50/50 p-3 rounded border border-zinc-100">
                    <span className="font-semibold text-zinc-800 block">Secondary Prevention</span>
                    <p className="text-zinc-600 text-xs leading-relaxed">{cond.secondaryPrevention}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Symptoms, Specialties & Previews & SEO */}
        <div className="space-y-6">
          {/* Taxonomy Details */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-2">Classification</h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Relevant Specialties</div>
                <div className="flex flex-wrap gap-1.5">
                  {cond.relevantSpecialty && cond.relevantSpecialty.length > 0 ? (
                    cond.relevantSpecialty.map((cat: any) => (
                      <Badge key={cat} variant="outline" className="bg-indigo-50/40 border-indigo-100 text-indigo-750">{cat}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-450 italic">—</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Signs & Symptoms</div>
                <div className="flex flex-wrap gap-1.5">
                  {cond.signOrSymptom && cond.signOrSymptom.length > 0 ? (
                    cond.signOrSymptom.map((spec: any) => (
                      <Badge key={spec} variant="outline" className="bg-zinc-50 border-zinc-200 text-zinc-650">{spec}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-455 italic">—</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Possible Treatments</div>
                <div className="flex flex-wrap gap-1.5">
                  {cond.possibleTreatment && cond.possibleTreatment.length > 0 ? (
                    cond.possibleTreatment.map((srv: any) => (
                      <Badge key={srv} variant="outline" className="bg-emerald-50/50 border-emerald-100 text-emerald-700">{srv}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-455 italic">—</span>
                  )}
                </div>
              </div>

              {cond.drug && cond.drug.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Common Medications</div>
                  <div className="flex flex-wrap gap-1.5">
                    {cond.drug.map((srv: any) => (
                      <Badge key={srv} variant="outline" className="bg-zinc-50 border-zinc-200 text-zinc-650">{srv}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Media/Images Previews */}
          {cond.image && cond.image.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-zinc-900">Clinical Photos</h2>
              <div className="grid grid-cols-2 gap-3 pt-1">
                {cond.image.map((img: string, i: number) => (
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
          {cond.seo && (cond.seo.metaTitle || cond.seo.metaDescription || (cond.seo.keywords && cond.seo.keywords.length > 0)) && (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-2">Search Optimization</h2>
              <div className="space-y-3 text-xs leading-relaxed text-zinc-650">
                {cond.seo.metaTitle && (
                  <div>
                    <span className="font-semibold text-zinc-900 block mb-0.5">Meta Title</span>
                    <span className="bg-zinc-50 px-2 py-1 rounded border border-zinc-100 block">{cond.seo.metaTitle}</span>
                  </div>
                )}
                {cond.seo.metaDescription && (
                  <div>
                    <span className="font-semibold text-zinc-900 block mb-0.5">Meta Description</span>
                    <span className="bg-zinc-50 px-2 py-1 rounded border border-zinc-100 block">{cond.seo.metaDescription}</span>
                  </div>
                )}
                {cond.seo.keywords && cond.seo.keywords.length > 0 && (
                  <div>
                    <span className="font-semibold text-zinc-900 block mb-1">Keywords</span>
                    <div className="flex flex-wrap gap-1">
                      {cond.seo.keywords.map((kw: string) => (
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

      <ConditionDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        condition={cond} 
      />
    </div>
  );
}
