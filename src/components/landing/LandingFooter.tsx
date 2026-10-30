'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { MagneticButton } from '@/components/ui/MagneticButton';

export function LandingFooter() {
  return (
    <footer className="bg-canvas border-t border-white/[0.08] relative overflow-hidden">
      {/* Top CTA Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl border border-brand-orange/30 bg-gradient-to-r from-surface via-surface to-brand-navy/60 p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="font-mono text-xs font-bold text-brand-orange uppercase tracking-wider">
              READY FOR COMMERCIAL HIGHWAYS
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">
              Bring Intelligent Mission Control to Your Fleet Operations
            </h3>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              Experience unified dispatching, real-time telemetry, driver safety monitoring, and automated compliance in one purpose-built platform.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link href="/login">
                <MagneticButton
                  variant="primary"
                  size="md"
                  className="gap-2 shadow-glow-orange/50 text-xs font-bold"
                >
                  <span>Launch Live Mission Control</span>
                  <ArrowRight className="w-4 h-4" />
                </MagneticButton>
              </Link>
              <Link
                href="/login"
                className="text-xs font-semibold text-text-secondary hover:text-white px-4 py-2.5 rounded-lg border border-white/[0.08] bg-surface-muted hover:bg-surface transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/[0.06] grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand info */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-orange/30 bg-surface shadow-sm">
              <img
                src="/logo-dark.png"
                alt="TruckSaathi"
                className="w-6 h-6 object-contain filter brightness-125"
              />
            </div>
            <span className="font-mono text-xl font-black tracking-tight text-text-primary">
              TRUCK<span className="text-brand-orange">SAATHI</span>
            </span>
          </div>
          <p className="text-xs text-text-secondary max-w-sm leading-relaxed">
            Enterprise fleet dispatching, telemetry monitoring, driver safety, and trip accounting designed for commercial freight operations across India.
          </p>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>National Logistics Operational Standard</span>
          </div>
        </div>

        {/* Platform Links */}
        <div className="space-y-3">
          <h4 className="font-mono text-xs font-bold text-text-primary uppercase tracking-wider">
            Platform
          </h4>
          <ul className="space-y-2 text-xs text-text-secondary">
            <li><a href="#overview" className="hover:text-white transition-colors">Overview</a></li>
            <li><a href="#stats" className="hover:text-white transition-colors">Freight Data</a></li>
            <li><a href="#workflow" className="hover:text-white transition-colors">How It Works</a></li>
            <li><a href="#features" className="hover:text-white transition-colors">Capabilities</a></li>
            <li><a href="#roles" className="hover:text-white transition-colors">Stakeholder Roles</a></li>
          </ul>
        </div>

        {/* Operational Modules */}
        <div className="space-y-3">
          <h4 className="font-mono text-xs font-bold text-text-primary uppercase tracking-wider">
            Control Center
          </h4>
          <ul className="space-y-2 text-xs text-text-secondary">
            <li><Link href="/login" className="hover:text-white transition-colors">Live Highway Fleet Map</Link></li>
            <li><Link href="/login" className="hover:text-white transition-colors">Intelligent Dispatch</Link></li>
            <li><Link href="/login" className="hover:text-white transition-colors">Driver Safety Monitoring</Link></li>
            <li><Link href="/login" className="hover:text-white transition-colors">Fuel Theft Radar</Link></li>
            <li><Link href="/login" className="hover:text-white transition-colors">E-Way Bill Compliance</Link></li>
          </ul>
        </div>

      </div>

      {/* Honest Prototype Disclaimer Bar */}
      <div className="bg-surface/80 border-t border-white/[0.08] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-text-muted">
          <div>
            © 2026 TruckSaathi Logistics Technologies. All rights reserved.
          </div>
          
          {/* Exact required honest disclaimer */}
          <div className="font-mono font-bold text-amber-400/90 bg-amber-400/10 px-3 py-1 rounded border border-amber-400/20">
            Prototype. Figures shown are demonstration data.
          </div>

          <div className="flex items-center gap-1 text-text-muted">
            <span>Built for Indian Night Highways</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

