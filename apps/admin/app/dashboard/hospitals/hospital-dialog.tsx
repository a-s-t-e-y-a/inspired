"use client";

import { useEffect, useState, useCallback } from "react";
import {
  useCreateHospital,
  useUpdateHospital,
  Hospital,
  CreateHospitalPayload,
} from "@/queries/hospitals.queries";
import { getImageKey, getFullImageUrl } from "@/lib/file-upload";
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

interface HospitalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospital?: Hospital | null;
  onSuccess?: (hospital: Hospital) => void;
}

type SectionKey = "basic" | "contact" | "address" | "hours" | "logo" | "images" | "seo";

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

interface OpeningHoursRow {
  dayOfWeek: string;
  opens: string;
  closes: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function HospitalDialog({ open, onOpenChange, hospital, onSuccess }: HospitalDialogProps) {
  const isEditing = !!hospital;
  const createMutation = useCreateHospital();
  const updateMutation = useUpdateHospital();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string, type: "tel" | "email" | "url" | "number") => {
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
      } else if (type === "number") {
        if (value !== "" && (isNaN(Number(value)) || Number(value) < -180 || Number(value) > 180)) {
          errMsg = "Must be a valid coordinate (-180 to 180)";
        }
      }
    }
    setErrors((prev) => ({ ...prev, [field]: errMsg }));
  };

  const [sections, setSections] = useState<Record<SectionKey, boolean>>({
    basic: true,
    contact: false,
    address: false,
    hours: false,
    logo: false,
    images: false,
    seo: false,
  });
  const toggle = (id: SectionKey) =>
    setSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const emptyForm = () => ({
    name: "",
    description: "",
    disambiguatingDescription: "",
    slogan: "",
    url: "",
    awards: "",
    alumni: "",
    owner: "",
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
    logo: "",
    image: [] as string[],
    medicalSpecialty: "",
    availableService: "",
    isAcceptingNewPatients: true,
    openingHoursSpecification: [] as OpeningHoursRow[],
    priceRange: "",
    geo: { latitude: "" as string | number, longitude: "" as string | number },
    seo: { metaTitle: "", metaDescription: "", keywords: "" as unknown as string[] },
  });

  const [form, setForm] = useState(emptyForm());
  const [uploadedImages, setUploadedImages] = useState<
    Array<{ file: File; alt: string; preview: string; finalUrl?: string; key?: string }>
  >([]);
  const [uploadedLogo, setUploadedLogo] = useState<
    Array<{ file: File; alt: string; preview: string; finalUrl?: string; key?: string }>
  >([]);

  useEffect(() => {
    if (open) {
      if (hospital) {
        setForm({
          name: hospital.name || "",
          description: hospital.description || "",
          disambiguatingDescription: (hospital as any).disambiguatingDescription || "",
          slogan: hospital.slogan || "",
          url: (hospital as any).url || "",
          owner: (hospital as any).owner || "",
          priceRange: hospital.priceRange || "",
          awards: (hospital as any).awards ? (hospital as any).awards.join(", ") : "",
          alumni: (hospital as any).alumni ? (hospital as any).alumni.join(", ") : "",
          telephone: hospital.telephone || "",
          email: hospital.email || "",
          faxNumber: (hospital as any).faxNumber || "",
          medicalSpecialty: hospital.medicalSpecialty ? hospital.medicalSpecialty.join(", ") : "",
          availableService: hospital.availableService ? hospital.availableService.join(", ") : "",
          isAcceptingNewPatients: hospital.isAcceptingNewPatients || false,
          address: {
            streetAddress: (hospital as any).address?.streetAddress || "",
            addressLocality: (hospital as any).address?.addressLocality || "",
            addressRegion: (hospital as any).address?.addressRegion || "",
            postalCode: (hospital as any).address?.postalCode || "",
            addressCountry: (hospital as any).address?.addressCountry || "",
          },
          geo: {
            latitude: (hospital as any).geo?.latitude || "",
            longitude: (hospital as any).geo?.longitude || "",
          },
          logo: hospital.logo || "",
          image: hospital.image || [],
          openingHoursSpecification: (hospital as any).openingHoursSpecification || [],
          seo: {
            metaTitle: (hospital as any).seo?.metaTitle || "",
            metaDescription: (hospital as any).seo?.metaDescription || "",
            keywords: (hospital as any).seo?.keywords ? (hospital as any).seo.keywords.join(", ") : "" as unknown as string[],
          },
        });
        setUploadedImages([]);
        setUploadedLogo([]);
      } else {
        setForm(emptyForm());
        setUploadedImages([]);
        setUploadedLogo([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hospital]);

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

  // Opening hours helpers
  const addHourRow = () =>
    setField("openingHoursSpecification", [
      ...form.openingHoursSpecification,
      { dayOfWeek: "Monday", opens: "09:00", closes: "17:00" },
    ]);

  const updateHourRow = (idx: number, field: keyof OpeningHoursRow, value: string) => {
    const rows = [...form.openingHoursSpecification];
    rows[idx] = { ...rows[idx], [field]: value };
    setField("openingHoursSpecification", rows);
  };

  const removeHourRow = (idx: number) => {
    setField(
      "openingHoursSpecification",
      form.openingHoursSpecification.filter((_, i) => i !== idx)
    );
  };

  const onImagesChange = useCallback(
    (imgs: Array<{ file: File; alt: string; preview: string; finalUrl?: string; key?: string }>) => {
      setUploadedImages(imgs);
    },
    []
  );

  const onLogoChange = useCallback(
    (imgs: Array<{ file: File; alt: string; preview: string; finalUrl?: string; key?: string }>) => {
      setUploadedLogo(imgs);
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

    const finalImageKeys = uploadedImages
      .map((img) => getImageKey(img.finalUrl || img.key || ""))
      .filter(Boolean);

    const finalLogoKey =
      uploadedLogo.length > 0
        ? getImageKey(uploadedLogo[0].finalUrl || uploadedLogo[0].key || "")
        : getImageKey(form.logo || "");

    const payload: Partial<CreateHospitalPayload> = {
      ...form,
      awards: csvToArr(form.awards as unknown as string),
      alumni: csvToArr(form.alumni as unknown as string),
      medicalSpecialty: csvToArr(form.medicalSpecialty as unknown as string),
      availableService: csvToArr(form.availableService as unknown as string),
      logo: finalLogoKey || undefined,
      image: finalImageKeys.length > 0 ? finalImageKeys : form.image.map(getImageKey),
      geo:
        form.geo.latitude || form.geo.longitude
          ? { latitude: Number(form.geo.latitude), longitude: Number(form.geo.longitude) }
          : undefined,
      address: Object.values(form.address).some(Boolean) ? form.address : undefined,
      seo:
        form.seo.metaTitle || form.seo.metaDescription || form.seo.keywords
          ? {
            metaTitle: form.seo.metaTitle,
            metaDescription: form.seo.metaDescription,
            keywords: csvToArr(form.seo.keywords as unknown as string),
          }
          : undefined,
      openingHoursSpecification:
        form.openingHoursSpecification.length > 0
          ? form.openingHoursSpecification
          : undefined,
    };

    if (!payload.url) delete payload.url;
    if (!payload.faxNumber) delete payload.faxNumber;
    if (!payload.owner) delete payload.owner;
    if (!payload.priceRange) delete payload.priceRange;
    if (!payload.disambiguatingDescription) delete payload.disambiguatingDescription;

    try {
      if (isEditing && hospital) {
        const res = await updateMutation.mutateAsync({ id: hospital._id, payload });
        toast.success("Hospital updated");
        onSuccess?.(res);
      } else {
        const res = await createMutation.mutateAsync(payload as CreateHospitalPayload);
        toast.success("Hospital created");
        onSuccess?.(res);
      }
      onOpenChange(false);
    } catch {
      toast.error(`Failed to ${isEditing ? "update" : "create"} hospital`);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Hospital" : "Add Hospital"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the hospital's information below." : "Create a new hospital record."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* ── Basic ─────────────────────────────────── */}
          <Section title="Basic Information" id="basic" open={sections.basic} toggle={toggle}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Name *</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="General Hospital"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slogan</Label>
                <Input
                  value={form.slogan}
                  onChange={(e) => setField("slogan", e.target.value)}
                  placeholder="Caring for life"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Brief description..."
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Disambiguating Description</Label>
                <Input
                  value={form.disambiguatingDescription}
                  onChange={(e) => setField("disambiguatingDescription", e.target.value)}
                  placeholder="E.g. affiliated with Johns Hopkins"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Website URL</Label>
                <Input
                  type="url"
                  value={form.url}
                  onChange={(e) => {
                    setField("url", e.target.value);
                    validateField("url", e.target.value, "url");
                  }}
                  placeholder="https://hospital.com"
                  className={errors.url ? "border-red-500" : ""}
                />
                {errors.url && <p className="text-xs text-red-500">{errors.url}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Owner</Label>
                <Input
                  value={form.owner}
                  onChange={(e) => setField("owner", e.target.value)}
                  placeholder="Hospital Group Inc."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Price Range</Label>
                <Input
                  value={form.priceRange}
                  onChange={(e) => setField("priceRange", e.target.value)}
                  placeholder="$$–$$$"
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
                  placeholder="ICU, Emergency, OPD"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Awards (comma-separated)</Label>
                <Input
                  value={form.awards}
                  onChange={(e) => setField("awards", e.target.value)}
                  onKeyDown={(e) => handleCommaInputKeyDown(e, "awards")}
                  placeholder="Best Hospital 2023, JCI Accredited"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Alumni (comma-separated)</Label>
                <Input
                  value={form.alumni}
                  onChange={(e) => setField("alumni", e.target.value)}
                  onKeyDown={(e) => handleCommaInputKeyDown(e, "alumni")}
                  placeholder="Dr. Smith, Dr. Jones"
                />
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
                  placeholder="info@hospital.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
            </div>
          </Section>

          {/* ── Address ─────────────────────────────────── */}
          <Section title="Address & Geo" id="address" open={sections.address} toggle={toggle}>
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

          {/* ── Opening Hours ─────────────────────────────── */}
          <Section title="Opening Hours" id="hours" open={sections.hours} toggle={toggle}>
            <div className="space-y-3">
              {form.openingHoursSpecification.map((row, idx) => (
                <div key={idx} className="flex items-end gap-2 border border-zinc-100 p-2 rounded bg-zinc-50/50">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Day</Label>
                    <select
                      value={row.dayOfWeek}
                      onChange={(e) => updateHourRow(idx, "dayOfWeek", e.target.value)}
                      className="w-full h-9 text-sm border border-zinc-200 rounded-md px-2 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-400"
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-xs">Opens</Label>
                    <Input
                      type="time"
                      value={row.opens}
                      onChange={(e) => updateHourRow(idx, "opens", e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-xs">Closes</Label>
                    <Input
                      type="time"
                      value={row.closes}
                      onChange={(e) => updateHourRow(idx, "closes", e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeHourRow(idx)}
                    className="h-9 px-2 text-red-500 hover:text-red-700 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addHourRow}>
                + Add Hours
              </Button>
            </div>
          </Section>

          {/* ── Logo ─────────────────────────────────── */}
          <Section title="Logo (single image)" id="logo" open={sections.logo} toggle={toggle}>
            <p className="text-xs text-zinc-500 mb-2">Upload a single logo image for the hospital.</p>
            <ImageUpload
              maxFiles={1}
              onImagesChange={onLogoChange}
              initialImages={hospital?.logo ? [{ url: hospital.logo, alt: "logo" }] : []}
            />
          </Section>

          {/* ── Gallery Images ─────────────────────────── */}
          <Section title="Gallery Images (5–15)" id="images" open={sections.images} toggle={toggle}>
            <p className="text-xs text-zinc-500 mb-2">
              Upload between 5 and 15 images for the hospital gallery.
            </p>
            <ImageUpload
              maxFiles={15}
              onImagesChange={onImagesChange}
              initialImages={(hospital?.image || []).map((url) => ({ url, alt: "" }))}
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
                  placeholder="General Hospital — NYC"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Meta Description</Label>
                <Textarea
                  rows={2}
                  value={form.seo.metaDescription}
                  onChange={(e) => setNested("seo", "metaDescription", e.target.value)}
                  placeholder="Leading hospital in NYC offering world-class care..."
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Keywords (comma-separated)</Label>
                <Input
                  value={form.seo.keywords as unknown as string}
                  onChange={(e) => setNested("seo", "keywords", e.target.value)}
                  onKeyDown={(e) => handleCommaInputKeyDown(e, "keywords", true)}
                  placeholder="hospital, emergency, NYC"
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
