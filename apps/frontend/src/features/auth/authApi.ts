import { api } from "@/lib/axios";
import type { LoginPayload, LoginResponse } from "@/types/auth.types";

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await api.post("/auth/login", payload);

    return response.data.data;
  }
}