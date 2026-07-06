import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaginatedResponse } from "./doctors.queries";

export interface Hospital {
  _id: string;
  name: string;
  description?: string;
  slogan?: string;
  url?: string;
  telephone?: string;
  email?: string;
  logo?: string;
  image?: string[];
  medicalSpecialty?: string[];
  availableService?: string[];
  isAcceptingNewPatients?: boolean;
  priceRange?: string;
  isArchived?: boolean;
  createdAt?: string;
}

export interface CreateHospitalPayload {
  name: string;
  description?: string;
  disambiguatingDescription?: string;
  slogan?: string;
  url?: string;
  awards?: string[];
  alumni?: string[];
  owner?: string;
  telephone?: string;
  email?: string;
  faxNumber?: string;
  address?: object;
  geo?: object;
  logo?: string;
  image?: string[];
  medicalSpecialty?: string[];
  availableService?: string[];
  isAcceptingNewPatients?: boolean;
  openingHoursSpecification?: object[];
  priceRange?: string;
  seo?: object;
}

const HOSPITALS_KEY = "hospitals";

const fetchHospitals = async (page: number, limit = 10): Promise<PaginatedResponse<Hospital>> => {
  const { data } = await api.get(`/hospitals?page=${page}&limit=${limit}`);
  return data;
};

const fetchHospital = async (id: string): Promise<Hospital> => {
  const { data } = await api.get(`/hospitals/${id}`);
  return data;
};

const createHospital = async (payload: CreateHospitalPayload) => {
  const { data } = await api.post("/hospitals", payload);
  return data;
};

const updateHospital = async ({ id, payload }: { id: string; payload: Partial<CreateHospitalPayload> }) => {
  const { data } = await api.put(`/hospitals/${id}`, payload);
  return data;
};

const archiveHospital = async (id: string) => {
  const { data } = await api.patch(`/hospitals/${id}/archive`);
  return data;
};

const deleteHospital = async (id: string) => {
  const { data } = await api.delete(`/hospitals/${id}`);
  return data;
};

export const useGetHospitals = (page: number, limit = 10) =>
  useQuery({
    queryKey: [HOSPITALS_KEY, page, limit],
    queryFn: () => fetchHospitals(page, limit),
  });

export const useGetHospital = (id: string) =>
  useQuery({
    queryKey: [HOSPITALS_KEY, id],
    queryFn: () => fetchHospital(id),
    enabled: !!id,
  });

export const useCreateHospital = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createHospital,
    onSuccess: () => qc.invalidateQueries({ queryKey: [HOSPITALS_KEY] }),
  });
};

export const useUpdateHospital = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateHospital,
    onSuccess: () => qc.invalidateQueries({ queryKey: [HOSPITALS_KEY] }),
  });
};

export const useArchiveHospital = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: archiveHospital,
    onSuccess: () => qc.invalidateQueries({ queryKey: [HOSPITALS_KEY] }),
  });
};

export const useDeleteHospital = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteHospital,
    onSuccess: () => qc.invalidateQueries({ queryKey: [HOSPITALS_KEY] }),
  });
};
