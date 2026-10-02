/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 adalah native module; jangan di-bundle oleh Next.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
