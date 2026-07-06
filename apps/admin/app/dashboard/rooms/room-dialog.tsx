"use client";

import { useEffect, useState, useCallback } from "react";
import {
  useCreateRoom,
  useUpdateRoom,
  Room,
  CreateRoomPayload,
} from "@/queries/rooms.queries";
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

interface RoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room?: Room | null;
}

type SectionKey = "basic" | "details" | "address" | "images" | "seo";

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

export function RoomDialog({ open, onOpenChange, room }: RoomDialogProps) {
  const isEditing = !!room;
  const createMutation = useCreateRoom();
  const updateMutation = useUpdateRoom();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string, type: "number") => {
    let errMsg = "";
    if (value) {
      if (type === "number") {
        if (isNaN(Number(value)) || Number(value) < 0) {
          errMsg = "Must be a non-negative number";
        }
      }
    }
    setErrors((prev) => ({ ...prev, [field]: errMsg }));
  };

  const [sections, setSections] = useState<Record<SectionKey, boolean>>({
    basic: true,
    details: false,
    address: false,
    images: false,
    seo: false,
  });
  const toggle = (id: SectionKey) =>
    setSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const emptyForm = () => ({
    name: "",
    description: "",
    accommodationCategory: "",
    bed: "",
    occupancy: 1,
    floorLevel: "",
    floorSize: "" as string | number,
    numberOfRooms: "" as string | number,
    numberOfBathroomsTotal: "" as string | number,
    amenityFeature: "",
    petsAllowed: false,
    perNightPrice: 0,
    inStock: true,
    tourBookingPage: "",
    address: {
      streetAddress: "",
      addressLocality: "",
      addressRegion: "",
      postalCode: "",
      addressCountry: "",
    },
    geo: { longitude: "" as string | number, latitude: "" as string | number },
    image: [] as string[],
    seo: { metaTitle: "", metaDescription: "", keywords: "" as unknown as string[] },
  });

  const [form, setForm] = useState(emptyForm());
  const [uploadedImages, setUploadedImages] = useState<
    Array<{ file: File; alt: string; preview: string; finalUrl?: string; key?: string }>
  >([]);

  useEffect(() => {
    if (open) {
      if (room) {
        setForm({
          name: room.name || "",
          description: room.description || "",
          accommodationCategory: room.accommodationCategory || "",
          bed: room.bed ? room.bed.join(", ") : "",
          occupancy: room.occupancy || 1,
          floorLevel: room.floorLevel || "",
          floorSize: room.floorSize || "",
          numberOfRooms: room.numberOfRooms || "",
          numberOfBathroomsTotal: room.numberOfBathroomsTotal || "",
          amenityFeature: room.amenityFeature ? room.amenityFeature.join(", ") : "",
          petsAllowed: room.petsAllowed || false,
          perNightPrice: room.perNightPrice || 0,
          inStock: room.inStock !== undefined ? room.inStock : true,
          tourBookingPage: room.tourBookingPage || "",
          address: {
            streetAddress: (room as any).address?.streetAddress || "",
            addressLocality: (room as any).address?.addressLocality || "",
            addressRegion: (room as any).address?.addressRegion || "",
            postalCode: (room as any).address?.postalCode || "",
            addressCountry: (room as any).address?.addressCountry || "",
          },
          geo: {
            longitude: (room as any).geo?.coordinates?.[0] || "",
            latitude: (room as any).geo?.coordinates?.[1] || "",
          },
          image: room.image || [],
          seo: {
            metaTitle: (room as any).seo?.metaTitle || "",
            metaDescription: (room as any).seo?.metaDescription || "",
            keywords: (room as any).seo?.keywords ? (room as any).seo.keywords.join(", ") : "" as unknown as string[],
          },
        });
        setUploadedImages([]);
      } else {
        setForm(emptyForm());
        setUploadedImages([]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, room]);

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

    const lng = Number(form.geo.longitude);
    const lat = Number(form.geo.latitude);

    const payload: Partial<CreateRoomPayload> = {
      ...form,
      bed: csvToArr(form.bed as unknown as string),
      amenityFeature: csvToArr(form.amenityFeature as unknown as string),
      floorSize: form.floorSize !== "" ? Number(form.floorSize) : undefined,
      numberOfRooms: form.numberOfRooms !== "" ? Number(form.numberOfRooms) : undefined,
      numberOfBathroomsTotal:
        form.numberOfBathroomsTotal !== "" ? Number(form.numberOfBathroomsTotal) : undefined,
      image: finalKeys.length > 0 ? finalKeys : form.image.map(getImageKey),
      geo:
        lng || lat
          ? { type: "Point", coordinates: [lng, lat] }
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
    };

    if (!payload.tourBookingPage) delete payload.tourBookingPage;
    if (!payload.floorLevel) delete payload.floorLevel;
    if (!payload.accommodationCategory) delete payload.accommodationCategory;

    try {
      if (isEditing && room) {
        await updateMutation.mutateAsync({ id: room._id, payload });
        toast.success("Room updated");
      } else {
        await createMutation.mutateAsync(payload as CreateRoomPayload);
        toast.success("Room created");
      }
      onOpenChange(false);
    } catch {
      toast.error(`Failed to ${isEditing ? "update" : "create"} room`);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Room" : "Add Room"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the room's information below." : "Create a new room record."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* ── Basic ─────────────────────────────────── */}
          <Section title="Basic Information" id="basic" open={sections.basic} toggle={toggle}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label>Name *</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="Deluxe Suite"
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
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input
                  value={form.accommodationCategory}
                  onChange={(e) => setField("accommodationCategory", e.target.value)}
                  placeholder="Suite, ICU, Standard"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Price per Night (USD) *</Label>
                <Input
                  type="number"
                  required
                  min={0}
                  value={form.perNightPrice}
                  onChange={(e) => {
                    setField("perNightPrice", Number(e.target.value));
                    validateField("perNightPrice", e.target.value, "number");
                  }}
                  className={errors.perNightPrice ? "border-red-500" : ""}
                />
                {errors.perNightPrice && <p className="text-xs text-red-500">{errors.perNightPrice}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Occupancy</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.occupancy}
                  onChange={(e) => {
                    setField("occupancy", Number(e.target.value));
                    validateField("occupancy", e.target.value, "number");
                  }}
                  className={errors.occupancy ? "border-red-500" : ""}
                />
                {errors.occupancy && <p className="text-xs text-red-500">{errors.occupancy}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Floor Level</Label>
                <Input
                  value={form.floorLevel}
                  onChange={(e) => setField("floorLevel", e.target.value)}
                  placeholder="Ground, 2nd, Penthouse"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Floor Size (sq ft)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.floorSize as string}
                  onChange={(e) => {
                    setField("floorSize", e.target.value);
                    validateField("floorSize", e.target.value, "number");
                  }}
                  className={errors.floorSize ? "border-red-500" : ""}
                />
                {errors.floorSize && <p className="text-xs text-red-500">{errors.floorSize}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Number of Rooms</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.numberOfRooms as string}
                  onChange={(e) => {
                    setField("numberOfRooms", e.target.value);
                    validateField("numberOfRooms", e.target.value, "number");
                  }}
                  className={errors.numberOfRooms ? "border-red-500" : ""}
                />
                {errors.numberOfRooms && <p className="text-xs text-red-500">{errors.numberOfRooms}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Bathrooms</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.numberOfBathroomsTotal as string}
                  onChange={(e) => {
                    setField("numberOfBathroomsTotal", e.target.value);
                    validateField("numberOfBathroomsTotal", e.target.value, "number");
                  }}
                  className={errors.numberOfBathroomsTotal ? "border-red-500" : ""}
                />
                {errors.numberOfBathroomsTotal && <p className="text-xs text-red-500">{errors.numberOfBathroomsTotal}</p>}
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Bed Types (comma-separated)</Label>
                <Input
                  value={form.bed}
                  onChange={(e) => setField("bed", e.target.value)}
                  onKeyDown={(e) => handleCommaInputKeyDown(e, "bed")}
                  placeholder="King, Twin, Sofa Bed"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Amenities (comma-separated)</Label>
                <Input
                  value={form.amenityFeature}
                  onChange={(e) => setField("amenityFeature", e.target.value)}
                  onKeyDown={(e) => handleCommaInputKeyDown(e, "amenityFeature")}
                  placeholder="Wi-Fi, TV, Air Conditioning"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Tour / Booking Page URL</Label>
                <Input
                  type="url"
                  value={form.tourBookingPage}
                  onChange={(e) => setField("tourBookingPage", e.target.value)}
                  placeholder="https://booking.com/room"
                />
              </div>
              <div className="flex gap-6 md:col-span-2 pt-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.petsAllowed}
                    onChange={(e) => setField("petsAllowed", e.target.checked)}
                    className="rounded text-zinc-900 focus:ring-zinc-900 h-4 w-4"
                  />
                  Pets Allowed
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.inStock}
                    onChange={(e) => setField("inStock", e.target.checked)}
                    className="rounded text-zinc-900 focus:ring-zinc-900 h-4 w-4"
                  />
                  In Stock / Available
                </label>
              </div>
            </div>
          </Section>

          {/* ── Address & Geo ─────────────────────────────── */}
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
              <div className="md:col-span-2 pt-2 border-t border-zinc-100">
                <p className="text-xs font-medium text-zinc-500 mb-2">
                  Geo coordinates — stored as GeoJSON Point [longitude, latitude]
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              </div>
            </div>
          </Section>

          {/* ── Images ─────────────────────────────────── */}
          <Section title="Images (5–20)" id="images" open={sections.images} toggle={toggle}>
            <p className="text-xs text-zinc-500 mb-2">
              Upload between 5 and 20 images for this room.
            </p>
            <ImageUpload
              maxFiles={20}
              onImagesChange={onImagesChange}
              initialImages={(room?.image || []).map((url) => ({ url, alt: "" }))}
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
                  placeholder="Deluxe Suite — City View"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Meta Description</Label>
                <Textarea
                  rows={2}
                  value={form.seo.metaDescription}
                  onChange={(e) => setNested("seo", "metaDescription", e.target.value)}
                  placeholder="Spacious deluxe suite with panoramic city views..."
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Keywords (comma-separated)</Label>
                <Input
                  value={form.seo.keywords as unknown as string}
                  onChange={(e) => setNested("seo", "keywords", e.target.value)}
                  onKeyDown={(e) => handleCommaInputKeyDown(e, "keywords", true)}
                  placeholder="suite, hospital room, private ward"
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
