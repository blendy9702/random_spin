import { SlotMachine } from "./components/SlotMachine";

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 font-sans dark:bg-black">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(244,63,94,0.12),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(244,63,94,0.16),transparent_55%)]" />
      <main className="relative w-full px-6 py-16 sm:px-10">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-10">
          <SlotMachine />
          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            시작을 누르면 슬롯이 계속 회전하고, 정지를 누르면 천천히 감속하며
            멈춥니다.
          </p>
        </div>
      </main>
    </div>
  );
}
