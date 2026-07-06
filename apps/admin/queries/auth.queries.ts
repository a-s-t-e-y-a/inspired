import api from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

interface AdminLoginPayload {
  email: string;
  passwordHash: string;
}

interface AdminSignupPayload {
  name: string;
  email: string;
  passwordHash: string;
}

const loginAdmin = async (payload: AdminLoginPayload) => {
  const { data } = await api.post("/auth/admin/login", payload);
  return data;
};

const logoutAdmin = async () => {
  await api.post("/auth/logout", {});
};

const signupAdmin = async (payload: AdminSignupPayload) => {
  const { data } = await api.post("/auth/admin/signup", payload);
  return data;
};

export const useAdminLogin = () =>
  useMutation({
    mutationFn: loginAdmin,
  });

export const useAdminLogout = () =>
  useMutation({
    mutationFn: logoutAdmin,
  });

export const useAdminSignup = () =>
  useMutation({
    mutationFn: signupAdmin,
  });
