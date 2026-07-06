"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetRoom } from "@/queries/rooms.queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getFullImageUrl } from "@/lib/file-upload";
import { RoomDialog } from "../room-dialog";
import { 
  ArrowLeft, Edit, Mail, Phone, ShieldCheck, MapPin, Globe, Award, FileText, CheckCircle2, XCircle, Home, Key, HelpCircle, DollarSign
} from "lucide-react";

export default function RoomDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: roomData, isLoading, error } = useGetRoom(id);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-zinc-500 font-medium">Loading room details...</div>
      </div>
    );
  }

  if (error || !roomData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="text-red-500 font-medium">Failed to load room details.</div>
        <Link href="/dashboard/rooms">
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to List</Button>
        </Link>
      </div>
    );
  }

  const rm = roomData as any;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-zinc-150 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/rooms">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
            </Button>
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="text-sm text-zinc-500 font-medium">Room Detail</span>
        </div>
        <Button onClick={() => setIsEditDialogOpen(true)}>
          <Edit className="h-4 w-4 mr-1.5" /> Edit Room
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
                <h1 className="text-2xl font-bold text-zinc-900">{rm.name}</h1>
                <p className="text-zinc-500 mt-1 text-sm">{rm.description || "No description provided."}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {rm.isArchived ? (
                  <Badge variant="secondary">Archived</Badge>
                ) : (
                  <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Active</Badge>
                )}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 bg-zinc-50 px-2 py-1 rounded border border-zinc-100 mt-1">
                  {rm.inStock ? (
                    <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Available</span>
                  ) : (
                    <span className="text-red-650 flex items-center gap-1"><XCircle className="h-3 w-3" /> Occupied/Unavailable</span>
                  )}
                </div>
              </div>
            </div>

            {/* General Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-100 text-sm">
              <div className="flex items-center gap-2 text-zinc-650">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span><strong>Price:</strong> ${rm.perNightPrice}/night</span>
              </div>
              {rm.accommodationCategory && (
                <div className="flex items-center gap-2 text-zinc-655">
                  <Home className="h-4 w-4 text-zinc-450" />
                  <span><strong>Category:</strong> {rm.accommodationCategory}</span>
                </div>
              )}
              {rm.occupancy && (
                <div className="flex items-center gap-2 text-zinc-655">
                  <Key className="h-4 w-4 text-zinc-450" />
                  <span><strong>Max Occupancy:</strong> {rm.occupancy}</span>
                </div>
              )}
            </div>

            {/* Additional Numeric Fields */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-zinc-50 text-xs text-zinc-500">
              {rm.floorSize !== undefined && (
                <div>
                  <span className="font-semibold block text-zinc-800">Floor Size</span>
                  <span>{rm.floorSize} sq ft</span>
                </div>
              )}
              {rm.floorLevel && (
                <div>
                  <span className="font-semibold block text-zinc-800">Floor Level</span>
                  <span>{rm.floorLevel}</span>
                </div>
              )}
              {rm.numberOfRooms !== undefined && (
                <div>
                  <span className="font-semibold block text-zinc-800">Rooms Count</span>
                  <span>{rm.numberOfRooms}</span>
                </div>
              )}
              {rm.numberOfBathroomsTotal !== undefined && (
                <div>
                  <span className="font-semibold block text-zinc-800">Bathrooms</span>
                  <span>{rm.numberOfBathroomsTotal}</span>
                </div>
              )}
            </div>
            
            <div className="text-xs text-zinc-500 pt-2 flex items-center gap-1.5 bg-zinc-50/50 p-2 rounded">
              <span className="font-semibold text-zinc-800">Pets Allowed:</span>
              <span>{rm.petsAllowed ? "Yes" : "No"}</span>
            </div>
          </div>

          {/* Location & Booking Links Card */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-zinc-450" /> Location & Booking Options
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                {rm.tourBookingPage && (
                  <div className="flex items-center gap-2 text-zinc-650">
                    <Globe className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium text-zinc-900">Virtual Tour:</span>
                    <a href={rm.tourBookingPage} target="_blank" rel="noopener noreferrer" className="text-indigo-650 hover:underline truncate">
                      {rm.tourBookingPage}
                    </a>
                  </div>
                )}
              </div>

              {rm.address && (
                <div className="bg-zinc-50 border border-zinc-150 rounded-lg p-4 space-y-2">
                  <div className="font-semibold text-zinc-955 text-xs uppercase tracking-wider">Room Address / Building</div>
                  <div className="text-zinc-650 leading-relaxed text-xs">
                    {rm.address.streetAddress && <div>{rm.address.streetAddress}</div>}
                    <div>
                      {[rm.address.addressLocality, rm.address.addressRegion, rm.address.postalCode]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                    {rm.address.addressCountry && <div>{rm.address.addressCountry}</div>}
                  </div>
                  {rm.geo && (rm.geo.coordinates?.[0] !== undefined || rm.geo.coordinates?.[1] !== undefined) && (
                    <div className="text-[10px] text-zinc-400 font-mono pt-1.5 border-t border-zinc-200">
                      GPS Coordinates: Lat {rm.geo.coordinates[1]}, Lng {rm.geo.coordinates[0]}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Amenities & Previews & SEO */}
        <div className="space-y-6">
          {/* Classification details */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-2">Room Setup</h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Beds Provided</div>
                <div className="flex flex-wrap gap-1.5">
                  {rm.bed && rm.bed.length > 0 ? (
                    rm.bed.map((b: string) => (
                      <Badge key={b} variant="outline" className="bg-blue-50/50 border-blue-100 text-blue-700">{b}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-450 italic">—</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Amenities & Features</div>
                <div className="flex flex-wrap gap-1.5">
                  {rm.amenityFeature && rm.amenityFeature.length > 0 ? (
                    rm.amenityFeature.map((af: string) => (
                      <Badge key={af} variant="outline" className="bg-zinc-50 border-zinc-200 text-zinc-650">{af}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-450 italic">—</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Media/Images Previews */}
          {rm.image && rm.image.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-zinc-900">Room Photos</h2>
              <div className="grid grid-cols-2 gap-3 pt-1">
                {rm.image.map((img: string, i: number) => (
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
          {rm.seo && (rm.seo.metaTitle || rm.seo.metaDescription || (rm.seo.keywords && rm.seo.keywords.length > 0)) && (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-2">Search Optimization</h2>
              <div className="space-y-3 text-xs leading-relaxed text-zinc-655">
                {rm.seo.metaTitle && (
                  <div>
                    <span className="font-semibold text-zinc-900 block mb-0.5">Meta Title</span>
                    <span className="bg-zinc-50 px-2 py-1 rounded border border-zinc-100 block">{rm.seo.metaTitle}</span>
                  </div>
                )}
                {rm.seo.metaDescription && (
                  <div>
                    <span className="font-semibold text-zinc-900 block mb-0.5">Meta Description</span>
                    <span className="bg-zinc-50 px-2 py-1 rounded border border-zinc-100 block">{rm.seo.metaDescription}</span>
                  </div>
                )}
                {rm.seo.keywords && rm.seo.keywords.length > 0 && (
                  <div>
                    <span className="font-semibold text-zinc-900 block mb-1">Keywords</span>
                    <div className="flex flex-wrap gap-1">
                      {rm.seo.keywords.map((kw: string) => (
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

      <RoomDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        room={rm} 
      />
    </div>
  );
}
