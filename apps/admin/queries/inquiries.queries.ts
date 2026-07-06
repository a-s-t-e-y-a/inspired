import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaginatedResponse } from "./doctors.queries";

export interface Inquiry {
  _id: string;
  fullName: string;
  country: string;
  email: string;
  phone: string;
  medicalCondition?: string;
  documentUrl?: string;
  source: 'contact_form' | 'need_help';
  isArchived: boolean;
  createdAt: string;
}

const INQUIRIES_KEY = "inquiries";

const fetchInquiries = async (page: number, limit = 10): Promise<PaginatedResponse<Inquiry>> => {
  const { data } = await api.get(`/inquiries?page=${page}&limit=${limit}`);
  return data;
};

const archiveInquiry = async (id: string) => {
  const { data } = await api.patch(`/inquiries/${id}/archive`);
  return data;
};

const deleteInquiry = async (id: string) => {
  const { data } = await api.delete(`/inquiries/${id}`);
  return data;
};

export const useGetInquiries = (page: number, limit = 10) =>
  useQuery({
    queryKey: [INQUIRIES_KEY, page, limit],
    queryFn: () => fetchInquiries(page, limit),
  });

export const useArchiveInquiry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: archiveInquiry,
    onSuccess: () => qc.invalidateQueries({ queryKey: [INQUIRIES_KEY] }),
  });
};

export const useDeleteInquiry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteInquiry,
    onSuccess: () => qc.invalidateQueries({ queryKey: [INQUIRIES_KEY] }),
  });
};
