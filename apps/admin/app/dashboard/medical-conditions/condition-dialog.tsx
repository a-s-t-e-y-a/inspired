"use client";

import { useEffect, useState, useCallback } from "react";
import {
  useCreateMedicalCondition,
  useUpdateMedicalCondition,
  MedicalCondition,
  CreateMedicalConditionPayload,
} from "@/queries/medical-conditions.queries";
import { getImageKey } from "@/lib/file-upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/custom/image-upload";
import toast from "react-hot-toast";

interface ConditionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  condition?: MedicalCondition | null;
}

type SectionKey = "basic" | "clinical" | "symptoms" | "treatment" | "images" | "seo";

function Section({
  title,
  id,
  open,
  toggle,
  children,
}: {
  title: string;
  id: SectionKey;
  open: boolean;
  toggle: (id: SectionKey) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => toggle(id)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-zinc-50 hover:bg-zinc-100 text-sm font-medium text-zinc-700 transition-colors"
      >
        <span>{title}</span>
        <svg
          className={`h-4 w-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </div>
  );
}

export function ConditionDialog({ open, onOpenChange, condition }: ConditionDialogProps) {
  const isEditing = !!condition;
  const createMutation = useCreateMedicalCondition();
  const updateMutation = useUpdateMedicalCondition();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string, type: "url") => {
    let errMsg = "";
    if (value) {
      if (type === "url") {
        if (!/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(value)) {
          errMsg = "Must be a valid URL (e.g. https://example.com)";
        }
      }
    }
    setErrors((prev) => ({ ...prev, [field]: errMsg }));
  };

  const [sections, setSections] = useState<Record<SectionKey, boolean>>({
    basic: true,
    clinical: false,
    symptoms: false,
    treatment: false,
    images: false,
    seo: false,
  });
  const toggle = (id: SectionKey) =>
    setSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const emptyForm = () => ({
    name: "",
    alternateName: "",
    description: "",
    disambiguatingDescription: "",
    code: "",
    url: "",
    // Clinical
    pathophysiology: "",
    epidemiology: "",
    expectedPrognosis: "",
    naturalProgression: "",
    // Causes & Risks
    cause: "",
    riskFactor: "",
    // Symptoms & Diagnosis
    signOrSymptom: "",
    differentialDiagnosis: "",
    typicalTest: "",
    stage: "",
    // Treatment & Prevention
    possibleTreatment: "",
    primaryPrevention: "",
    secondaryPrevention: "",
    drug: "",
    // Specialty
    relevantSpecialty: "",
    // Media & SEO
    image: [] as string[],
    seo: { metaTitle: "", metaDescription: "", keywords: "" as unknown as string[] },
  });

  const [form, setForm] = useState(emptyForm());
  const [uploadedImages, setUploadedImages] = useState<
    Array<{ file: File; alt: string; preview: string; finalUrl?: string; key?: string }>
  >([]);

  useEffect(() => {
    if (open) {
      if (condition) {
        setForm({
          name: condition.name || "",
          alternateName: condition.alternateName || "",
          description: condition.description || "",
          disambiguatingDescription: (condition as any).disambiguatingDescription || "",
          code: condition.code || "",
          url: (condition as any).url || "",
          pathophysiology: (condition as any).pathophysiology || "",
          epidemiology: (condition as any).epidemiology || "",
          expectedPrognosis: (condition as any).expectedPrognosis || "",
          naturalProgression: (condition as any).naturalProgression || "",
          cause: condition.cause ? condition.cause.join(", ") : "",
          riskFactor: condition.riskFactor ? condition.riskFactor.join(", ") : "",
          signOrSymptom: condition.signOrSymptom ? condition.signOrSymptom.join(", ") : "",
          differentialDiagnosis: (condition as any).differentialDiagnosis ? (condition as any).differentialDiagnosis.join(", ") : "",
          typicalTest: (condition as any).typicalTest ? (condition as any).typicalTest.join(", ") : "",
          stage: (condition as any).stage ? (condition as any).stage.join(", ") : "",
          possibleTreatment: condition.possibleTreatment ? condition.possibleTreatment.join(", ") : "",
          primaryPrevention: (condition as any).primaryPrevention || "",
          secondaryPrevention: (condition as any).secondaryPrevention || "",
          drug: (condition as any).drug ? (condition as any).drug.join(", ") : "",
          relevantSpecialty: condition.relevantSpecialty ? condition.relevantSpecialty.join(", ") : "",
          image: condition.image || [],
          seo: {
            metaTitle: (condition as any).seo?.metaTitle || "",
            metaDescription: (condition as any).seo?.metaDescription || "",
            keywords: (condition as any).seo?.keywords ? (condition as any).seo.keywords.join(", ") : "" as unknown as string[],
          },
        });
        setUploadedImages([]);
      } else {
        setForm(emptyForm());
        setUploadedImages([]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, condition]);

  const setField = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const setNested = (parent: string, field: string, value: unknown) =>
    setForm((prev) => ({
      ...prev,
      [parent]: { ...(prev as any)[parent], [field]: value },
    }));

  const csvToArr = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);
  const arrToCsv = (a: string[] | undefined) => (a || []).join(", ");

  const handleCommaInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: string,
    isNestedSeo = false
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = e.currentTarget.value;
      if (val && !val.trim().endsWith(",")) {
        const updated = val.trim() + ", ";
        if (isNestedSeo) {
          setNested("seo", "keywords", updated);
        } else {
          setField(field, updated);
        }
      }
    }
  };

  const onImagesChange = useCallback(
    (imgs: Array<{ file: File; alt: string; preview: string; finalUrl?: string; key?: string }>) => {
      setUploadedImages(imgs);
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasErrors = Object.values(errors).some(Boolean);
    if (hasErrors) {
      toast.error("Please fix the validation errors before saving");
      return;
    }

    const finalKeys = uploadedImages
      .map((img) => getImageKey(img.finalUrl || img.key || ""))
      .filter(Boolean);

    const payload: Partial<CreateMedicalConditionPayload> = {
      ...form,
      cause: csvToArr(form.cause as unknown as string),
      riskFactor: csvToArr(form.riskFactor as unknown as string),
      signOrSymptom: csvToArr(form.signOrSymptom as unknown as string),
      differentialDiagnosis: csvToArr(form.differentialDiagnosis as unknown as string),
      typicalTest: csvToArr(form.typicalTest as unknown as string),
      stage: csvToArr(form.stage as unknown as string),
      possibleTreatment: csvToArr(form.possibleTreatment as unknown as string),
      drug: csvToArr(form.drug as unknown as string),
      relevantSpecialty: csvToArr(form.relevantSpecialty as unknown as string),
      image: finalKeys.length > 0 ? finalKeys : form.image.map(getImageKey),
      seo:
        form.seo.metaTitle || form.seo.metaDescription || form.seo.keywords
          ? {
              metaTitle: form.seo.metaTitle,
              metaDescription: form.seo.metaDescription,
              keywords: csvToArr(form.seo.keywords as unknown as string),
            }
          : undefined,
    };

    // Strip empty optional strings
    if (!payload.url) delete payload.url;
    if (!payload.disambiguatingDescription) delete payload.disambiguatingDescription;
    if (!payload.pathophysiology) delete payload.pathophysiology;
    if (!payload.epidemiology) delete payload.epidemiology;
    if (!payload.expectedPrognosis) delete payload.expectedPrognosis;
    if (!payload.naturalProgression) delete payload.naturalProgression;
    if (!payload.primaryPrevention) delete payload.primaryPrevention;
    if (!payload.secondaryPrevention) delete payload.secondaryPrevention;

    try {
      if (isEditing && condition) {
        await updateMutation.mutateAsync({ id: condition._id, payload });
        toast.success("Condition updated");
      } else {
        await createMutation.mutateAsync(payload as CreateMedicalConditionPayload);
        toast.success("Condition created");
      }
      onOpenChange(false);
    } catch {
      toast.error(`Failed to ${isEditing ? "update" : "create"} condition`);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Medical Condition" : "Add Medical Condition"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the condition's information below."
              : "Create a new medical condition record."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* ── Basic Info ─────────────────────────────────── */}
          <Section title="Basic Information" id="basic" open={sections.basic} toggle={toggle}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label>Name *</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="Asthma"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Alternate Name</Label>
                <Input
                  value={form.alternateName}
                  onChange={(e) => setField("alternateName", e.target.value)}
                  placeholder="Bronchial Asthma"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Medical Code (ICD-10)</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setField("code", e.target.value)}
                  placeholder="J45.909"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Brief overview of the condition..."
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Disambiguating Description</Label>
                <Input
                  value={form.disambiguatingDescription}
                  onChange={(e) => setField("disambiguatingDescription", e.target.value)}
                  placeholder="E.g. distinguished from COPD by..."
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Reference URL</Label>
                <Input
                  type="url"
                  value={form.url}
                  onChange={(e) => {
                    setField("url", e.target.value);
                    validateField("url", e.target.value, "url");
                  }}
                  placeholder="https://medlineplus.gov/asthma"
                  className={errors.url ? "border-red-500" : ""}
                />
                {errors.url && <p className="text-xs text-red-500">{errors.url}</p>}
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Relevant Specialties (comma-separated)</Label>
                <Input
                  value={form.relevantSpecialty}
                  onChange={(e) => setField("relevantSpecialty", e.target.value)}
                  onKeyDown={(e) => handleCommaInputKeyDown(e, "relevantSpecialty")}
                  placeholder="Pulmonology, Allergy"
                />
              </div>
            </div>
          </Section>

          {/* ── Clinical Details ─────────────────────────── */}
          <Section title="Clinical Details" id="clinical" open={sections.clinical} toggle={toggle}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label>Pathophysiology</Label>
                <Textarea
                  rows={2}
                  value={form.pathophysiology}
                  onChange={(e) => setField("pathophysiology", e.target.value)}
                  placeholder="Mechanism of disease..."
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Epidemiology</Label>
                <Textarea
                  rows={2}
                  value={form.epidemiology}
                  onChange={(e) => setField("epidemiology", e.target.value)}
                  placeholder="Prevalence, incidence, demographics..."
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Expected Prognosis</Label>
                <Textarea
                  rows={2}
                  value={form.expectedPrognosis}
                  onChange={(e) => setField("expectedPrognosis", e.target.value)}
                  placeholder="Likely outcome with treatment..."
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Natural Progression</Label>
                <Textarea
                  rows={2}
                  value={form.naturalProgression}
                  onChange={(e) => setField("naturalProgression", e.target.value)}
                  placeholder="Disease course without treatment..."
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Causes (comma-separated)</Label>
                <Input
                  value={form.cause}
                  onChange={(e) => setField("cause", e.target.value)}
                  onKeyDown={(e) => handleCommaInputKeyDown(e, "cause")}
                  placeholder="Allergens, Pollution, Genetics"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Risk Factors (comma-separated)</Label>
                <Input
                  value={form.riskFactor}
                  onChange={(e) => setField("riskFactor", e.target.value)}
                  onKeyDown={(e) => handleCommaInputKeyDown(e, "riskFactor")}
                  placeholder="Family history, Obesity, Smoking"
                />
              </div>
            </div>
          </Section>

          {/* ── Symptoms & Diagnosis ─────────────────────── */}
          <Section title="Symptoms & Diagnosis" id="symptoms" open={sections.symptoms} toggle={toggle}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label>Signs / Symptoms (comma-separated)</Label>
                <Input
                  value={form.signOrSymptom}
                  onChange={(e) => setField("signOrSymptom", e.target.value)}
                  onKeyDown={(e) => handleCommaInputKeyDown(e, "signOrSymptom")}
                  placeholder="Wheezing, Shortness of breath, Cough"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Differential Diagnosis (comma-separated)</Label>
                <Input
                  value={form.differentialDiagnosis}
                  onChange={(e) => setField("differentialDiagnosis", e.target.value)}
                  onKeyDown={(e) => handleCommaInputKeyDown(e, "differentialDiagnosis")}
                  placeholder="COPD, Bronchitis, Heart failure"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Typical Tests (comma-separated)</Label>
                <Input
                  value={form.typicalTest}
                  onChange={(e) => setField("typicalTest", e.target.value)}
                  onKeyDown={(e) => handleCommaInputKeyDown(e, "typicalTest")}
                  placeholder="Spirometry, Peak flow, Chest X-ray"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Stages (comma-separated)</Label>
                <Input
                  value={form.stage}
                  onChange={(e) => setField("stage", e.target.value)}
                  onKeyDown={(e) => handleCommaInputKeyDown(e, "stage")}
                  placeholder="Mild, Moderate, Severe"
                />
              </div>
            </div>
          </Section>

          {/* ── Treatment & Prevention ───────────────────── */}
          <Section title="Treatment & Prevention" id="treatment" open={sections.treatment} toggle={toggle}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label>Possible Treatments (comma-separated)</Label>
                <Input
                  value={form.possibleTreatment}
                  onChange={(e) => setField("possibleTreatment", e.target.value)}
                  onKeyDown={(e) => handleCommaInputKeyDown(e, "possibleTreatment")}
                  placeholder="Bronchodilators, Corticosteroids, Immunotherapy"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Drugs / Medications (comma-separated)</Label>
                <Input
                  value={form.drug}
                  onChange={(e) => setField("drug", e.target.value)}
                  onKeyDown={(e) => handleCommaInputKeyDown(e, "drug")}
                  placeholder="Albuterol, Budesonide, Montelukast"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Primary Prevention</Label>
                <Textarea
                  rows={2}
                  value={form.primaryPrevention}
                  onChange={(e) => setField("primaryPrevention", e.target.value)}
                  placeholder="Avoid allergens, maintain healthy weight..."
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Secondary Prevention</Label>
                <Textarea
                  rows={2}
                  value={form.secondaryPrevention}
                  onChange={(e) => setField("secondaryPrevention", e.target.value)}
                  placeholder="Regular follow-ups, medication adherence..."
                />
              </div>
            </div>
          </Section>

          {/* ── Images ─────────────────────────────────── */}
          <Section title="Images (max 5)" id="images" open={sections.images} toggle={toggle}>
            <p className="text-xs text-zinc-500 mb-2">
              Upload up to 5 images (diagrams, illustrations, etc.).
            </p>
            <ImageUpload
              maxFiles={5}
              onImagesChange={onImagesChange}
              initialImages={(condition?.image || []).map((url) => ({ url, alt: "" }))}
            />
          </Section>

          {/* ── SEO ─────────────────────────────────── */}
          <Section title="SEO Metadata" id="seo" open={sections.seo} toggle={toggle}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label>Meta Title</Label>
                <Input
                  value={form.seo.metaTitle}
                  onChange={(e) => setNested("seo", "metaTitle", e.target.value)}
                  placeholder="Asthma — Symptoms, Causes & Treatment"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Meta Description</Label>
                <Textarea
                  rows={2}
                  value={form.seo.metaDescription}
                  onChange={(e) => setNested("seo", "metaDescription", e.target.value)}
                  placeholder="Learn about asthma symptoms, causes, and treatments..."
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Keywords (comma-separated)</Label>
                <Input
                  value={form.seo.keywords as unknown as string}
                  onChange={(e) => setNested("seo", "keywords", e.target.value)}
                  onKeyDown={(e) => handleCommaInputKeyDown(e, "keywords", true)}
                  placeholder="asthma, respiratory, bronchial"
                />
              </div>
            </div>
          </Section>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
