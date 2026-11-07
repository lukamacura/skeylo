import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  // Fajlovi editora za crteže: nazivi u assets sadrže hash, a fontovi se menjaju samo sa
  // novom verzijom Excalidraw-a. Bez ovoga bi se svi proveravali pri svakom otvaranju.
  async headers() {
    return [
      {
        source: "/os-app/draw/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/os-app/draw/fonts/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }],
      },
      // Fontovi OS-a i CRM-a (fonts.css): menjaju se samo sa novim imenom fajla.
      {
        source: "/os-app/fonts/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }],
      },
    ];
  },
  async redirects() {
    return [
      // Zakazivanje je bilo na /poziv pre nego što je preimenovano u sastanak.
      { source: "/poziv", destination: "/sastanak", permanent: false },
    ];
  },
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
