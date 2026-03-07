'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function SaaSNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    // Track window width to handle responsive styles via JS if needed, or we just rely on media queries,
    // but React inline styles don't support media queries.
    // So we'll track mobile vs desktop via JS.
    const [isDesktop, setIsDesktop] = useState(true);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        handleResize(); // Init
        window.addEventListener('resize', handleResize);

        const onScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    const links = [
        { label: 'Fitur', href: '#features' },
        { label: 'Harga Modal', href: '#pricing-base' },
        { label: 'Paket Usaha', href: '#pricing-plans' },
        { label: 'Testimoni', href: '#testimonials' },
    ];

    return (
        <>
            <header
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 999,
                    transition: 'all 0.5s',
                    background: isScrolled ? 'rgba(7, 7, 17, 0.9)' : 'transparent',
                    backdropFilter: isScrolled ? 'blur(16px)' : 'none',
                    WebkitBackdropFilter: isScrolled ? 'blur(16px)' : 'none',
                    borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid transparent',
                    boxShadow: isScrolled ? '0 10px 40px rgba(0,0,0,0.4)' : 'none'
                }}
            >
                <div style={{
                    maxWidth: 1280,
                    margin: '0 auto',
                    padding: '0 24px',
                    height: 72,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 24
                }}>
                    {/* Logo */}
                    <Link href="/reseller" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ height: 36, width: 36, borderRadius: 12, background: 'linear-gradient(135deg, #f5c842, #e07000)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(245,200,66,0.45)' }}>
                                <span style={{ fontWeight: 900, color: '#070711', fontSize: 16, letterSpacing: '-0.05em' }}>S</span>
                            </div>
                        </div>
                        <span style={{ fontWeight: 900, color: '#ffffff', fontSize: 20, letterSpacing: '-0.02em' }}>
                            SAM<span style={{ color: '#f5c842' }}>SaaS</span>
                        </span>
                    </Link>

                    {/* Desktop Links */}
                    {isDesktop && (
                        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                            {links.map(l => (
                                <Link
                                    key={l.label}
                                    href={l.href}
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: '#a1a1aa',
                                        textDecoration: 'none',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
                                    onMouseOut={(e) => e.currentTarget.style.color = '#a1a1aa'}
                                >
                                    {l.label}
                                </Link>
                            ))}
                        </nav>
                    )}

                    {/* CTA */}
                    {isDesktop && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <Link
                                href="/login"
                                style={{ fontSize: 14, fontWeight: 600, color: '#a1a1aa', textDecoration: 'none' }}
                                onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
                                onMouseOut={(e) => e.currentTarget.style.color = '#a1a1aa'}
                            >
                                Masuk
                            </Link>
                            <Link
                                href="/reseller/register"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '10px 20px',
                                    borderRadius: 999,
                                    background: '#f5c842',
                                    color: '#070711',
                                    fontSize: 14,
                                    fontWeight: 900,
                                    textDecoration: 'none',
                                    boxShadow: '0 0 20px rgba(245,200,66,0.35)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Daftar Gratis →
                            </Link>
                        </div>
                    )}

                    {/* Mobile toggle */}
                    {!isDesktop && (
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: 6 }}
                        >
                            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    )}
                </div>
            </header>

            {/* Mobile Menu */}
            <div
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 998,
                    background: 'rgba(7, 7, 17, 0.98)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 40,
                    opacity: (!isDesktop && mobileOpen) ? 1 : 0,
                    pointerEvents: (!isDesktop && mobileOpen) ? 'auto' : 'none',
                    transition: 'all 0.3s'
                }}
            >
                {links.map(l => (
                    <Link
                        key={l.label}
                        href={l.href}
                        onClick={() => setMobileOpen(false)}
                        style={{ fontSize: 30, fontWeight: 900, color: '#d4d4d8', textDecoration: 'none' }}
                    >
                        {l.label}
                    </Link>
                ))}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 16, width: 256 }}>
                    <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        style={{ width: '100%', textAlign: 'center', padding: '16px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', fontWeight: 700, fontSize: 18, textDecoration: 'none' }}
                    >
                        Masuk
                    </Link>
                    <Link
                        href="/reseller/register"
                        onClick={() => setMobileOpen(false)}
                        style={{ width: '100%', textAlign: 'center', padding: '16px', borderRadius: 16, background: '#f5c842', color: '#070711', fontWeight: 900, fontSize: 18, textDecoration: 'none', boxShadow: '0 0 25px rgba(245,200,66,0.4)' }}
                    >
                        Daftar Gratis
                    </Link>
                </div>
            </div>
        </>
    );
}
