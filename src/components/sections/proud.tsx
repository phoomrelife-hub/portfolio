"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { proudItems } from "@/lib/content";

// Hand-placed layout: every item gets its own tilt, vertical drop and overlap so
// the page reads as things taped into a notebook rather than cells in a grid.
// Deterministic (indexed, not random) so server and client render identically.
const placements = [
  { rotate: -2.6, drop: "md:mt-1", pull: "md:-mr-4", z: "z-20", hold: "tape-double" },
  { rotate: 2.1, drop: "md:mt-14", pull: "md:-ml-2", z: "z-10", hold: "pin" },
  { rotate: 1.6, drop: "md:-mt-6", pull: "md:-mr-2", z: "z-30", hold: "tape-center" },
  { rotate: -1.8, drop: "md:mt-6", pull: "md:-ml-4", z: "z-20", hold: "tape-double" },
] as const;

function Tape({ className, rotate }: { className?: string; rotate: number }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute h-6 w-24 opacity-80 shadow-[0_1px_3px_rgba(20,15,5,0.25)]",
        className
      )}
      style={{
        transform: `rotate(${rotate}deg)`,
        background:
          "repeating-linear-gradient(90deg, rgba(233,220,174,0.85) 0 3px, rgba(224,209,159,0.85) 3px 6px)",
        // Torn-off ends rather than a clean rectangle.
        clipPath:
          "polygon(3% 0%, 97% 4%, 100% 96%, 96% 100%, 4% 97%, 0% 6%)",
      }}
    />
  );
}

function Pin() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -top-2 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full shadow-[0_2px_4px_rgba(20,15,5,0.4)]"
      style={{
        background:
          "radial-gradient(circle at 35% 30%, #f3a583 0%, #e2795a 45%, #a8452c 100%)",
      }}
    />
  );
}

export function Proud() {
  return (
    <section
      id="proud"
      className="relative flex min-h-screen w-full flex-col justify-center px-4 py-12 md:px-10 lg:px-14"
    >
      {/* The notebook page itself — a single sheet the section content lives on. */}
      <div className="relative mx-auto w-full max-w-6xl">
        <div
          className="relative overflow-hidden rounded-[3px] px-6 py-9 text-[#1b1815] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.85)] sm:px-10 md:px-16 md:py-11 lg:pl-24"
          style={{ background: "#f6f1e4" }}
        >
          {/* Ruled lines */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(to bottom, transparent 0 31px, rgba(58,92,138,0.16) 31px 32px)",
            }}
          />
          {/* Paper aging / edge shading */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 40%, rgba(255,255,255,0.5) 0%, rgba(0,0,0,0) 55%), linear-gradient(90deg, rgba(90,70,40,0.14) 0%, rgba(0,0,0,0) 12%, rgba(0,0,0,0) 88%, rgba(90,70,40,0.10) 100%)",
            }}
          />
          {/* Red margin rule + punch holes down the binding edge */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 bottom-0 left-10 hidden w-px bg-[#c4685f]/45 lg:block"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 bottom-0 left-3 hidden w-5 flex-col justify-around py-16 lg:flex"
          >
            {[0, 1, 2, 3, 4].map((h) => (
              <span
                key={h}
                className="h-5 w-5 rounded-full bg-[#0c0d10]/85 shadow-[inset_0_2px_3px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.7)]"
              />
            ))}
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8 md:mb-10"
            >
              <p className="mb-3 text-sm uppercase tracking-[0.2em] text-[#c4685f]">
                04 — ความภูมิใจ
              </p>
              <h2 className="font-serif text-4xl font-semibold tracking-tight text-balance text-[#1b1815] md:text-6xl">
                สิ่งที่ทำแล้วภูมิใจ
              </h2>
              <span
                aria-hidden
                className="mt-4 block h-[3px] w-56 max-w-[70%] rounded-full bg-[#c4685f]/55"
                style={{ transform: "rotate(-0.6deg)" }}
              />
            </motion.div>

            <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 md:gap-y-8">
              {proudItems.map((item, i) => {
                const p = placements[i % placements.length];
                const photos = item.photos?.length ? item.photos : undefined;
                const hasMedia = Boolean(item.video || item.photo?.startsWith("/") || photos);
                return (
                  <motion.figure
                    key={item.title}
                    initial={{ opacity: 0, y: 32, rotate: 0, scale: 0.94 }}
                    whileInView={{ opacity: 1, y: 0, rotate: p.rotate, scale: 1 }}
                    viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
                    transition={{
                      duration: 0.6,
                      delay: Math.min(i * 0.1, 0.5),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{ rotate: p.rotate / 3, scale: 1.03, y: -6 }}
                    className={cn(
                      "relative shadow-[0_10px_24px_-8px_rgba(30,20,10,0.55)]",
                      hasMedia
                        ? "bg-white px-3 pt-3 pb-5"
                        : "bg-[#f7e79a] px-6 py-7",
                      p.drop,
                      p.pull,
                      p.z
                    )}
                  >
                    {p.hold === "pin" && <Pin />}
                    {p.hold === "tape-center" && (
                      <Tape rotate={-1.5} className="-top-3 left-1/2 -ml-12" />
                    )}
                    {p.hold === "tape-double" && (
                      <>
                        <Tape rotate={-38} className="-top-4 -left-8" />
                        <Tape rotate={38} className="-top-4 -right-8" />
                      </>
                    )}

                    {hasMedia && (
                      <div className="relative aspect-[4/3] w-full overflow-hidden border border-black/5 bg-[#e7e2d6]">
                        {item.video ? (
                          <video
                            src={item.video}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="h-full w-full object-contain"
                          />
                        ) : photos ? (
                          <div className="relative flex h-full w-full items-center justify-center">
                            {photos.map((src, pi) => {
                              const fan = [
                                { rotate: -6, x: "-14%", y: "6%", z: 10 },
                                { rotate: 4, x: "13%", y: "-4%", z: 20 },
                                { rotate: -2, x: "0%", y: "10%", z: 30 },
                              ][pi % 3];
                              return (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  key={src}
                                  src={src}
                                  alt={`${item.title} ${pi + 1}`}
                                  className="absolute h-[72%] w-[62%] rounded-[2px] border-2 border-white object-cover shadow-[0_6px_16px_-4px_rgba(0,0,0,0.5)]"
                                  style={{
                                    transform: `translate(${fan.x}, ${fan.y}) rotate(${fan.rotate}deg)`,
                                    zIndex: fan.z,
                                  }}
                                />
                              );
                            })}
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.photo}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    )}

                    <figcaption className={cn(hasMedia && "mt-3 px-1")}>
                      <h3
                        className={cn(
                          "font-serif leading-snug font-semibold text-[#1b1815]",
                          hasMedia ? "text-base" : "text-lg"
                        )}
                      >
                        {item.title}
                      </h3>
                      <p
                        className={cn(
                          "mt-1.5 leading-relaxed italic",
                          hasMedia ? "text-xs text-[#1b1815]/60" : "text-sm text-[#1b1815]/70"
                        )}
                      >
                        {item.description}
                      </p>
                      {!hasMedia && (
                        <span className="mt-4 inline-block rounded-sm border border-dashed border-black/25 px-2.5 py-1 text-[10px] uppercase tracking-widest text-black/35">
                          {item.photo}
                        </span>
                      )}
                    </figcaption>
                  </motion.figure>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sheet stacked underneath — hints at a whole notebook, not one page. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-3 -bottom-2 -z-10 h-6 rounded-b-[3px] bg-[#e6dfcd] shadow-[0_18px_40px_-16px_rgba(0,0,0,0.8)]"
        />
      </div>
    </section>
  );
}
