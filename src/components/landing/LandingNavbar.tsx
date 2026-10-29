'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Menu, X, Sparkles } from 'lucide-react';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { useMotionSafe } from '@/lib/motion';

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { safe } = useMotionSafe();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Overview', href: '#overview' },
    { label: 'Freight Reality', href: '#stats' },
    { label: 'Workflow', href: '#workflow' },
    { label: 'Capabilities', href: '#features' },
    { label: 'Roles', href: '#roles' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-canvas/80 backdrop-blur-md border-b border-white/[0.08] shadow-2xl py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-brand-orange/30 bg-surface shadow-glow-orange/20 overflow-hidden group-hover:border-brand-orange transition-colors">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-orange/20 to-transparent" />
            <img
              src="/logo-dark.png"
              alt="TruckSaathi"
              className="w-7 h-7 object-contain relative z-10 filter brightness-125"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-xl font-black tracking-tight text-text-primary group-hover:text-white transition-colors">
              TRUCK<span className="text-brand-orange">SAATHI</span>
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-text-muted -mt-0.5">
              Mission Control OS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-white/[0.08] bg-surface/60 backdrop-blur-md px-4 py-1.5 shadow-inner">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-medium text-text-secondary hover:text-white px-3 py-1 rounded-full transition-colors hover:bg-white/[0.04]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-semibold text-text-secondary hover:text-white transition-colors px-3 py-2"
          >
            Sign In
          </Link>
          <Link href="/login">
            <MagneticButton
              variant="primary"
              size="sm"
              className="gap-2 shadow-glow-orange/40 text-xs font-bold"
            >
              <span>Launch Mission Control</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </MagneticButton>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center justify-center p-2 rounded-lg text-text-secondary hover:text-white hover:bg-surface border border-white/[0.06]"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={safe({ opacity: 0, y: -10 })}
            animate={{ opacity: 1, y: 0 }}
            exit={safe({ opacity: 0, y: -10 })}
            className="md:hidden border-b border-white/[0.08] bg-surface/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3"
          >
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-text-secondary hover:text-white px-3 py-2 rounded-lg hover:bg-white/[0.04]"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg border border-white/[0.08] bg-surface-muted text-xs font-semibold text-text-primary"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg bg-brand-orange text-xs font-bold text-white shadow-glow-orange/40"
              >
                Launch Mission Control
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
