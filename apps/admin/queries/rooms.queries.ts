import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaginatedResponse } from "./doctors.queries";

export interface Room {
  _id: string;
  name: string;
  description?: string;
  accommodationCategory?: string;
  bed?: string[];
  occupancy?: number;
  floorLevel?: string;
  floorSize?: number;
  numberOfRooms?: number;
  numberOfBathroomsTotal?: number;
  amenityFeature?: string[];
  petsAllowed?: boolean;
  perNightPrice: number;
  inStock?: boolean;
  tourBookingPage?: string;
  image?: string[];
  isArchived?: boolean;
  createdAt?: string;
}

export interface CreateRoomPayload {
  name: string;
  description?: string;
  accommodationCategory?: string;
  bed?: string[];
  occupancy?: number;
  floorLevel?: string;
  floorSize?: number;
  numberOfRooms?: number;
  numberOfBathroomsTotal?: number;
  amenityFeature?: string[];
  petsAllowed?: boolean;
  perNightPrice: number;
  inStock?: boolean;
  tourBookingPage?: string;
  address?: object;
  geo?: object;
  image?: string[];
  seo?: object;
}

const ROOMS_KEY = "rooms";

const fetchRooms = async (page: number, limit = 10): Promise<PaginatedResponse<Room>> => {
  const { data } = await api.get(`/rooms?page=${page}&limit=${limit}`);
  return data;
};

const fetchRoom = async (id: string): Promise<Room> => {
  const { data } = await api.get(`/rooms/${id}`);
  return data;
};

const createRoom = async (payload: CreateRoomPayload) => {
  const { data } = await api.post("/rooms", payload);
  return data;
};

const updateRoom = async ({ id, payload }: { id: string; payload: Partial<CreateRoomPayload> }) => {
  const { data } = await api.put(`/rooms/${id}`, payload);
  return data;
};

const archiveRoom = async (id: string) => {
  const { data } = await api.patch(`/rooms/${id}/archive`);
  return data;
};

const deleteRoom = async (id: string) => {
  const { data } = await api.delete(`/rooms/${id}`);
  return data;
};

export const useGetRooms = (page: number, limit = 10) =>
  useQuery({
    queryKey: [ROOMS_KEY, page, limit],
    queryFn: () => fetchRooms(page, limit),
  });

export const useGetRoom = (id: string) =>
  useQuery({
    queryKey: [ROOMS_KEY, id],
    queryFn: () => fetchRoom(id),
    enabled: !!id,
  });

export const useCreateRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createRoom,
    onSuccess: () => qc.invalidateQueries({ queryKey: [ROOMS_KEY] }),
  });
};

export const useUpdateRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateRoom,
    onSuccess: () => qc.invalidateQueries({ queryKey: [ROOMS_KEY] }),
  });
};

export const useArchiveRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: archiveRoom,
    onSuccess: () => qc.invalidateQueries({ queryKey: [ROOMS_KEY] }),
  });
};

export const useDeleteRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => qc.invalidateQueries({ queryKey: [ROOMS_KEY] }),
  });
};
