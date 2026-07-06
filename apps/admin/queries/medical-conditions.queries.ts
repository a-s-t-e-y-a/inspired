import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaginatedResponse } from "./doctors.queries";

export interface MedicalCondition {
  _id: string;
  name: string;
  alternateName?: string;
  description?: string;
  code?: string;
  cause?: string[];
  riskFactor?: string[];
  signOrSymptom?: string[];
  possibleTreatment?: string[];
  relevantSpecialty?: string[];
  image?: string[];
  isArchived?: boolean;
  createdAt?: string;
}

export interface CreateMedicalConditionPayload {
  name: string;
  alternateName?: string;
  description?: string;
  disambiguatingDescription?: string;
  code?: string;
  url?: string;
  pathophysiology?: string;
  epidemiology?: string;
  expectedPrognosis?: string;
  naturalProgression?: string;
  cause?: string[];
  riskFactor?: string[];
  signOrSymptom?: string[];
  differentialDiagnosis?: string[];
  typicalTest?: string[];
  stage?: string[];
  possibleTreatment?: string[];
  primaryPrevention?: string;
  secondaryPrevention?: string;
  drug?: string[];
  relevantSpecialty?: string[];
  image?: string[];
  seo?: object;
}

const MC_KEY = "medical-conditions";

const fetchMedicalConditions = async (page: number, limit = 10): Promise<PaginatedResponse<MedicalCondition>> => {
  const { data } = await api.get(`/medical-conditions?page=${page}&limit=${limit}`);
  return data;
};

const fetchMedicalCondition = async (id: string): Promise<MedicalCondition> => {
  const { data } = await api.get(`/medical-conditions/${id}`);
  return data;
};

const createMedicalCondition = async (payload: CreateMedicalConditionPayload) => {
  const { data } = await api.post("/medical-conditions", payload);
  return data;
};

const updateMedicalCondition = async ({ id, payload }: { id: string; payload: Partial<CreateMedicalConditionPayload> }) => {
  const { data } = await api.put(`/medical-conditions/${id}`, payload);
  return data;
};

const archiveMedicalCondition = async (id: string) => {
  const { data } = await api.patch(`/medical-conditions/${id}/archive`);
  return data;
};

const deleteMedicalCondition = async (id: string) => {
  const { data } = await api.delete(`/medical-conditions/${id}`);
  return data;
};

export const useGetMedicalConditions = (page: number, limit = 10) =>
  useQuery({
    queryKey: [MC_KEY, page, limit],
    queryFn: () => fetchMedicalConditions(page, limit),
  });

export const useGetMedicalCondition = (id: string) =>
  useQuery({
    queryKey: [MC_KEY, id],
    queryFn: () => fetchMedicalCondition(id),
    enabled: !!id,
  });

export const useCreateMedicalCondition = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMedicalCondition,
    onSuccess: () => qc.invalidateQueries({ queryKey: [MC_KEY] }),
  });
};

export const useUpdateMedicalCondition = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMedicalCondition,
    onSuccess: () => qc.invalidateQueries({ queryKey: [MC_KEY] }),
  });
};

export const useArchiveMedicalCondition = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: archiveMedicalCondition,
    onSuccess: () => qc.invalidateQueries({ queryKey: [MC_KEY] }),
  });
};

export const useDeleteMedicalCondition = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteMedicalCondition,
    onSuccess: () => qc.invalidateQueries({ queryKey: [MC_KEY] }),
  });
};
