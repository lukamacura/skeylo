import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Skeylo OS je samostalna aplikacija u public/os-app (hash rute).
      { source: "/os", destination: "/os-app/index.html" },
      // CRM klijenta (Infinity Laser) čita iste podatke iz OS-a; linkovi su /crm#...
      { source: "/crm", destination: "/crm-app/index.html" },
      // Upload-ovi iz OS-a: app.js ih čuva kao "/_blob/<id>".
      ...(supabaseUrl
        ? [
            {
              source: "/_blob/:id",
              destination: `${supabaseUrl}/storage/v1/object/public/os-assets/:id`,
            },
          ]
        : []),
    ];
  },
};

export default nextConfig;
