// usage.ts
import { ApiClient } from "./apiClient";
import { AuthService } from "./authService";

const apiClient = new ApiClient(process.env.NEXT_PUBLIC_BASE_URL || "");
export const authService = new AuthService(apiClient);
export { apiClient };
