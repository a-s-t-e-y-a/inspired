import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Doctor {
  _id: string;
  name: string;
  description?: string;
  url?: string;
  medicalSpecialty?: string[];
  availableService?: string[];
  isAcceptingNewPatients?: boolean;
  usNPI?: string;
  hospitalAffiliation?: string[];
  telephone?: string;
  email?: string;
  image?: string[];
  isArchived?: boolean;
  createdAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateDoctorPayload {
  name: string;
  description?: string;
  url?: string;
  occupationalCategory?: string[];
  medicalSpecialty?: string[];
  availableService?: string[];
  isAcceptingNewPatients?: boolean;
  usNPI?: string;
  hospitalAffiliation?: string[];
  telephone?: string;
  email?: string;
  faxNumber?: string;
  address?: object;
  geo?: object;
  image?: string[];
  seo?: object;
}

const DOCTORS_KEY = "doctors";

const fetchDoctors = async (page: number, limit = 10): Promise<PaginatedResponse<Doctor>> => {
  const { data } = await api.get(`/doctors?page=${page}&limit=${limit}`);
  return data;
};

const fetchDoctor = async (id: string): Promise<Doctor> => {
  const { data } = await api.get(`/doctors/${id}`);
  return data;
};

const createDoctor = async (payload: CreateDoctorPayload) => {
  const { data } = await api.post("/doctors", payload);
  return data;
};

const updateDoctor = async ({ id, payload }: { id: string; payload: Partial<CreateDoctorPayload> }) => {
  const { data } = await api.put(`/doctors/${id}`, payload);
  return data;
};

const archiveDoctor = async (id: string) => {
  const { data } = await api.patch(`/doctors/${id}/archive`);
  return data;
};

const deleteDoctor = async (id: string) => {
  const { data } = await api.delete(`/doctors/${id}`);
  return data;
};

export const useGetDoctors = (page: number, limit = 10) =>
  useQuery({
    queryKey: [DOCTORS_KEY, page, limit],
    queryFn: () => fetchDoctors(page, limit),
  });

export const useGetDoctor = (id: string) =>
  useQuery({
    queryKey: [DOCTORS_KEY, id],
    queryFn: () => fetchDoctor(id),
    enabled: !!id,
  });

export const useCreateDoctor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDoctor,
    onSuccess: () => qc.invalidateQueries({ queryKey: [DOCTORS_KEY] }),
  });
};

export const useUpdateDoctor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateDoctor,
    onSuccess: () => qc.invalidateQueries({ queryKey: [DOCTORS_KEY] }),
  });
};

export const useArchiveDoctor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: archiveDoctor,
    onSuccess: () => qc.invalidateQueries({ queryKey: [DOCTORS_KEY] }),
  });
};

export const useDeleteDoctor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDoctor,
    onSuccess: () => qc.invalidateQueries({ queryKey: [DOCTORS_KEY] }),
  });
};
