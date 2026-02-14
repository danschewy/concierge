'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CalendarClock,
  CarFront,
  ChevronDown,
  CloudSun,
  DollarSign,
  MapPinned,
  Search,
  Ticket,
  TrainFront,
  UtensilsCrossed,
} from 'lucide-react';

const reveal = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <main className="relative h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth bg-[#0b0f14] text-zinc-100">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-24 top-[-120px] h-[420px] w-[420px] rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -right-16 top-28 h-[380px] w-[380px] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-[-220px] left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.06),transparent_32%)]" />
      </div>

      <div className="fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 gap-2 md:flex md:flex-col">
        {['hero', 'capabilities', 'flow', 'signals', 'cta'].map((id) => (
          <a
            key={id}
            href={`#${id}`}
            className="h-2.5 w-2.5 rounded-full border border-white/30 bg-white/20 transition hover:scale-110 hover:bg-white/50"
            aria-label={`Go to ${id} section`}
          />
        ))}
      </div>

      <section id="hero" className="relative mx-auto flex min-h-[100dvh] w-full max-w-6xl snap-start items-center px-6 py-8 md:px-10">
        <motion.div
          className="grid w-full items-center gap-12 md:grid-cols-[1.1fr_0.9fr]"
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ amount: 0.45 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-300">
                NYC Concierge
              </span>
              <span className="text-sm text-zinc-400">Gotham Valet</span>
            </div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-emerald-300">
              AI OPERATIONS FOR CITY LIFE
            </p>
            <h1 className="font-display text-4xl leading-tight text-zinc-100 sm:text-5xl md:text-6xl">
              The premium AI valet for navigating New York in real time.
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-300 sm:text-base">
              Gotham Valet plans, executes, and adapts across your schedule, subway delays, rides, weather,
              dining, and budget, with Blaxel workers handling long-running delivery and ride tracking in the background.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl border border-emerald-300/50 bg-emerald-300 px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-emerald-200"
              >
                Open the web app
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#capabilities"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs text-zinc-300 transition hover:border-white/25"
              >
                Explore
                <ChevronDown className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-5 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-400">Live intelligence</span>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2 py-1 text-[11px] text-emerald-200">
                Online
              </span>
            </div>
            <div className="space-y-3">
              {[
                { icon: CalendarClock, text: 'Checking schedule conflicts and event timing' },
                { icon: TrainFront, text: 'Reading MTA delays and station arrivals' },
                { icon: CarFront, text: 'Switching to rideshare when speed matters' },
                { icon: CloudSun, text: 'Adjusting plans using current weather' },
                { icon: MapPinned, text: 'Keeping routes centered around your next stop' },
                { icon: CalendarClock, text: 'Monitoring long-running delivery updates via Blaxel jobs' },
              ].map(({ icon: Icon, text }, idx) => (
                <motion.div
                  key={text}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5"
                  initial={{ opacity: 0, x: 18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ amount: 0.55 }}
                  transition={{ delay: 0.12 + idx * 0.06, duration: 0.35 }}
                >
                  <Icon className="h-4 w-4 text-amber-300" />
                  <span className="text-sm text-zinc-300">{text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section id="capabilities" className="relative mx-auto flex min-h-[100dvh] w-full max-w-6xl snap-start items-center px-6 py-8 md:px-10">
        <motion.div
          className="w-full"
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ amount: 0.4 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">Capabilities</p>
          <h2 className="mt-3 font-display text-3xl text-zinc-100 sm:text-5xl">One interface, city-wide control.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: TrainFront, title: 'Transit Intelligence', body: 'Reads subway arrivals and disruption alerts before every move.' },
              { icon: CloudSun, title: 'Weather-Aware Plans', body: 'Adapts recommendations for current and upcoming conditions.' },
              { icon: CarFront, title: 'Ride Dispatch', body: 'Switches to rideshare when timing and reliability matter most.' },
              { icon: UtensilsCrossed, title: 'Food + Reservations', body: 'Finds venues, places orders, and books available tables.' },
              { icon: Ticket, title: 'Events Discovery', body: 'Searches events and surfaces relevant options with pricing context.' },
              { icon: DollarSign, title: 'Budget Guardrails', body: 'Checks spending before premium suggestions or expensive actions.' },
            ].map(({ icon: Icon, title, body }, idx) => (
              <motion.article
                key={title}
                className="rounded-2xl border border-white/12 bg-white/[0.04] p-5 backdrop-blur"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.45 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
              >
                <Icon className="h-5 w-5 text-emerald-300" />
                <h3 className="mt-4 text-lg font-semibold text-zinc-100">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">{body}</p>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>

      <section id="flow" className="relative mx-auto flex min-h-[100dvh] w-full max-w-6xl snap-start items-center px-6 py-8 md:px-10">
        <motion.div
          className="w-full rounded-3xl border border-white/12 bg-black/20 p-6 backdrop-blur md:p-10"
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ amount: 0.35 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">How it works</p>
          <h2 className="mt-3 font-display text-3xl text-zinc-100 sm:text-5xl">From request to execution in seconds.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              { label: '01', title: 'Understand', text: 'Parses your intent, urgency, and schedule context.' },
              { label: '02', title: 'Check Signals', text: 'Queries transit, weather, availability, and budget signals.' },
              { label: '03', title: 'Take Action', text: 'Calls tools to search, book, request, or create tasks.' },
              { label: '04', title: 'Report Back', text: 'Streams reasoning, actions, and outcome cards in real time.' },
            ].map((step, idx) => (
              <motion.div
                key={step.label}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.5 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
              >
                <span className="font-mono text-xs text-amber-300">{step.label}</span>
                <h3 className="mt-2 text-lg font-semibold text-zinc-100">{step.title}</h3>
                <p className="mt-2 text-sm text-zinc-300">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section id="signals" className="relative mx-auto flex min-h-[100dvh] w-full max-w-6xl snap-start items-center px-6 py-8 md:px-10">
        <motion.div
          className="grid w-full gap-10 md:grid-cols-[1fr_1fr]"
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ amount: 0.4 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">Signal mesh</p>
            <h2 className="mt-3 font-display text-3xl text-zinc-100 sm:text-5xl">Connected to every decision surface.</h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-zinc-300">
              Gotham Valet combines real-time search, transit feeds, weather APIs, service integrations, and Blaxel background jobs to keep recommendations and card statuses grounded in current conditions.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {['Anthropic', 'MTA', 'Citi Bike', 'OpenWeather', 'Ticketmaster', 'Google Places', 'Tavily', 'DoorDash', 'Plaid', 'Blaxel', 'Resy', 'OpenTable', 'Calendar'].map((item, idx) => (
              <motion.div
                key={item}
                className="flex h-20 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] text-center text-sm text-zinc-200"
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ amount: 0.45 }}
                transition={{ delay: idx * 0.04, duration: 0.35 }}
              >
                {item}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section id="cta" className="relative mx-auto flex min-h-[100dvh] w-full max-w-6xl snap-start items-center px-6 py-8 md:px-10">
        <motion.div
          className="w-full rounded-3xl border border-emerald-300/25 bg-gradient-to-br from-emerald-300/15 via-white/5 to-cyan-300/10 p-8 text-center backdrop-blur md:p-12"
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ amount: 0.45 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-300">Ready to launch</p>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-3xl text-zinc-100 sm:text-5xl">
            Enter the control room and run your NYC day with one assistant.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-zinc-200/90 sm:text-base">
            Chat with Gotham Valet and watch every tool action stream live across transit, rides, food, events, and planning.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-xl border border-emerald-300/50 bg-emerald-300 px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-emerald-200"
            >
              Open the web app
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="mt-5 flex justify-center">
            <a
              href="#hero"
              className="inline-flex items-center gap-2 text-xs text-zinc-300 underline decoration-zinc-500/70 underline-offset-4 transition hover:text-zinc-100"
            >
              Back to top
              <Search className="h-3.5 w-3.5" />
            </a>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
