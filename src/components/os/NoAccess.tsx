import { OS } from "@/lib/os/theme";
import SignOut from "@/components/os/SignOut";

export default function NoAccess({ email }: { email: string }) {
  return (
    <div
      className="grid min-h-dvh place-items-center px-4"
      style={{ background: OS.bg, color: OS.text }}
    >
      <div className="max-w-sm text-center">
        <h1
          className="text-[22px] font-semibold"
          style={{ letterSpacing: "-0.02em" }}
        >
          Nemaš pristup
        </h1>
        <p className="mt-2 text-[15px]" style={{ color: OS.muted }}>
          {email} nije član tima u Skeylo OS-u.
        </p>
        <div className="mt-6 flex justify-center">
          <SignOut />
        </div>
      </div>
    </div>
  );
}
