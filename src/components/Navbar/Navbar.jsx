import React, { useEffect, useState } from 'react';
import {
    Bookmark,
    Compass,
    Home,
    PanelLeftClose,
    PanelLeftOpen,
    Search,
    Sparkles,
    Trophy,
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAppContext } from '../../context/AppContext';
import DarkMode from '../DarkMode/DarkMode';

const primaryNav = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/genres', label: 'Explore', icon: Compass },
    { to: '/top-grossing', label: 'Top 50', icon: Trophy },
    { to: '/profile', label: 'Watchlist', icon: Bookmark, showCount: true },
];

const bottomTabs = primaryNav;
const SIDEBAR_STATE_KEY = 'streamify-sidebar-compact';

const navClassName = ({ isActive }, isCompact) => {
    const baseClassName = `group relative flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition duration-300 ${isCompact ? 'justify-center gap-0' : 'gap-3'}`;
    return isActive
        ? `${baseClassName} bg-accent text-white shadow-glow`
        : `${baseClassName} text-slate-600 hover:bg-slate-950/5 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white`;
};

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { watchlistCount } = useAppContext();
    const [query, setQuery] = useState('');
    const [isSidebarCompact, setIsSidebarCompact] = useState(false);

    useEffect(() => {
        const savedState = window.localStorage.getItem(SIDEBAR_STATE_KEY);
        setIsSidebarCompact(savedState === 'true');
    }, []);

    useEffect(() => {
        const currentQuery = new URLSearchParams(location.search).get('q') || '';
        setQuery(currentQuery);
    }, [location.pathname, location.search]);

    useEffect(() => {
        window.localStorage.setItem(SIDEBAR_STATE_KEY, String(isSidebarCompact));
    }, [isSidebarCompact]);

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!query.trim()) {
            navigate('/search');
            return;
        }

        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    };

    return (
        <div className="min-h-screen bg-transparent">
            <aside className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/10 bg-white/70 px-4 py-8 backdrop-blur-2xl transition-[width,padding] duration-300 dark:bg-black/30 xl:flex ${isSidebarCompact ? 'w-24' : 'w-72 px-6'}`}>
                <button
                    type="button"
                    onClick={() => navigate('/')}
                    className={`flex items-center text-left ${isSidebarCompact ? 'justify-center gap-0' : 'gap-3'}`}
                >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-fuchsia-400 text-lg font-bold text-white shadow-glow">S</span>
                    <span className={isSidebarCompact ? 'hidden' : 'block'}>
                        <span className="block text-xs font-semibold uppercase tracking-[0.35em] text-accent">Streamify</span>
                        <span className="block text-lg font-semibold text-slate-950 dark:text-white">Cinema for every screen</span>
                    </span>
                </button>

                {isSidebarCompact ? (
                    <button
                        type="button"
                        onClick={() => navigate('/search')}
                        className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/5 text-slate-700 transition hover:bg-slate-950/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                        aria-label="Open search"
                    >
                        <Search className="h-4 w-4" />
                    </button>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/5 p-1 dark:bg-white/5">
                        <div className="flex items-center gap-3 rounded-[14px] px-3 py-2">
                            <Search className="h-4 w-4 text-slate-400" />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search movies, genres, years"
                                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                            />
                        </div>
                    </form>
                )}

                <nav className="mt-8 space-y-2">
                    {primaryNav.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink key={item.to} to={item.to} className={(state) => navClassName(state, isSidebarCompact)} title={isSidebarCompact ? item.label : undefined}>
                                <Icon className="h-4 w-4" />
                                {!isSidebarCompact && (
                                    <span className="flex min-w-0 items-center gap-2">
                                        <span className="truncate">{item.label}</span>
                                        {item.showCount && watchlistCount > 0 && <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-white">{watchlistCount}</span>}
                                    </span>
                                )}
                                {isSidebarCompact && item.showCount && watchlistCount > 0 && (
                                    <span className="absolute right-2 top-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
                                        {watchlistCount}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <button
                    type="button"
                    onClick={() => setIsSidebarCompact((currentState) => !currentState)}
                    className="absolute -right-3 top-1/2 hidden h-16 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-950 text-white shadow-xl transition hover:bg-accent xl:flex"
                    aria-label={isSidebarCompact ? 'Expand navbar' : 'Collapse navbar'}
                >
                    {isSidebarCompact ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
                </button>

                <div className={`mt-auto rounded-[24px] border border-white/10 bg-slate-950/90 text-white shadow-glow dark:bg-white/5 ${isSidebarCompact ? 'space-y-3 p-3' : 'space-y-4 p-5'}`}>
                    <div className={`flex items-center text-xs font-semibold uppercase tracking-[0.3em] text-accentSoft ${isSidebarCompact ? 'justify-center gap-0' : 'gap-2'}`}>
                        <Sparkles className="h-4 w-4" />
                        {!isSidebarCompact && 'Streamify Plus'}
                    </div>
                    {!isSidebarCompact && <p className="text-sm text-white/70">Save titles, jump into trailers, and move across the app with a single responsive shell.</p>}
                    <DarkMode compact={isSidebarCompact} />
                </div>
            </aside>

            <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-white/75 backdrop-blur-2xl dark:bg-black/35 xl:hidden">
                <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
                    <button type="button" onClick={() => navigate('/')} className="text-left">
                        <span className="block text-lg font-semibold tracking-[0.18em] text-slate-950 dark:text-white">STREAMIFY</span>
                    </button>

                    <form onSubmit={handleSubmit} className="ml-auto hidden min-w-0 flex-1 md:block">
                        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/5 px-4 py-3 dark:bg-white/5">
                            <Search className="h-4 w-4 text-slate-400" />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search for anything"
                                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                            />
                        </div>
                    </form>

                    <div className="ml-auto">
                        <DarkMode iconOnly />
                    </div>
                </div>

                <div className="mx-auto hidden max-w-7xl items-center gap-2 px-4 pb-4 sm:px-6 lg:flex lg:px-8 xl:hidden">
                    {primaryNav.map((item) => (
                        <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive
                            ? 'rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-glow'
                            : 'rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-950/5 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'}>
                            <span className="inline-flex items-center gap-2">
                                <span>{item.label}</span>
                                {item.showCount && watchlistCount > 0 && <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-current dark:bg-white/10">{watchlistCount}</span>}
                            </span>
                        </NavLink>
                    ))}
                </div>
            </header>

            <main className={`pb-28 pt-24 md:pt-32 xl:pb-10 xl:pt-8 ${isSidebarCompact ? 'xl:pl-24' : 'xl:pl-72'}`}>
                <div className="animate-fade-up">
                    <Outlet />
                </div>
            </main>

            <nav className="fixed inset-x-0 bottom-3 z-40 mx-auto flex h-16 w-[calc(100vw_-_1rem)] max-w-lg items-center justify-between rounded-[28px] border border-white/10 bg-slate-950/90 px-2 py-2 text-white shadow-2xl backdrop-blur-2xl md:hidden">
                {bottomTabs.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => isActive
                                ? 'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl bg-accent px-2 py-2 text-[10px] font-semibold shadow-glow'
                                : 'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-medium text-white/65 transition hover:bg-white/10 hover:text-white'}
                        >
                            <span className="relative inline-flex">
                                <Icon className="h-4 w-4" />
                                {item.showCount && watchlistCount > 0 && (
                                    <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-white px-1 text-[9px] font-bold text-slate-950">
                                        {watchlistCount}
                                    </span>
                                )}
                            </span>
                            {item.label}
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
};

export default Navbar;