import { Head, Link } from '@inertiajs/react';
import { BookOpen, ArrowRight, Package, Users, BarChart2, TrendingUp } from 'lucide-react';

export default function Welcome({ auth }) {
    return (
        <div className="min-h-screen bg-[#060504] text-white overflow-hidden relative flex flex-col select-none">
            <Head title="BookFlow POS" />

            {/* ── Bookshelf background image ── */}
            <div
                className="fixed inset-0 pointer-events-none"
                aria-hidden
                style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&q=80)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(4px) brightness(0.18) saturate(0.7)',
                    transform: 'scale(1.06)',
                }}
            />

            {/* ── Warm amber vignette overlay ── */}
            <div
                className="fixed inset-0 pointer-events-none"
                aria-hidden
                style={{
                    background: 'radial-gradient(ellipse at 50% 40%, rgba(245,158,11,0.08) 0%, rgba(6,5,4,0.55) 65%, rgba(6,5,4,0.85) 100%)',
                }}
            />

            {/* ── Floating mini-cards ── */}
            {/* Top-left widget */}
            <div className="fixed top-24 left-[12%] pointer-events-none hidden xl:block z-0 animate-[float_6s_ease-in-out_infinite]">
                <div className="px-4 py-3 rounded-xl border border-white/6 bg-white/[0.03] backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] text-white/30 uppercase tracking-widest">Weekly Revenue</span>
                    </div>
                    <div className="text-base font-black text-white">$8,240</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">↑ 14% vs last week</div>
                </div>
            </div>

            {/* Bottom-right widget */}
            <div className="fixed bottom-32 right-[11%] pointer-events-none hidden xl:block z-0 animate-[float_7s_ease-in-out_1.5s_infinite]">
                <div className="px-4 py-3 rounded-xl border border-white/6 bg-white/[0.03] backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Package className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[10px] text-white/30 uppercase tracking-widest">Top Title</span>
                    </div>
                    <div className="text-sm font-bold text-white/80">The Midnight Library</div>
                    <div className="text-[10px] text-white/30 mt-0.5">241 copies sold</div>
                </div>
            </div>

            {/* ── Main content ── */}
            <main className="relative z-10 flex flex-col flex-1 items-center justify-center text-center px-6 py-24">

                {/* Logo */}
                <div className="flex items-center gap-2.5 mb-14">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                            boxShadow: '0 8px 24px rgba(245,158,11,0.35)',
                        }}
                    >
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white/90">BookFlow POS</span>
                </div>

                {/* Status badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/8 bg-white/[0.025] mb-10">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
                    </span>
                    <span className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.15em]">System online</span>
                </div>

                {/* Headline */}
                <h1 className="text-[clamp(3rem,9vw,7rem)] font-black tracking-tighter leading-[0.88] mb-7 max-w-4xl">
                    <span className="text-white/90">Every sale.</span>
                    <br />
                    <span className="text-white/90">Every book.</span>
                    <br />
                    <span
                        className="text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(90deg, #fbbf24 0%, #f97316 60%, #fb923c 100%)' }}
                    >
                        One screen.
                    </span>
                </h1>

                {/* Subline */}
                <p className="text-base md:text-lg text-white/30 max-w-sm leading-relaxed mb-14">
                    Point-of-sale built for independent bookshops. Sales, inventory, customers — focused and fast.
                </p>

                {/* ── THE Login button ── */}
                {auth.user ? (
                    <Link
                        href={route('dashboard')}
                        className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-lg text-white cursor-pointer transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-[#060504]"
                        style={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                            boxShadow: '0 20px 60px rgba(245,158,11,0.28), 0 4px 16px rgba(234,88,12,0.2)',
                        }}
                    >
                        <span>Go to Dashboard</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                ) : (
                    <Link
                        href={route('login')}
                        className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-lg text-white cursor-pointer transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-[#060504]"
                        style={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                            boxShadow: '0 20px 60px rgba(245,158,11,0.28), 0 4px 16px rgba(234,88,12,0.2)',
                        }}
                    >
                        <span>Login</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                )}

                <p className="mt-5 text-[11px] text-white/15 tracking-wide">Secure access · Your data stays yours</p>

                {/* Stats row */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-20">
                    {[
                        { icon: Package, value: '9,842', label: 'Books tracked' },
                        { icon: Users, value: '1,284', label: 'Members' },
                        { icon: BarChart2, value: '124', label: 'Sales today' },
                    ].map(({ icon: Icon, value, label }, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 px-5 py-3 rounded-xl border border-white/6 bg-white/[0.025]"
                        >
                            <Icon className="w-4 h-4 text-amber-400/70 shrink-0" />
                            <div className="text-left">
                                <div className="text-base font-black text-white/80">{value}</div>
                                <div className="text-[10px] text-white/25 uppercase tracking-widest">{label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* ── Footer line ── */}
            <footer className="relative z-10 text-center pb-8">
                <p className="text-[11px] text-white/10 tracking-widest">© 2026 BookFlow POS · All rights reserved</p>
            </footer>

            {/* Float keyframe */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
}
