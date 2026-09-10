export default function Home() {
  return (
    <main className="min-h-screen bg-[#030712] text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 pt-24 pb-16 text-center">

        <h1 className="font-[family:var(--font-heading)] text-6xl font-bold tracking-tight md:text-8xl">
          VisionPilot AI
        </h1>

        <h2 className="font-[family:var(--font-heading)] mt-6 text-3xl font-semibold text-white/90 md:text-5xl">
          See. Understand. Ask.
        </h2>

        <p className="mt-8 max-w-xl text-lg leading-8 text-slate-400 md:text-xl">
  Point your camera at anything.

  <br />
  VisionPilot identifies it,
  understands it,
  and answers your questions.
</p>

        <button className="mt-12 rounded-2xl bg-cyan-400 px-8 py-4 text-lg font-semibold text-slate-900 transition-all duration-300 hover:scale-105 hover:bg-cyan-300">
          Enable Camera
        </button>

        <div className="mt-16 w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">

  <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">

    <h3 className="text-lg font-semibold tracking-wide">
      LIVE CAMERA
    </h3>

    <span className="rounded-full bg-amber-400/20 px-3 py-1 text-sm text-amber-300">
      Waiting for Permission
    </span>

  </div>

  <div className="flex aspect-video items-center justify-center bg-[#0b1220]">

    <div className="text-center">

      <div className="text-7xl opacity-60">
        📷
      </div>

      <p className="mt-6 text-lg text-slate-400">
        Camera feed will appear here
      </p>

    </div>

  </div>

</div>

      </section>
    </main>
  );
}