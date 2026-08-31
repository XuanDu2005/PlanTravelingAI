import AuthSwitch from "./auth-switch";

export default function Demo() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950">
      <AuthSwitch initialMode="login" />
    </div>
  );
}
