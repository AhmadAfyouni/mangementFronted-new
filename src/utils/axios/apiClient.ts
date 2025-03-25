// apiClient.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { tokenService } from "./tokenService";
import { AUTH_CONSTANTS } from "./constants";
import { LoginResponse } from "@/types/LoginResponse.type";

export class ApiClient {
  private api: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseURL: string) {
    this.api = axios.create({
      baseURL,
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add authorization header with access token
    this.api.interceptors.request.use((config) => {
      // Don't add token for auth endpoints
      if (!this.isAuthEndpoint(config.url || "")) {
        const token = tokenService.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log(`[Request] Adding auth token for: ${config.url}`);
        } else {
          console.log(`[Request] No access token available for: ${config.url}`);
        }
      } else {
        console.log(
          `[Request] Auth endpoint detected, skipping token: ${config.url}`
        );
      }
      return config;
    });

    // Response interceptor - Handle token refresh
    this.api.interceptors.response.use(
      (response) => {
        console.log(`[Response] Success for ${response.config.url}`);
        return response.data;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        console.log(
          `[Response Error] ${error.response?.status} for ${originalRequest.url}`
        );
        console.log(
          `[Response Error] Is auth endpoint: ${this.isAuthEndpoint(
            originalRequest.url || ""
          )}`
        );
        console.log(
          `[Response Error] Has retry flag: ${!!originalRequest._retry}`
        );

        // Check if error is due to an expired token
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          // Don't attempt to refresh token on auth endpoints
          !this.isAuthEndpoint(originalRequest.url || "")
        ) {
          console.log(
            `[Token Refresh] Starting refresh process for: ${originalRequest.url}`
          );

          if (this.isRefreshing) {
            console.log(
              `[Token Refresh] Already refreshing, adding to subscribers queue`
            );
            // If already refreshing, wait for the new token
            return new Promise<unknown>((resolve) => {
              this.addRefreshSubscriber((token: string) => {
                console.log(
                  `[Token Refresh] Subscriber notified with new token`
                );
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                originalRequest._retry = true;
                resolve(this.api(originalRequest));
              });
            });
          } else {
            // Start the refresh process
            console.log(`[Token Refresh] Initiating new refresh flow`);
            this.isRefreshing = true;
            originalRequest._retry = true;

            try {
              // Attempt to refresh the token
              const refreshToken = tokenService.getRefreshToken();
              console.log(
                `[Token Refresh] Retrieved refresh token: ${
                  refreshToken ? "Yes" : "No"
                }`
              );

              if (!refreshToken) {
                console.log(
                  `[Token Refresh] No refresh token available, redirecting to auth`
                );
                this.redirectToAuth();
                return Promise.reject(error);
              }

              console.log(`[Token Refresh] Calling refresh token endpoint`);
              const response = await this.api.post<LoginResponse>(
                "/auth/refresh-token",
                { refreshToken }
              );

              console.log(
                `[Token Refresh] Refresh response received:`,
                response
              );
              const newToken = response.data.access_token;
              tokenService.setTokens(response.data);

              console.log(
                "Token successfully refreshed:",
                new Date().toISOString()
              );

              // Notify all the subscribers about the new token
              this.onRefreshed(newToken);

              // Retry the original request with new token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }

              console.log(
                `[Token Refresh] Retrying original request with new token`
              );
              return this.api(originalRequest);
            } catch (refreshError) {
              // If refresh fails, clear tokens and redirect to login
              console.error(
                `[Token Refresh] Error refreshing token:`,
                refreshError
              );
              tokenService.clearTokens();
              this.redirectToAuth();
              return Promise.reject(refreshError);
            } finally {
              this.isRefreshing = false;
              console.log(`[Token Refresh] Reset refreshing flag to false`);
            }
          }
        } else if (error.response?.status === 401) {
          console.log(
            `[Token Refresh] 401 received but not eligible for refresh:`,
            {
              isAuthEndpoint: this.isAuthEndpoint(originalRequest.url || ""),
              hasRetryFlag: !!originalRequest._retry,
            }
          );
        }

        return Promise.reject(error);
      }
    );
  }

  private isAuthEndpoint(url: string): boolean {
    const authEndpoints = [
      "/auth/login",
      "/auth/register",
      "/auth/logout",
      "/auth/refresh-token",
    ];
    return authEndpoints.some((endpoint) => url.includes(endpoint));
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
    console.log(
      `[Token Refresh] Added subscriber. Total subscribers: ${this.refreshSubscribers.length}`
    );
  }

  private onRefreshed(token: string) {
    console.log(
      `[Token Refresh] Notifying ${this.refreshSubscribers.length} subscribers with new token`
    );
    // Execute all the pending requests with the new token
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private redirectToAuth() {
    console.log(
      `[Auth] Redirecting to authentication page: ${AUTH_CONSTANTS.AUTH_PATH}`
    );
    window.location.href = AUTH_CONSTANTS.AUTH_PATH;
  }

  // API methods
  async get<T>(url: string, params?: unknown): Promise<T> {
    return this.api.get(url, { params });
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    return this.api.post(url, data);
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    return this.api.put(url, data);
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    return this.api.patch(url, data);
  }

  async delete<T>(url: string): Promise<T> {
    return this.api.delete(url);
  }
}
