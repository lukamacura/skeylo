import { redirect } from "next/navigation";

// Prezentacija je sada generička i živi na /bazeni; stari link samo preusmerava.
export default function OldPoolPitchPage() {
  redirect("/bazeni");
}
