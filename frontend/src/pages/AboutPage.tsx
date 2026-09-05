import React from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  MapPin,
  Mail,
  Phone,
  Award,
  FileCheck2,
  ArrowRight,
  Leaf,
  Globe2,
} from 'lucide-react';
import { NavigationPage } from '../components/Navbar';

interface AboutPageProps {
  onNavigate: (page: NavigationPage) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Page Hero */}
      <div className="border-b border-slate-200 pb-10 space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          COMPANY OVERVIEW &amp; REGULATORY COMPLIANCE
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Pioneering Zero-Violation Environmental Logistics
        </h1>
        <p className="text-slate-600 text-lg leading-relaxed">
          HazardHub AI is an environmental technology company dedicated to solving the high costs, logistical inefficiencies, and severe regulatory risks of decentralized hazardous waste management.
        </p>
      </div>

      {/* Mission & Purpose */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Deterministic Primacy</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            We believe hazardous materials can never be governed by probabilistic guesses. Our platform enforces mathematically rigorous, rule-based segregation matrices that guarantee zero chemical incompatibility violations.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <Leaf className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Regional Decarbonization</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            By pooling waste runs among geographically adjacent biotechnology and research laboratories, we eliminate empty truck miles, cutting diesel transport emissions by over 54% per pickup corridor.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <Globe2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Offline Resilience</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Chemical loading bays and industrial containment bunkers frequently lose internet connectivity. Our local-first cryptographic QR architecture ensures full regulatory compliance anywhere on Earth.
          </p>
        </div>
      </div>

      {/* Compliance Frameworks */}
      <div className="bg-slate-900 rounded-2xl p-8 sm:p-10 text-white space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Authoritative Regulatory Alignment
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Built for EPA, DOT, and RCRA Federal Audits
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
          <div className="p-4 rounded-lg bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="font-bold text-teal-300 text-sm">EPA 40 CFR Part 264 Appendix V</div>
            <p className="leading-relaxed">
              Enforces strict segregation for potentially incompatible waste groups: Group 1-A (Acids) vs Group 1-B (Alkalines), Group 2-A (Oxidizers) vs Group 2-B (Flammables), and Group 3-A (Water-reactives).
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="font-bold text-teal-300 text-sm">DOT 49 CFR § 177.848 Hazmat Segregation Table</div>
            <p className="leading-relaxed">
              Requires physical bulkheads or separate transport units when transporting Class 3 (Flammable liquids) alongside Division 5.1 (Oxidizers) or Division 4.2 (Spontaneously combustible materials).
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="font-bold text-teal-300 text-sm">Hazardous Waste Electronic Manifest Act (e-Manifest)</div>
            <p className="leading-relaxed">
              Provides direct cryptographic electronic manifests adhering to the EPA’s national RCRAInfo database for cradle-to-grave tracking from generator to TSDF disposal facility.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="font-bold text-teal-300 text-sm">OSHA 29 CFR 1910.120 (HAZWOPER)</div>
            <p className="leading-relaxed">
              Operational parameters and pre-load safety checklists adhere strictly to workplace safety mandates for hazardous waste operations and emergency response personnel.
            </p>
          </div>
        </div>
      </div>

      {/* Leadership & Advisory Board */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
            EHS &amp; Chemical Engineering Advisory
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Engineered by Environmental Scientists and Systems Architects
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <div className="font-bold text-base text-slate-900">Dr. Helena Vance, PhD</div>
            <div className="text-xs font-semibold text-teal-800">Chief Scientific Officer</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Former EPA Region 10 Senior Chemical Reviewer with 18 years specializing in exothermic reaction kinetics and industrial effluent modeling.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <div className="font-bold text-base text-slate-900">Marcus Thorne, PE</div>
            <div className="text-xs font-semibold text-teal-800">VP of Logistics Operations</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Certified Hazardous Materials Manager (CHMM) and former fleet director overseeing 400+ DOT-certified hazmat transport tankers across the West Coast.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <div className="font-bold text-base text-slate-900">Siddharth Nair</div>
            <div className="text-xs font-semibold text-teal-800">Lead Systems Architect</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pioneer in local-first distributed cryptographic systems and deterministic scheduling algorithms for mission-critical infrastructure.
            </p>
          </div>
        </div>
      </div>

      {/* Regional Office & Operations Center */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">HazardHub AI Pacific Operations Center</h3>
          <div className="text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>4200 BioCorridor Way, Suite 800, Seattle, WA 98109</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>ehs-operations@hazardhub.internal</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>Emergency 24/7 Dispatch Hotline: (206) 555-0199</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('pooling')}
          className="px-6 py-3 rounded-md bg-teal-700 text-white font-bold text-xs hover:bg-teal-800 transition-colors shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <span>Enter Active Operations</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
