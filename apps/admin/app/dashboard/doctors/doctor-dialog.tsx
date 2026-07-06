"use client";

import { useEffect, useState, useCallback } from "react";
import {
  useCreateDoctor,
  useUpdateDoctor,
  Doctor,
  CreateDoctorPayload,
} from "@/queries/doctors.queries";
import { useGetHospitals } from "@/queries/hospitals.queries";
import { HospitalDialog } from "../hospitals/hospital-dialog";
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

interface DoctorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor?: Doctor | null;
}

type SectionKey = "basic" | "contact" | "address" | "geo" | "images" | "seo";

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

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function DoctorDialog({ open, onOpenChange, doctor }: DoctorDialogProps) {
  const isEditing = !!doctor;
  const createMutation = useCreateDoctor();
  const updateMutation = useUpdateDoctor();

  const [sections, setSections] = useState<Record<SectionKey, boolean>>({
    basic: true,
    contact: false,
    address: false,
    geo: false,
    images: false,
    seo: false,
  });

  const toggle = (id: SectionKey) =>
    setSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const emptyForm = () => ({
    name: "",
    description: "",
    url: "",
    occupationalCategory: "",
    medicalSpecialty: "",
    availableService: "",
    isAcceptingNewPatients: false,
    usNPI: "",
    hospitalAffiliation: [] as string[],
    telephone: "",
    email: "",
    faxNumber: "",
    address: {
      streetAddress: "",
      addressLocality: "",
      addressRegion: "",
      postalCode: "",
      addressCountry: "",
    },
    geo: { latitude: "" as string | number, longitude: "" as string | number },
    image: [] as string[],
    seo: { metaTitle: "", metaDescription: "", keywords: "" as unknown as string[] },
  });

  const [form, setForm] = useState(emptyForm());
  const [uploadedImages, setUploadedImages] = useState<
    Array<{ file: File; alt: string; preview: string; finalUrl?: string; key?: string }>
  >([]);

  const [isCreateHospitalOpen, setIsCreateHospitalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string, type: "tel" | "email" | "url" | "npi" | "number") => {
    let errMsg = "";
    if (value) {
      if (type === "tel") {
        if (!/^\+?[0-9\s\-()]{7,15}$/.test(value)) {
          errMsg = "Must be a valid telephone number (7-15 digits)";
        }
      } else if (type === "email") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errMsg = "Must be a valid email address";
        }
      } else if (type === "url") {
        if (!/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(value)) {
          errMsg = "Must be a valid URL (e.g. https://example.com)";
        }
      } else if (type === "npi") {
        if (!/^\d{10}$/.test(value)) {
          errMsg = "US NPI must be exactly 10 digits";
        }
      } else if (type === "number") {
        if (value !== "" && (isNaN(Number(value)) || Number(value) < -180 || Number(value) > 180)) {
          errMsg = "Must be a valid coordinate (-180 to 180)";
        }
      }
    }
    setErrors((prev) => ({ ...prev, [field]: errMsg }));
  };

  // Fetch hospitals to list inside dropdown selection
  const { data: hospitalsData, isLoading: isLoadingHospitals } = useGetHospitals(1, 1000);

  const filteredHospitals = hospitalsData?.data.filter((h: any) =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      if (doctor) {
        setForm({
          name: doctor.name || "",
          description: doctor.description || "",
          url: (doctor as any).url || "",
          occupationalCategory: (doctor as any).occupationalCategory ? (doctor as any).occupationalCategory.join(", ") : "",
          medicalSpecialty: doctor.medicalSpecialty ? doctor.medicalSpecialty.join(", ") : "",
          availableService: doctor.availableService ? doctor.availableService.join(", ") : "",
          isAcceptingNewPatients: doctor.isAcceptingNewPatients || false,
          usNPI: doctor.usNPI || "",
          hospitalAffiliation: doctor.hospitalAffiliation
            ? doctor.hospitalAffiliation.map((h: any) => typeof h === "string" ? h : h._id)
            : [],
          telephone: doctor.telephone || "",
          email: doctor.email || "",
          faxNumber: (doctor as any).faxNumber || "",
          address: {
            streetAddress: (doctor as any).address?.streetAddress || "",
            addressLocality: (doctor as any).address?.addressLocality || "",
            addressRegion: (doctor as any).address?.addressRegion || "",
            postalCode: (doctor as any).address?.postalCode || "",
            addressCountry: (doctor as any).address?.addressCountry || "",
          },
          geo: {
            latitude: (doctor as any).geo?.latitude || "",
            longitude: (doctor as any).geo?.longitude || "",
          },
          image: doctor.image || [],
          seo: {
            metaTitle: (doctor as any).seo?.metaTitle || "",
            metaDescription: (doctor as any).seo?.metaDescription || "",
            keywords: (doctor as any).seo?.keywords ? (doctor as any).seo.keywords.join(", ") : "" as unknown as string[],
          },
        });
        setUploadedImages([]);
      } else {
        setForm(emptyForm());
        setUploadedImages([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, doctor]);

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
    (
      imgs: Array<{ file: File; alt: string; preview: string; finalUrl?: string; key?: string }>
    ) => {
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

    const payload: Partial<CreateDoctorPayload> = {
      ...form,
      occupationalCategory: csvToArr(form.occupationalCategory as unknown as string),
      medicalSpecialty: csvToArr(form.medicalSpecialty as unknown as string),
      availableService: csvToArr(form.availableService as unknown as string),
      image: finalKeys.length > 0 ? finalKeys : form.image.map(getImageKey),
      geo:
        form.geo.latitude || form.geo.longitude
          ? { latitude: Number(form.geo.latitude), longitude: Number(form.geo.longitude) }
          : undefined,
      seo:
        form.seo.metaTitle || form.seo.metaDescription || form.seo.keywords
          ? {
              metaTitle: form.seo.metaTitle,
              metaDescription: form.seo.metaDescription,
              keywords: csvToArr(form.seo.keywords as unknown as string),
            }
          : undefined,
      address:
        Object.values(form.address).some(Boolean) ? form.address : undefined,
    };

    // Strip empty optional strings
    if (!payload.url) delete payload.url;
    if (!payload.faxNumber) delete payload.faxNumber;
    if (!payload.usNPI) delete payload.usNPI;

    try {
      if (isEditing && doctor) {
        await updateMutation.mutateAsync({ id: doctor._id, payload });
        toast.success("Doctor updated");
      } else {
        await createMutation.mutateAsync(payload as CreateDoctorPayload);
        toast.success("Doctor created");
      }
      onOpenChange(false);
    } catch {
      toast.error(`Failed to ${isEditing ? "update" : "create"} doctor`);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Doctor" : "Add Doctor"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the doctor's information below."
              : "Create a new doctor record."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* ── Basic Info ─────────────────────────────────── */}
          <Section title="Basic Information" id="basic" open={sections.basic} toggle={toggle}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Name *</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="Dr. John Smith"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Profile URL</Label>
                <Input
                  type="url"
                  value={form.url}
                  onChange={(e) => {
                    setField("url", e.target.value);
                    validateField("url", e.target.value, "url");
                  }}
                  placeholder="https://example.com/dr-smith"
                  className={errors.url ? "border-red-500" : ""}
                />
                {errors.url && <p className="text-xs text-red-500">{errors.url}</p>}
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Brief bio or description..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>US NPI</Label>
                <Input
                  value={form.usNPI}
                  onChange={(e) => {
                    setField("usNPI", e.target.value);
                    validateField("usNPI", e.target.value, "npi");
                  }}
                  placeholder="1234567890"
                  className={errors.usNPI ? "border-red-500" : ""}
                />
                {errors.usNPI && <p className="text-xs text-red-500">{errors.usNPI}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Occupational Category (comma-separated)</Label>
                <Input
                  value={form.occupationalCategory}
                  onChange={(e) => setField("occupationalCategory", e.target.value)}
                  onKeyDown={(e) => handleCommaInputKeyDown(e, "occupationalCategory")}
                  placeholder="Physician, Surgeon"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Medical Specialties (comma-separated)</Label>
                <Input
                  value={form.medicalSpecialty}
                  onChange={(e) => setField("medicalSpecialty", e.target.value)}
                  onKeyDown={(e) => handleCommaInputKeyDown(e, "medicalSpecialty")}
                  placeholder="Cardiology, Neurology"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Available Services (comma-separated)</Label>
                <Input
                  value={form.availableService}
                  onChange={(e) => setField("availableService", e.target.value)}
                  onKeyDown={(e) => handleCommaInputKeyDown(e, "availableService")}
                  placeholder="Consultation, Surgery"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2 relative">
                <Label>Hospital Affiliations</Label>

                {/* Selected Hospital Badges */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.hospitalAffiliation.map((id) => {
                    const hosp = hospitalsData?.data.find((h: any) => h._id === id);
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-1 bg-zinc-100 border border-zinc-200 rounded px-2 py-0.5 text-xs text-zinc-700 font-medium"
                      >
                        <span>{hosp ? hosp.name : (isLoadingHospitals ? "Loading..." : "Unknown/Deleted Hospital")}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setField(
                              "hospitalAffiliation",
                              form.hospitalAffiliation.filter((x) => x !== id)
                            )
                          }
                          className="text-zinc-400 hover:text-zinc-600 focus:outline-none"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                  {form.hospitalAffiliation.length === 0 && (
                    <span className="text-xs text-zinc-400 italic">No affiliations selected</span>
                  )}
                </div>

                {/* Search field and selector trigger */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder="Search hospitals..."
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateHospitalOpen(true)}
                  >
                    + Create Hospital
                  </Button>
                </div>

                {/* Suggestions drop-down menu */}
                {showSuggestions && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {isLoadingHospitals ? (
                      <div className="px-3 py-4 text-sm text-zinc-500 text-center">
                        Loading hospitals...
                      </div>
                    ) : !hospitalsData?.data || hospitalsData.data.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-zinc-500 flex flex-col items-center gap-2">
                        <span>No hospitals created yet</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsCreateHospitalOpen(true);
                            setShowSuggestions(false);
                          }}
                        >
                          Create First Hospital
                        </Button>
                      </div>
                    ) : filteredHospitals && filteredHospitals.length > 0 ? (
                      filteredHospitals.map((hosp: any) => {
                        const isSelected = form.hospitalAffiliation.includes(hosp._id);
                        return (
                          <button
                            key={hosp._id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setField(
                                  "hospitalAffiliation",
                                  form.hospitalAffiliation.filter((x) => x !== hosp._id)
                                );
                              } else {
                                setField("hospitalAffiliation", [
                                  ...form.hospitalAffiliation,
                                  hosp._id,
                                ]);
                              }
                              setSearchQuery("");
                              setShowSuggestions(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 flex items-center justify-between ${isSelected ? "bg-zinc-50/50 font-medium" : ""
                              }`}
                          >
                            <span>{hosp.name}</span>
                            {isSelected && (
                              <span className="text-xs text-green-600 font-semibold">✓</span>
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-3 py-4 text-sm text-zinc-500 flex flex-col items-center gap-2">
                        <span>No hospitals found matching "{searchQuery}"</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsCreateHospitalOpen(true);
                            setShowSuggestions(false);
                          }}
                        >
                          Create New Hospital
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="md:col-span-2 pt-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.isAcceptingNewPatients}
                    onChange={(e) => setField("isAcceptingNewPatients", e.target.checked)}
                    className="rounded text-zinc-900 focus:ring-zinc-900 h-4 w-4"
                  />
                  Accepting New Patients
                </label>
              </div>
            </div>
          </Section>

          {/* ── Contact ─────────────────────────────────── */}
          <Section title="Contact Details" id="contact" open={sections.contact} toggle={toggle}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Telephone</Label>
                <Input
                  value={form.telephone}
                  onChange={(e) => {
                    setField("telephone", e.target.value);
                    validateField("telephone", e.target.value, "tel");
                  }}
                  placeholder="+1234567890"
                  className={errors.telephone ? "border-red-500" : ""}
                />
                {errors.telephone && <p className="text-xs text-red-500">{errors.telephone}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Fax Number</Label>
                <Input
                  value={form.faxNumber}
                  onChange={(e) => {
                    setField("faxNumber", e.target.value);
                    validateField("faxNumber", e.target.value, "tel");
                  }}
                  placeholder="+1234567890"
                  className={errors.faxNumber ? "border-red-500" : ""}
                />
                {errors.faxNumber && <p className="text-xs text-red-500">{errors.faxNumber}</p>}
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setField("email", e.target.value);
                    validateField("email", e.target.value, "email");
                  }}
                  placeholder="dr@example.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
            </div>
          </Section>

          {/* ── Address ─────────────────────────────────── */}
          <Section title="Address" id="address" open={sections.address} toggle={toggle}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label>Street Address</Label>
                <Input
                  value={form.address.streetAddress}
                  onChange={(e) => setNested("address", "streetAddress", e.target.value)}
                  placeholder="123 Main St"
                />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input
                  value={form.address.addressLocality}
                  onChange={(e) => setNested("address", "addressLocality", e.target.value)}
                  placeholder="New York"
                />
              </div>
              <div className="space-y-1.5">
                <Label>State / Region</Label>
                <Input
                  value={form.address.addressRegion}
                  onChange={(e) => setNested("address", "addressRegion", e.target.value)}
                  placeholder="NY"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Postal Code</Label>
                <Input
                  value={form.address.postalCode}
                  onChange={(e) => setNested("address", "postalCode", e.target.value)}
                  placeholder="10001"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input
                  value={form.address.addressCountry}
                  onChange={(e) => setNested("address", "addressCountry", e.target.value)}
                  placeholder="US"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={form.geo.latitude as string}
                  onChange={(e) => {
                    setNested("geo", "latitude", e.target.value);
                    validateField("latitude", e.target.value, "number");
                  }}
                  placeholder="40.7128"
                  className={errors.latitude ? "border-red-500" : ""}
                />
                {errors.latitude && <p className="text-xs text-red-500">{errors.latitude}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={form.geo.longitude as string}
                  onChange={(e) => {
                    setNested("geo", "longitude", e.target.value);
                    validateField("longitude", e.target.value, "number");
                  }}
                  placeholder="-74.0060"
                  className={errors.longitude ? "border-red-500" : ""}
                />
                {errors.longitude && <p className="text-xs text-red-500">{errors.longitude}</p>}
              </div>
            </div>
          </Section>

          {/* ── Images ─────────────────────────────────── */}
          <Section title="Images (1–5)" id="images" open={sections.images} toggle={toggle}>
            <p className="text-xs text-zinc-500 mb-2">
              Upload between 1 and 5 images. Images are auto-uploaded to R2 on selection.
            </p>
            <ImageUpload
              maxFiles={5}
              onImagesChange={onImagesChange}
              initialImages={(doctor?.image || []).map((url) => ({ url, alt: "" }))}
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
                  placeholder="Dr. John Smith — Cardiologist"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Meta Description</Label>
                <Textarea
                  rows={2}
                  value={form.seo.metaDescription}
                  onChange={(e) => setNested("seo", "metaDescription", e.target.value)}
                  placeholder="Board-certified cardiologist with 20+ years experience..."
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Keywords (comma-separated)</Label>
                <Input
                  value={form.seo.keywords as unknown as string}
                  onChange={(e) => setNested("seo", "keywords", e.target.value)}
                  onKeyDown={(e) => handleCommaInputKeyDown(e, "keywords", true)}
                  placeholder="cardiologist, heart specialist, NYC"
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
      <HospitalDialog
        open={isCreateHospitalOpen}
        onOpenChange={setIsCreateHospitalOpen}
        hospital={null}
        onSuccess={(newHosp) => {
          setField("hospitalAffiliation", [...form.hospitalAffiliation, newHosp._id]);
        }}
      />
    </Dialog>
  );
}
