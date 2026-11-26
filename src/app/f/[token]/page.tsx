// /f/<token> — javni link foldera iz OS General-a (dugme „Link“ u zaglavlju foldera).
// Token je u noteFolders.data.share; os.folder_share_get() vraća folder, podfoldere i
// fajlove u njima, a zove se samo sa service_role ključem (anon nema pristup). Link
// važi dok je token u folderu: „Ugasi link“ ili brisanje foldera ga gasi odmah, zato
// je stranica dinamička. Stranice (notes) se ne dele, samo fajlovi.
// Van grupe (site): bez headera i footera sajta.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import FolderShare, {
  type ShareData,
} from "@/components/site/deljeno/FolderShare";

export const dynamic = "force-dynamic";

const getShare = cache(async (token: string): Promise<ShareData | null> => {
  if (!/^[A-Za-z0-9]{20,64}$/.test(token)) return null;
  const { data, error } = await supabaseAdmin
    .schema("os")
    .rpc("folder_share_get", { p_token: token });
  if (error) throw new Error(error.message);
  return (data as ShareData | null) || null;
});

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const d = await getShare(token);
  const title = d ? d.name || "Folder" : "Link ne važi";
  return {
    title,
    description: d
      ? `${d.files.length} ${d.files.length === 1 ? "fajl" : "fajlova"} za preuzimanje`
      : undefined,
    robots: { index: false, follow: false },
    openGraph: { title, images: [{ url: "/og.png" }] },
  };
}

export default async function Page({ params }: Props) {
  const { token } = await params;
  const d = await getShare(token);
  if (!d) notFound();
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/os-assets/`;
  return <FolderShare data={d} base={base} />;
}
