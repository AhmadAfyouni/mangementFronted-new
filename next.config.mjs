/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "168.231.110.121",
        port: "8011",
        pathname: "/public-files/**",
      },
      {
        protocol: "https",
        hostname: "168.231.110.121",
        port: "8011",
        pathname: "/public-files/**",
      },
      {
        protocol: "http",
        hostname: "168.231.110.121",
        port: "8021",
        pathname: "/public-files/**",
      },
      {
        protocol: "https",
        hostname: "168.231.110.121",
        port: "8021",
        pathname: "/public-files/**",
      },
      // Add localhost for development
      {
        protocol: "http",
        hostname: "localhost",
        port: "8011",
        pathname: "/public-files/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8011",
        pathname: "/public-files/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8021",
        pathname: "/public-files/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8021",
        pathname: "/public-files/**",
      },
    ],
  },
};

export default nextConfig;
