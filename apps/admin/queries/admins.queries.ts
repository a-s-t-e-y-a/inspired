import api from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt?: string;
}

export interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
}

const ADMINS_KEY = "admins";

const fetchAdmins = async (): Promise<AdminUser[]> => {
  const { data } = await api.get("/admins");
  return data;
};

const createAdmin = async (payload: CreateAdminPayload): Promise<AdminUser> => {
  const { data } = await api.post("/admins", payload);
  return data;
};

const deleteAdmin = async (id: string): Promise<void> => {
  await api.delete(`/admins/${id}`);
};

export const useGetAdmins = () =>
  useQuery({
    queryKey: [ADMINS_KEY],
    queryFn: fetchAdmins,
  });

export const useCreateAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdmin,
    onSuccess: () => qc.invalidateQueries({ queryKey: [ADMINS_KEY] }),
  });
};

export const useDeleteAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => qc.invalidateQueries({ queryKey: [ADMINS_KEY] }),
  });
};
