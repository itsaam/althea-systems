const STATS = [
  { value: "15", unit: "ans", label: "d'expertise terrain", caption: "depuis 2011" },
  { value: "2\u202F500", unit: "+", label: "professionnels équipés", caption: "hôpitaux, cliniques, cabinets" },
  { value: "48", unit: "h", label: "de livraison garantie", caption: "France métropolitaine" },
  { value: "98", unit: "%", label: "clients fidèles", caption: "mesuré sur 12 mois" },
];

export default function StatsBand() {
  return (
    <section className="relative isolate overflow-hidden bg-shadow-grey-900 py-24 text-white md:py-36 grain">
      {/* Gradient orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 h-[520px] w-[520px] rounded-full bg-electric-indigo-500 opacity-30 blur-[180px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 right-0 h-[440px] w-[440px] rounded-full bg-lavender-mist-500 opacity-25 blur-[160px]"
      />

      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        {/* Section header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-lavender-mist-300">Chiffres clés</p>
            <h2 className="font-display mt-6 max-w-2xl text-display-sm text-white">
              Des preuves, pas des
              <br />
              <em className="not-italic italic text-brand-gradient">promesses marketing.</em>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-shadow-grey-300">
            Les chiffres qui tiennent dans la durée — pas ceux qu&apos;on poste le lundi et qu&apos;on oublie le vendredi.
          </p>
        </div>

        {/* Stats grid — massive typography */}
        <dl className="mt-20 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/5 md:mt-28 md:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="group relative flex flex-col gap-3 bg-shadow-grey-900 p-10 transition-colors duration-500 hover:bg-shadow-grey-800 md:p-12"
            >
              <span className="eyebrow text-lavender-mist-400">
                {String(i + 1).padStart(2, "0")}
              </span>
              <dd className="font-display flex items-baseline whitespace-nowrap text-[5.5rem] italic leading-none tracking-tight text-white md:text-[7rem]">
                <span className="whitespace-nowrap">{stat.value}</span>
                <span className="ml-1 text-4xl text-electric-indigo-300 md:text-5xl">
                  {stat.unit}
                </span>
              </dd>
              <dt className="mt-2 text-base font-medium text-shadow-grey-100 md:text-lg">
                {stat.label}
              </dt>
              <p className="text-sm text-shadow-grey-400">{stat.caption}</p>

              {/* Hover accent line */}
              <span
                aria-hidden="true"
                className="absolute inset-x-10 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-electric-indigo-400 via-lavender-mist-400 to-transparent transition-transform duration-700 ease-out-expo group-hover:scale-x-100 md:inset-x-12"
              />
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
