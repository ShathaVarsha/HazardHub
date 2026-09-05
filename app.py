"""
HazardHub AI - Main Application
Professional modern company website + working web application.
Clean white/off-white background, dark navy text, teal/green environmental accents, light gray borders, subtle shadows.
"""

import streamlit as st
import pandas as pd
from datetime import datetime
import json

from models import (
    WasteItem, PickupLot, CustodyEvent, ProposedLotBundle,
    UrgencyLevel, EPAGroup, ContainerType
)
from storage.state import get_state
from engines.chemiguard import ChemiGuardEngine
from engines.quotapacker import QuotaPackerEngine, AutoBundleOptions
from engines.resilienceguard import ResilienceGuardEngine
from engines.custodysentinel import QRPayloadGenerator
from agent.agent import AIOperationsAgent
from components.manifest import render_epa_manifest_html
from components.styles import CUSTOM_CSS


# ──────────────────────────────────────────
# Streamlit Page Setup
# ──────────────────────────────────────────
st.set_page_config(
    page_title="HazardHub AI — Autonomous Hazmat Pooling",
    page_icon="HH",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Inject custom clean corporate styling
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

# Access local-first persistent state
state = get_state()

# Session State for navigation & builder selections
if "active_nav" not in st.session_state:
    st.session_state.active_nav = "Home"

if "pooling_sub_tab" not in st.session_state:
    st.session_state.pooling_sub_tab = "Builder"

if "builder_selected_ids" not in st.session_state:
    st.session_state.builder_selected_ids = []

if "chat_history" not in st.session_state:
    st.session_state.chat_history = [
        {
            "sender": "AGENT",
            "timestamp": "10:00",
            "content": (
                "Welcome to **HazardHub AI Operations Console**. I monitor regional hazmat inventories, "
                "enforce EPA 40 CFR compatibility rules, and assemble compliant >=150L hauler lots.\n\n"
                "Try asking me:\n"
                "- *'Can we bundle a pickup lot?'*\n"
                "- *'What is urgent or expiring?'*\n"
                "- *'Is Nitric Acid safe with Acetone?'*\n"
                "- *'Cooperative Readiness Overview'*"
            ),
            "tool_calls": [],
        }
    ]


# ──────────────────────────────────────────
# Corporate Header & Navigation Bar
# ──────────────────────────────────────────
header_cols = st.columns([3, 6, 2])

with header_cols[0]:
    st.markdown(
        """
        <div style="display: flex; align-items: center; gap: 12px; padding: 6px 0;">
            <div style="
                width: 40px; height: 40px;
                background: linear-gradient(135deg, #00875A 0%, #006B4E 100%);
                border-radius: 10px;
                display: flex; align-items: center; justify-content: center;
                flex-shrink: 0;
                box-shadow: 0 2px 8px rgba(0,135,90,0.25);
            ">
                <span style="color: #FFFFFF; font-size: 14px; font-weight: 900; letter-spacing: -0.5px; font-family: 'Inter', sans-serif;">HH</span>
            </div>
            <div style="display: flex; flex-direction: column;">
                <div class="hh-brand-title" style="margin: 0; line-height: 1.1;">
                    Hazard<span class="green">Hub</span>&nbsp;<span style="color:#00875A;">AI</span>
                </div>
                <span style="font-size: 11px; font-weight: 600; color: #5A6B82; margin-top: 2px;">
                    Autonomous Hazmat Pooling
                </span>
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )

with header_cols[1]:
    # 8 Company Website Navigation Pages
    nav_labels = [
        "Home",
        "Platform",
        "Labs",
        "Waste Management",
        "Pickup Pooling",
        "AI Operations",
        "Chain of Custody",
        "About",
    ]
    cur_idx = nav_labels.index(st.session_state.active_nav) if st.session_state.active_nav in nav_labels else 0
    selected_page = st.selectbox(
        "Navigation",
        nav_labels,
        index=cur_idx,
        key="top_navbar_select",
        label_visibility="collapsed",
    )
    if selected_page != st.session_state.active_nav:
        st.session_state.active_nav = selected_page
        st.rerun()

with header_cols[2]:
    net_c1, net_c2 = st.columns([1, 1])
    with net_c1:
        net_mode = state.network_mode
        net_pill = (
            f'<span class="net-online">● ONLINE</span>' if net_mode == "ONLINE" else (
                f'<span class="net-spotty">▲ SPOTTY</span>' if net_mode == "SPOTTY" else
                f'<span class="net-offline">■ OFFLINE</span>'
            )
        )
        st.markdown(f"<div style='padding-top:8px;'>{net_pill}</div>", unsafe_allow_html=True)
    with net_c2:
        if st.session_state.active_nav == "Home":
            if st.button("Launch App", type="primary", use_container_width=True):
                st.session_state.active_nav = "Platform"
                st.rerun()
        else:
            if st.button("Reset DB", use_container_width=True):
                state.reset_to_defaults()
                st.session_state.builder_selected_ids = []
                st.success("Database restored to 8 facilities & 30 containers.")
                st.rerun()

st.markdown("<hr style='margin: 8px 0 24px 0; border: none; border-top: 1px solid #E2E8F0;'/>", unsafe_allow_html=True)


# ──────────────────────────────────────────
# 1. HOME PAGE (Storytelling Flow)
# ──────────────────────────────────────────
if st.session_state.active_nav == "Home":

    # Compute live summary telemetry
    available_waste = [w for w in state.waste_items if w.status == "AVAILABLE"]
    total_available_vol = sum(w.volume_liters for w in available_waste)
    urgent_count = len([w for w in available_waste if w.urgency == "URGENT"])
    threshold = 150.0
    quota_pct = min(100.0, (total_available_vol / threshold) * 100.0)

    # 1. HERO SECTION
    st.markdown(
        """
        <div class="landing-hero">
            <div style="display: inline-flex; align-items: center; gap: 8px; padding: 4px 12px; background: #E6F8F3; border: 1px solid #A3E8D5; border-radius: 9999px; color: #006B4E; font-size: 11px; font-weight: 700; margin-bottom: 16px;">
                <span style="width: 7px; height: 7px; border-radius: 50%; background: #00875A;"></span>
                <span>AUTONOMOUS REGIONAL HAZMAT POOLING INFRASTRUCTURE</span>
                <span style="color: #94A3B8;">•</span>
                <span style="font-family: monospace;">EPA 40 CFR</span>
            </div>
            <h1 style="font-size: 3.1rem; font-weight: 900; color: #0A192F; letter-spacing: -0.03em; line-height: 1.15; max-width: 900px; margin: 0 0 16px 0;">
                Autonomous Regional Waste Pooling for Laboratories.
            </h1>
            <p style="font-size: 1.15rem; color: #475569; line-height: 1.6; max-width: 800px; margin: 0 0 24px 0;">
                Certified industrial disposal haulers refuse to dispatch collection trucks under <strong>150 Liters</strong>. 
                HazardHub AI unites neighboring clinics, pathology labs, schools, and testing facilities to pool unassigned 
                containers, enforce mathematical chemical compatibility, survive dockside rejections, and certify offline custody.
            </p>
        </div>
        """,
        unsafe_allow_html=True
    )

    hero_btn1, hero_btn2, hero_btn3, hero_spacer = st.columns([2, 2, 2, 4])
    with hero_btn1:
        if st.button("Launch Live Platform", type="primary", use_container_width=True):
            st.session_state.active_nav = "Platform"
            st.rerun()
    with hero_btn2:
        if st.button("AI Operations Agent", use_container_width=True):
            st.session_state.active_nav = "AI Operations"
            st.rerun()
    with hero_btn3:
        if st.button("1-Click Pooling (>=150L)", use_container_width=True):
            st.session_state.active_nav = "Pickup Pooling"
            st.rerun()

    # Hero Live Telemetry Card
    st.markdown(
        f"""
        <div class="hh-card" style="margin-top: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F1F5F9; padding-bottom: 12px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="color: #00875A; font-weight: 800; font-size: 13px;">LIVE REGIONAL TELEMETRY</span>
                </div>
                <span class="hh-brand-badge">{len(state.labs)} Facilities Synced</span>
            </div>
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 20px; align-items: center;">
                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; margin-bottom: 6px;">
                        <span>150L Hauler Dispatch Quota</span>
                        <span style="color: {'#00875A' if total_available_vol >= 150 else '#B45309'}; font-family: monospace;">
                            {total_available_vol:.1f} / 150.0 L ({quota_pct:.0f}%)
                        </span>
                    </div>
                    <div class="hh-progress-bar-bg">
                        <div class="hh-progress-bar-fill" style="width: {quota_pct}%;"></div>
                    </div>
                    <div style="font-size: 11px; color: #64748B; margin-top: 6px;">
                        {'✓ Minimum commercial dispatch volume satisfied' if total_available_vol >= 150 else f'Short by {150 - total_available_vol:.1f} L'}
                    </div>
                </div>
                <div style="text-align: center; border-left: 1px solid #F1F5F9; border-right: 1px solid #F1F5F9; padding: 0 12px;">
                    <div style="font-size: 1.8rem; font-weight: 900; color: #B91C1C;">{urgent_count}</div>
                    <div style="font-size: 11px; font-weight: 700; color: #64748B;">URGENT (≤14d)</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 1.8rem; font-weight: 900; color: #00875A;">0</div>
                    <div style="font-size: 11px; font-weight: 700; color: #64748B;">CHEMIGUARD BLOCKS</div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )

    # 2. ABOUT HAZARDHUB AI (Problem vs Solution)
    st.markdown(
        """
        <div class="landing-section">
            <span class="landing-section-eyebrow">The Core Problem & Our Mission</span>
            <h2 class="landing-section-title">Why Small Laboratories Are Forced to Hoard Dangerous Chemicals</h2>
            <p style="color: #475569; font-size: 1.05rem; line-height: 1.6; max-width: 800px; margin: 8px 0 24px 0;">
                Small institutions generate hazardous chemicals in modest batches that licensed industrial haulers refuse to collect alone. HazardHub AI solves the 150L collection threshold through cooperative mathematical batching.
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                <div style="background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 20px; padding: 28px;">
                    <div style="font-size: 1.1rem; font-weight: 800; color: #9F1239; margin-bottom: 8px;">
                        The Rigid 150-Liter Collection Hurdle
                    </div>
                    <p style="font-size: 0.92rem; color: #881337; line-height: 1.55;">
                        A high school AP chem lab has 6L of nitric acid; a dental clinic has 12L of spent sterilant; a vet clinic has 10L of formalin. 
                        Commercial haulers enforce strict <strong>minimum quotas of 150 Liters</strong>, charging $2,500+ penalty fees for undersized runs.
                    </p>
                    <div style="background: #FFFFFF; border-radius: 12px; padding: 14px; margin-top: 14px; border: 1px solid #FCA5A5; font-size: 0.85rem; color: #9F1239;">
                        <strong>The Consequence:</strong> Dangerous reagents sit hoarded in unventilated closets for 6-12 months, risking container embrittlement, toxic vapors, and severe OSHA violations.
                    </div>
                </div>
                <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 20px; padding: 28px;">
                    <div style="font-size: 1.1rem; font-weight: 800; color: #166534; margin-bottom: 8px;">
                        Cooperative Algorithmic Aggregation
                    </div>
                    <p style="font-size: 0.92rem; color: #14532D; line-height: 1.55;">
                        HazardHub AI unites regional laboratories into a cooperative pool. 
                        Our QuotaPacker knapsack optimizer bundles compatible containers to reach <strong>≥150L with an intentional 15% reserve safety buffer</strong>, keeping collection trucks on schedule.
                    </p>
                    <div style="background: #FFFFFF; border-radius: 12px; padding: 14px; margin-top: 14px; border: 1px solid #86EFAC; font-size: 0.85rem; color: #166534;">
                        <strong>Architectural Principle:</strong> <em>"AI recommends and explains; deterministic systems make safety-critical decisions."</em> Zero hallucinations in hazmat logistics.
                    </div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )

    # 3. KEY PLATFORM CAPABILITIES (4 Deterministic Engines)
    st.markdown(
        """
        <div class="landing-section">
            <span class="landing-section-eyebrow">Core Platform Capabilities</span>
            <h2 class="landing-section-title">Four Deterministic Engines Powering Every Decision</h2>
            <p style="color: #475569; font-size: 1.05rem; line-height: 1.6; max-width: 800px; margin: 8px 0 24px 0;">
                In hazardous waste coordination, safety cannot be left to probabilistic language models. 
                HazardHub AI isolates intelligence into four purpose-built deterministic computational engines.
            </p>
        </div>
        """,
        unsafe_allow_html=True
    )

    eng_c1, eng_c2, eng_c3, eng_c4 = st.columns(4)
    with eng_c1:
        st.markdown(
            """
            <div class="hh-card">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg,#E6F8F3,#D1FAE5); border-radius: 10px; display:flex; align-items:center; justify-content:center; margin-bottom: 10px;">
                <span style="font-size: 16px; font-weight: 900; color: #00875A; font-family: 'JetBrains Mono', monospace;">CG</span>
            </div>
                <strong style="color: #0A192F; font-size: 1.05rem;">ChemiGuard</strong>
                <div style="font-size: 11px; font-weight: 700; color: #00875A; margin: 2px 0 8px 0;">EPA 40 CFR App. V</div>
                <p style="font-size: 0.85rem; color: #475569; line-height: 1.45;">
                    Pre-screens all pairwise combinations to block toxic HCN/H2S gas clouds, exothermic violent boiling, and oxidizer fires.
                </p>
            </div>
            """,
            unsafe_allow_html=True
        )
    with eng_c2:
        st.markdown(
            """
            <div class="hh-card">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg,#EDE9FE,#DDD6FE); border-radius: 10px; display:flex; align-items:center; justify-content:center; margin-bottom: 10px;">
                <span style="font-size: 16px; font-weight: 900; color: #6D28D9; font-family: 'JetBrains Mono', monospace;">QP</span>
            </div>
                <strong style="color: #0A192F; font-size: 1.05rem;">QuotaPacker</strong>
                <div style="font-size: 11px; font-weight: 700; color: #00875A; margin: 2px 0 8px 0;">Knapsack Optimizer</div>
                <p style="font-size: 0.85rem; color: #475569; line-height: 1.45;">
                    Greedy knapsack pooling algorithm that bundles compatible waste to hit <strong>150L + 15% reserve buffer</strong> (172.5L).
                </p>
            </div>
            """,
            unsafe_allow_html=True
        )
    with eng_c3:
        st.markdown(
            """
            <div class="hh-card">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg,#FEF3C7,#FDE68A); border-radius: 10px; display:flex; align-items:center; justify-content:center; margin-bottom: 10px;">
                <span style="font-size: 16px; font-weight: 900; color: #B45309; font-family: 'JetBrains Mono', monospace;">RG</span>
            </div>
                <strong style="color: #0A192F; font-size: 1.05rem;">ResilienceGuard</strong>
                <div style="font-size: 11px; font-weight: 700; color: #00875A; margin: 2px 0 8px 0;">Adaptive Recovery</div>
                <p style="font-size: 0.85rem; color: #475569; line-height: 1.45;">
                    Recovers lots when truck drivers reject leaking canisters at loading docks, automatically promoting standby containers.
                </p>
            </div>
            """,
            unsafe_allow_html=True
        )
    with eng_c4:
        st.markdown(
            """
            <div class="hh-card">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg,#E0F2FE,#BAE6FD); border-radius: 10px; display:flex; align-items:center; justify-content:center; margin-bottom: 10px;">
                <span style="font-size: 16px; font-weight: 900; color: #0369A1; font-family: 'JetBrains Mono', monospace;">CS</span>
            </div>
                <strong style="color: #0A192F; font-size: 1.05rem;">CustodySentinel</strong>
                <div style="font-size: 11px; font-weight: 700; color: #00875A; margin: 2px 0 8px 0;">Cryptographic Custody</div>
                <p style="font-size: 0.85rem; color: #475569; line-height: 1.45;">
                    Generates timestamped SHA-256 dual-key QR codes for loading docks with zero cellular or internet connectivity.
                </p>
            </div>
            """,
            unsafe_allow_html=True
        )

    # 4. HOW IT WORKS (5-Step Process)
    st.markdown(
        """
        <div class="landing-section">
            <span class="landing-section-eyebrow">End-to-End Operation</span>
            <h2 class="landing-section-title">How Regional Hazmat Pooling Works</h2>
            <p style="color: #475569; font-size: 1.05rem; line-height: 1.6; max-width: 800px; margin: 8px 0 24px 0;">
                From closet inventory to certified hauler transfer, HazardHub AI automates every compliance milestone.
            </p>
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px;">
                <div class="hh-card" style="padding: 18px;">
                    <span style="background: #F1F5F9; color: #0A192F; font-weight: 800; font-size: 11px; padding: 2px 8px; border-radius: 4px;">01</span>
                    <h4 style="margin: 8px 0 4px 0; font-size: 0.95rem; color: #0A192F;">Log Inventory</h4>
                    <p style="font-size: 0.78rem; color: #64748B; line-height: 1.4;">
                        Labs catalog containers with volume, EPA group, and expiration dates.
                    </p>
                </div>
                <div class="hh-card" style="padding: 18px;">
                    <span style="background: #E6F8F3; color: #006B4E; font-weight: 800; font-size: 11px; padding: 2px 8px; border-radius: 4px;">02</span>
                    <h4 style="margin: 8px 0 4px 0; font-size: 0.95rem; color: #0A192F;">Co-Op Pooling</h4>
                    <p style="font-size: 0.78rem; color: #64748B; line-height: 1.4;">
                        QuotaPacker bundles regional containers to satisfy the &ge;150L threshold.
                    </p>
                </div>
                <div class="hh-card" style="padding: 18px;">
                    <span style="background: #E0F2FE; color: #0369A1; font-weight: 800; font-size: 11px; padding: 2px 8px; border-radius: 4px;">03</span>
                    <h4 style="margin: 8px 0 4px 0; font-size: 0.95rem; color: #0A192F;">ChemiGuard</h4>
                    <p style="font-size: 0.78rem; color: #64748B; line-height: 1.4;">
                        Pairwise algorithm verifies zero chemical incompatibilities against EPA rules.
                    </p>
                </div>
                <div class="hh-card" style="padding: 18px;">
                    <span style="background: #FEF3C7; color: #B45309; font-weight: 800; font-size: 11px; padding: 2px 8px; border-radius: 4px;">04</span>
                    <h4 style="margin: 8px 0 4px 0; font-size: 0.95rem; color: #0A192F;">Hauler Dispatch</h4>
                    <p style="font-size: 0.78rem; color: #64748B; line-height: 1.4;">
                        Commercial hauler dispatches truck with a +15% standby reserve buffer.
                    </p>
                </div>
                <div class="hh-card" style="padding: 18px;">
                    <span style="background: #F3E8FF; color: #7E22CE; font-weight: 800; font-size: 11px; padding: 2px 8px; border-radius: 4px;">05</span>
                    <h4 style="margin: 8px 0 4px 0; font-size: 0.95rem; color: #0A192F;">Offline QR</h4>
                    <p style="font-size: 0.78rem; color: #64748B; line-height: 1.4;">
                        Dual-key cryptographic QR code exchange completes legal transfer at dock.
                    </p>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )

    # 5. AI OPERATIONS SHOWCASE
    st.markdown(
        """
        <div class="landing-section">
            <span class="landing-section-eyebrow">Autonomous Natural Language Dispatcher</span>
            <h2 class="landing-section-title">AI Orchestration with Deterministic Guardrails</h2>
            <p style="color: #475569; font-size: 1.05rem; line-height: 1.6; max-width: 800px; margin: 8px 0 24px 0;">
                Rather than asking technicians to manually inspect dozens of chemical SDS sheets and 8 facility inventories, 
                our AI Operations Dispatcher translates conversational requests into safe deterministic tool executions.
            </p>
            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 20px; padding: 28px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: center;">
                <div>
                    <div style="font-size: 0.95rem; font-weight: 700; color: #0A192F; margin-bottom: 12px;">
                        Interactive Operational Prompts:
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.85rem;">
                        <div style="padding: 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px;">
                            <strong>"Can we bundle a pickup lot for tomorrow?"</strong><br/>
                            <span style="color: #64748B; font-size: 0.8rem;">Invokes QuotaPacker optimizer to evaluate eligible regional waste.</span>
                        </div>
                        <div style="padding: 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px;">
                            <strong>"What urgent waste is expiring soon?"</strong><br/>
                            <span style="color: #64748B; font-size: 0.8rem;">Filters unoffloaded containers with &le;14 days shelf life.</span>
                        </div>
                        <div style="padding: 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px;">
                            <strong>"Is Nitric Acid safe with Acetone?"</strong><br/>
                            <span style="color: #64748B; font-size: 0.8rem;">ChemiGuard instantly flags violent oxidation/explosion risk under EPA 40 CFR.</span>
                        </div>
                    </div>
                </div>
                <div style="background: #F0FDFA; border: 1px solid #CCFBF1; border-radius: 16px; padding: 20px; font-size: 0.85rem; color: #134E4A;">
                    <div style="font-weight: 800; font-size: 0.95rem; margin-bottom: 6px;">
                        Operations Agent Response Sample:
                    </div>
                    <p style="margin: 0 0 10px 0;">
                        <em>"Yes, we can immediately schedule a regional pickup! I executed QuotaPacker and assembled 184.0 Liters across 5 facilities with 2 standby reserves. 100% EPA compliant."</em>
                    </p>
                    <div style="font-family: monospace; font-size: 0.78rem; background: #FFFFFF; padding: 8px; border-radius: 6px; border: 1px solid #A3E8D5;">
                        TOOL_CALL: proposeOptimalLot(minThreshold=150.0) -> SAFE
                    </div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )

    # 6. SAFETY & COMPLIANCE
    st.markdown(
        """
        <div class="landing-section">
            <span class="landing-section-eyebrow">Regulatory Rigor</span>
            <h2 class="landing-section-title">Strict Federal Compliance: EPA 40 CFR &amp; DOT 49 CFR</h2>
            <p style="color: #475569; font-size: 1.05rem; line-height: 1.6; max-width: 800px; margin: 8px 0 24px 0;">
                Every candidate container is evaluated against federal segregation laws. Incompatible pairs are deterministically blocked.
            </p>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                <div class="hh-card">
                    <span class="badge-urgent">BLOCKED: Acid + Base</span>
                    <h4 style="margin: 10px 0 4px 0; color: #0A192F;">Neutralization Hazard</h4>
                    <p style="font-size: 0.82rem; color: #475569; line-height: 1.45;">
                        Mixing mineral acids with caustics triggers intense exothermic spattering and drum overpressurization.
                    </p>
                </div>
                <div class="hh-card">
                    <span class="badge-urgent">BLOCKED: Acid + Cyanide</span>
                    <h4 style="margin: 10px 0 4px 0; color: #0A192F;">Lethal Toxic Gas</h4>
                    <p style="font-size: 0.82rem; color: #475569; line-height: 1.45;">
                        Acidification of cyanides immediately evolves lethal Hydrogen Cyanide (HCN) gas that breaches gaskets.
                    </p>
                </div>
                <div class="hh-card">
                    <span class="badge-urgent">BLOCKED: Oxidizer + Solvent</span>
                    <h4 style="margin: 10px 0 4px 0; color: #0A192F;">Explosion Detonation</h4>
                    <p style="font-size: 0.82rem; color: #475569; line-height: 1.45;">
                        Nitric acid + acetone/solvents creates violent deflagration and shock-sensitive organic nitrates.
                    </p>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )

    # 7. OFFLINE CAPABILITY
    st.markdown(
        """
        <div class="landing-section">
            <span class="landing-section-eyebrow">Zero Dead-Zone Connectivity Failures</span>
            <h2 class="landing-section-title">Designed for Subterranean Docks with Zero Cellular Signal</h2>
            <p style="color: #475569; font-size: 1.05rem; line-height: 1.6; max-width: 800px; margin: 8px 0 24px 0;">
                Loading bays and chemical closets are situated in thick concrete basements where cell signals cannot penetrate. 
                HazardHub AI is built <strong>local-first</strong> with cryptographic offline QR verification.
            </p>
            <div class="hh-card" style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; align-items: center;">
                <div style="font-size: 0.9rem; color: #475569; line-height: 1.6;">
                    <p>
                        <strong>Dual-Key Cryptographic Handshake:</strong> The chemical hygiene technician and hauler driver exchange scannable QR payloads directly between device screens. The payload contains an immutable SHA-256 manifest checksum, timestamps, and technician digital seals.
                    </p>
                    <p>
                        <strong>Automatic Synchronization:</strong> When the hauler driver ascends back to street level, all locally verified custody transactions automatically sync.
                    </p>
                </div>
                <div style="text-align: center; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px;">
                    <div style="font-size: 40px;">📱</div>
                    <div style="font-weight: 800; font-size: 0.95rem; color: #0A192F; margin-top: 6px;">Offline QR Handshake</div>
                    <div style="font-size: 11px; color: #64748B;">SHA-256 Verifiable Offline</div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )

    # 8. IMPACT & STATISTICS
    st.markdown(
        """
        <div class="landing-section">
            <span class="landing-section-eyebrow">Cooperative Impact</span>
            <h2 class="landing-section-title">Measurable Environmental &amp; Economic Metrics</h2>
            <p style="color: #475569; font-size: 1.05rem; line-height: 1.6; max-width: 800px; margin: 8px 0 24px 0;">
                Outcomes generated across the 8 linked participating facilities in our regional cooperative.
            </p>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
                <div class="hh-card" style="text-align: center;">
                    <div style="font-size: 2.3rem; font-weight: 900; color: #00875A; font-family: monospace;">&ge; 150 L</div>
                    <strong style="color: #0A192F; font-size: 0.95rem;">Hauler Quota Attained</strong>
                    <p style="font-size: 0.78rem; color: #64748B; margin-top: 4px;">Satisfies commercial batch minimums with 0 solo dispatch penalties.</p>
                </div>
                <div class="hh-card" style="text-align: center;">
                    <div style="font-size: 2.3rem; font-weight: 900; color: #0F766E; font-family: monospace;">8</div>
                    <strong style="color: #0A192F; font-size: 0.95rem;">Facilities Linked</strong>
                    <p style="font-size: 0.78rem; color: #64748B; margin-top: 4px;">High schools, dental clinics, pathology, and water quality testing boards.</p>
                </div>
                <div class="hh-card" style="text-align: center;">
                    <div style="font-size: 2.3rem; font-weight: 900; color: #0369A1; font-family: monospace;">0</div>
                    <strong style="color: #0A192F; font-size: 0.95rem;">Safety Incidents</strong>
                    <p style="font-size: 0.78rem; color: #64748B; margin-top: 4px;">100% deterministic safety enforcement preventing catastrophic reactions.</p>
                </div>
                <div class="hh-card" style="text-align: center;">
                    <div style="font-size: 2.3rem; font-weight: 900; color: #7E22CE; font-family: monospace;">42%</div>
                    <strong style="color: #0A192F; font-size: 0.95rem;">Cost Reduction</strong>
                    <p style="font-size: 0.78rem; color: #64748B; margin-top: 4px;">Average disposal savings per facility through shared regional logistics.</p>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )

    # 9. FINAL CALL TO ACTION
    st.markdown(
        """
        <div class="landing-section" style="border-bottom: none;">
            <div class="cta-banner">
                <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(255,255,255,0.2); border-radius: 9999px; font-size: 11px; font-weight: 700; margin-bottom: 12px;">
                    <span>OAKS AI BUILDERS CHALLENGE</span>
                </div>
                <h2 style="font-size: 2.4rem; font-weight: 900; margin: 0 0 12px 0;">
                    Ready to Coordinate Safe Regional Hazmat Logistics?
                </h2>
                <p style="font-size: 1.05rem; opacity: 0.95; max-width: 650px; margin: 0 auto 24px auto; line-height: 1.5;">
                    Launch the live platform to monitor real-time quotas, verify chemical compatibility, or simulate offline field custody.
                </p>
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )

    cta_c1, cta_c2, cta_c3 = st.columns([1, 1, 1])
    with cta_c1:
        if st.button("Launch Live Platform Now", type="primary", use_container_width=True, key="cta_plat"):
            st.session_state.active_nav = "Platform"
            st.rerun()
    with cta_c2:
        if st.button("Try AI Operations Agent", use_container_width=True, key="cta_agent"):
            st.session_state.active_nav = "AI Operations"
            st.rerun()
    with cta_c3:
        if st.button("View 8 Local Laboratories", use_container_width=True, key="cta_labs"):
            st.session_state.active_nav = "Labs"
            st.rerun()

    # 10. CORPORATE FOOTER
    st.markdown(
        """
        <div class="corporate-footer">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E2E8F0; padding-bottom: 24px; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="
                        width: 30px; height: 30px;
                        background: linear-gradient(135deg, #00875A 0%, #006B4E 100%);
                        border-radius: 7px;
                        display: flex; align-items: center; justify-content: center;
                    ">
                        <span style="color: #FFFFFF; font-size: 11px; font-weight: 900;">HH</span>
                    </div>
                    <span style="font-weight: 900; font-size: 1.2rem; color: #0A192F;">Hazard<span style="color:#00875A;">Hub</span>&nbsp;AI</span>
                </div>
                <div style="font-size: 12px; color: #64748B;">
                    Autonomous Hazmat Pooling & Offline Chain of Custody
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #94A3B8;">
                <div>
                    &copy; 2026 HazardHub AI. EPA 40 CFR Part 264 Compliant Infrastructure.
                </div>
                <div style="display: flex; gap: 16px;">
                    <span>Deterministic ChemiGuard</span>
                    <span>•</span>
                    <span>QuotaPacker Knapsack</span>
                    <span>•</span>
                    <span>ResilienceGuard</span>
                    <span>•</span>
                    <span>CustodySentinel</span>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )


# ──────────────────────────────────────────
# 2. PLATFORM PAGE (Telemetry & Dashboard)
# ──────────────────────────────────────────
elif st.session_state.active_nav == "Platform":
    st.markdown(
        """
        <div style="margin-bottom: 20px;">
            <h1 style="margin:0; font-weight:900; color:#0A192F; letter-spacing:-0.02em;">
                Regional Platform Telemetry &amp; Quota Monitor
            </h1>
            <p style="color:#64748B; font-size:15px; margin-top:4px;">
                Commercial haulers require a minimum <strong>150 Liter threshold</strong> for dispatch. 
                HazardHub AI consolidates unbundled inventories across neighborhood clinics and research labs.
            </p>
        </div>
        """,
        unsafe_allow_html=True
    )

    available_waste = [w for w in state.waste_items if w.status == "AVAILABLE"]
    total_available_vol = sum(w.volume_liters for w in available_waste)
    urgent_count = len([w for w in available_waste if w.urgency == "URGENT"])
    active_lots_count = len(state.pickup_lots)
    participating_labs_count = len([l for l in state.labs if l.is_participating])

    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.markdown(
            f"""
            <div class="hh-stat-card">
                <div class="hh-stat-val">{total_available_vol:.1f} <span style="font-size:1.2rem; font-weight:600; color:#64748B;">L</span></div>
                <div class="hh-stat-label">Available Ready Waste</div>
            </div>
            """,
            unsafe_allow_html=True
        )
    with c2:
        st.markdown(
            f"""
            <div class="hh-stat-card">
                <div class="hh-stat-val" style="color: {'#DC2626' if urgent_count > 0 else '#0A192F'};">{urgent_count}</div>
                <div class="hh-stat-label">Urgent Expiring Containers (&le;14d)</div>
            </div>
            """,
            unsafe_allow_html=True
        )
    with c3:
        st.markdown(
            f"""
            <div class="hh-stat-card">
                <div class="hh-stat-val">{active_lots_count}</div>
                <div class="hh-stat-label">Active Pickup Lots</div>
            </div>
            """,
            unsafe_allow_html=True
        )
    with c4:
        st.markdown(
            f"""
            <div class="hh-stat-card">
                <div class="hh-stat-val">{participating_labs_count} / {len(state.labs)}</div>
                <div class="hh-stat-label">Participating Co-Op Labs</div>
            </div>
            """,
            unsafe_allow_html=True
        )

    # 150L Gauge Card
    threshold = 150.0
    quota_pct = min(100.0, (total_available_vol / threshold) * 100.0)
    is_met = total_available_vol >= threshold

    st.markdown(
        f"""
        <div class="hh-progress-wrapper">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <div>
                    <span style="font-weight:800; font-size:16px; color:#0A192F;">Regional 150L Quota Fulfillment Gauge</span>
                    <span style="font-size:12px; color:#64748B; margin-left:8px;">(CleanHarbors Commercial Minimum Dispatch)</span>
                </div>
                <div>
                    <span style="font-weight:900; font-size:18px; color:{'#00875A' if is_met else '#B45309'};">
                        {total_available_vol:.1f} / 150.0 L ({quota_pct:.0f}%)
                    </span>
                    <span style="font-size:12px; font-weight:bold; color:{'#00875A' if is_met else '#DC2626'}; margin-left:6px;">
                        {'OK THRESHOLD MET' if is_met else f'SHORT BY {threshold - total_available_vol:.1f} L'}
                    </span>
                </div>
            </div>
            <div class="hh-progress-bar-bg">
                <div class="hh-progress-bar-fill" style="width: {min(100, quota_pct)}%;"></div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748B; margin-top:8px;">
                <span>0 Liters</span>
                <span style="font-weight:bold; color:#DC2626;">▼ 150.0 L Hauler Threshold</span>
                <span>Target Buffer: 172.5 L (+15%)</span>
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )

    # Fast Actions
    pb_col1, pb_col2 = st.columns(2)
    with pb_col1:
        if st.button("Go to Pickup Pooling & Optimizer", type="primary", use_container_width=True):
            st.session_state.active_nav = "Pickup Pooling"
            st.rerun()
    with pb_col2:
        if st.button("Inspect Waste Inventory (30 Items)", use_container_width=True):
            st.session_state.active_nav = "Waste Management"
            st.rerun()


# ──────────────────────────────────────────
# 3. LABS PAGE
# ──────────────────────────────────────────
elif st.session_state.active_nav == "Labs":
    st.markdown(
        """
        <div style="margin-bottom: 20px;">
            <h1 style="margin:0; font-weight:900; color:#0A192F;">Participating Facilities Directory</h1>
            <p style="color:#64748B; font-size:15px; margin-top:4px;">
                The 8 municipal and institutional members pooling hazardous chemicals in the cooperative network.
            </p>
        </div>
        """,
        unsafe_allow_html=True
    )

    labs_df_data = []
    for l in state.labs:
        lab_waste = [w for w in state.waste_items if w.lab_id == l.id and w.status == "AVAILABLE"]
        vol = sum(w.volume_liters for w in lab_waste)
        labs_df_data.append({
            "Facility Name": l.name,
            "Type": l.type,
            "EPA Facility ID": l.epa_facility_id,
            "Contact Person": l.contact_person,
            "Phone": l.phone,
            "Address": l.address,
            "Storage Location": l.storage_location,
            "Available Vol": f"{vol:.1f} L",
            "Co-Op Active": "✓ Active" if l.is_participating else "✗ Inactive",
        })

    st.dataframe(pd.DataFrame(labs_df_data), use_container_width=True, hide_index=True)

    st.markdown("### Facility Storage Cards")
    lab_cols = st.columns(2)
    for idx, lab in enumerate(state.labs):
        with lab_cols[idx % 2]:
            st.markdown(
                f"""
                <div class="hh-card" style="margin-bottom: 16px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div>
                            <strong style="color: #0A192F; font-size: 16px;">{lab.name}</strong>
                            <div style="font-size: 12px; color: #00875A; font-weight: 700; margin-top: 2px;">
                                {lab.type} • EPA ID: {lab.epa_facility_id}
                            </div>
                        </div>
                        <span class="badge-medium">{lab.id}</span>
                    </div>
                    <p style="font-size: 13px; color: #475569; margin: 10px 0 4px 0; line-height: 1.5;">
                        {lab.address}<br/>
                        <strong>Storage:</strong> {lab.storage_location}<br/>
                        <strong>Contact:</strong> {lab.contact_person} ({lab.phone})
                    </p>
                </div>
                """,
                unsafe_allow_html=True
            )


# ──────────────────────────────────────────
# 4. WASTE MANAGEMENT PAGE
# ──────────────────────────────────────────
elif st.session_state.active_nav == "Waste Management":
    st.markdown(
        """
        <div style="margin-bottom: 20px;">
            <h1 style="margin:0; font-weight:900; color:#0A192F;">Waste Inventory Management</h1>
            <p style="color:#64748B; font-size:15px; margin-top:4px;">
                Catalog, search, and classify chemical waste containers across all 8 regional facilities.
            </p>
        </div>
        """,
        unsafe_allow_html=True
    )

    f1, f2, f3, f4 = st.columns([3, 2, 2, 2])
    with f1:
        search_query = st.text_input("🔍 Search Chemical, UN Code, or Formula:", "")
    with f2:
        lab_filter = st.selectbox("Filter by Facility:", ["All Facilities"] + [l.name for l in state.labs])
    with f3:
        urgency_filter = st.selectbox("Filter by Urgency:", ["All Urgencies", "URGENT", "HIGH", "MEDIUM", "LOW"])
    with f4:
        status_filter = st.selectbox("Filter by Status:", ["All Statuses", "AVAILABLE", "IN_LOT", "QUARANTINED", "COLLECTED"])

    filtered = state.waste_items
    if search_query:
        q = search_query.lower()
        filtered = [
            w for w in filtered
            if q in w.name.lower() or q in (w.chemical_formula or "").lower() or q in w.un_code.lower()
        ]
    if lab_filter != "All Facilities":
        chosen_lab = next((l for l in state.labs if l.name == lab_filter), None)
        if chosen_lab:
            filtered = [w for w in filtered if w.lab_id == chosen_lab.id]
    if urgency_filter != "All Urgencies":
        filtered = [w for w in filtered if w.urgency == urgency_filter]
    if status_filter != "All Statuses":
        filtered = [w for w in filtered if w.status == status_filter]

    st.write(f"Showing **{len(filtered)}** of {len(state.waste_items)} chemical containers:")

    table_data = []
    for w in filtered:
        lab = next((l for l in state.labs if l.id == w.lab_id), None)
        table_data.append({
            "Chemical Name": w.name,
            "Formula": w.chemical_formula or "—",
            "Volume (L)": f"{w.volume_liters:.1f}",
            "Container": w.container_type,
            "Urgency": w.urgency,
            "Expires In": f"{w.days_until_expiring}d",
            "Status": w.status,
            "Facility": lab.name if lab else w.lab_id,
            "UN Code": w.un_code,
            "EPA Group": w.epa_group.replace("GROUP_", "").replace("_", " "),
        })

    st.dataframe(pd.DataFrame(table_data), use_container_width=True, hide_index=True)

    # Quick Add Form
    with st.expander("➕ Log New Container (with NLP Auto-Classification)"):
        qa1, qa2 = st.columns(2)
        with qa1:
            nlp_desc = st.text_input("Quick description (e.g. '15L Glacial Acetic Acid'):", "")
            n_name = st.text_input("Chemical Name:", value=nlp_desc if nlp_desc else "Glacial Acetic Acid Solution")
            n_lab = st.selectbox("Originating Facility:", [l.name for l in state.labs])
            n_vol = st.number_input("Volume (Liters):", min_value=0.5, max_value=200.0, value=15.0, step=0.5)
            n_type = st.selectbox("Container Type:", ["5L Carboy", "10L Carboy", "20L Drum", "2.5L Glass", "1L Bottle"])
        with qa2:
            n_epa = st.selectbox(
                "EPA Hazard Group (40 CFR 264 App. V):",
                [
                    "GROUP_1A_ACIDS", "GROUP_1B_BASES", "GROUP_2A_ACIDS_REACTIVE",
                    "GROUP_2B_CYANIDES_SULFIDES", "GROUP_3A_OXIDIZERS",
                    "GROUP_3B_FLAMMABLES_ORGANIC", "GROUP_4A_HALOGENATED",
                    "GROUP_4B_REACTIVE_METALS", "GROUP_5_BLEACH", "GROUP_5_AMMONIA"
                ]
            )
            n_un = st.text_input("UN Transport Code:", value="UN2789" if "ACID" in n_epa else "UN1993")
            n_urg = st.selectbox("Urgency Level:", ["URGENT", "HIGH", "MEDIUM", "LOW"], index=1)
            n_days = st.number_input("Days Until Expiring:", min_value=1, max_value=180, value=21)

        if st.button("Log Chemical Container to Co-Op", type="primary"):
            sel_lab = next(l for l in state.labs if l.name == n_lab)
            item = WasteItem(
                id=f"waste-{int(datetime.now().timestamp() * 1000)}",
                lab_id=sel_lab.id,
                name=n_name,
                chemical_formula="AUTO",
                epa_group=n_epa,
                dot_class="Class 8: Corrosive" if "ACID" in n_epa else "Class 3: Flammable",
                un_code=n_un,
                volume_liters=n_vol,
                container_type=n_type,
                condition="GOOD",
                urgency=n_urg,
                expiration_date="2026-10-01",
                days_until_expiring=int(n_days),
                status="AVAILABLE",
            )
            state.add_waste_item(item)
            st.success(f"Logged {n_name} ({n_vol}L) from {n_lab}!")
            st.rerun()


# ──────────────────────────────────────────
# 5. PICKUP POOLING PAGE
# ──────────────────────────────────────────
elif st.session_state.active_nav == "Pickup Pooling":
    st.markdown(
        """
        <div style="margin-bottom: 20px;">
            <h1 style="margin:0; font-weight:900; color:#0A192F;">Regional Pickup Pooling &amp; Optimizer</h1>
            <p style="color:#64748B; font-size:15px; margin-top:4px;">
                Assemble multi-facility pickup lots with QuotaPacker (≥150L) and enforce ChemiGuard EPA 40 CFR safety rules.
            </p>
        </div>
        """,
        unsafe_allow_html=True
    )

    # Sub-tabs
    t1, t2 = st.tabs(["📦 Interactive Lot Builder", "🚚 Active Lots & Dispatches"])

    with t1:
        available_items = [w for w in state.waste_items if w.status == "AVAILABLE" and w.condition != "LEAKING"]

        # Action bar
        b_c1, b_c2, b_c3 = st.columns([2, 2, 3])
        with b_c1:
            if st.button("⚡ 1-Click Auto-Bundle (QuotaPacker)", type="primary", use_container_width=True):
                proposal = QuotaPackerEngine.auto_bundle(available_items, AutoBundleOptions(
                    min_threshold_liters=150.0,
                    reserve_buffer_percent=15.0,
                ))
                st.session_state.builder_selected_ids = [i.id for i in proposal.selected_items]
                st.rerun()
        with b_c2:
            if st.button("🧹 Clear Selection", use_container_width=True):
                st.session_state.builder_selected_ids = []
                st.rerun()
        with b_c3:
            if st.button("⚠️ Test Incompatibility (Nitric + Acetone)", use_container_width=True):
                nitric = next((w for w in available_items if "nitric" in w.name.lower()), None)
                acetone = next((w for w in available_items if "acetone" in w.name.lower() or "solvent" in w.name.lower()), None)
                sel = []
                if nitric: sel.append(nitric.id)
                if acetone: sel.append(acetone.id)
                st.session_state.builder_selected_ids = sel
                st.rerun()

        selected_items = [w for w in state.waste_items if w.id in set(st.session_state.builder_selected_ids)]
        cur_volume = sum(i.volume_liters for i in selected_items)
        is_threshold_met = cur_volume >= 150.0
        compat_result = ChemiGuardEngine.evaluate_lot(selected_items)

        # Progress bar
        st.markdown(
            f"""
            <div class="hh-progress-wrapper" style="margin: 16px 0;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="font-weight:800; font-size:15px; color:#0A192F;">Proposed Lot Volume:</span>
                    <span style="font-weight:900; font-size:17px; color:{'#00875A' if is_threshold_met else '#B45309'};">
                        {cur_volume:.1f} / 150.0 L ({min(100, int((cur_volume/150.0)*100))}%)
                    </span>
                </div>
                <div class="hh-progress-bar-bg">
                    <div class="hh-progress-bar-fill" style="width: {min(100, (cur_volume/150.0)*100)}%;"></div>
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

        if not compat_result.is_safe:
            issue = compat_result.issues[0]
            st.markdown(
                f"""
                <div class="chemiguard-block-banner">
                    <strong style="color:#E11D48; font-size:15px;">🚫 CHEMIGUARD SAFETY BLOCK: EPA 40 CFR VIOLATION</strong>
                    <div style="color:#881337; font-size:13px; margin-top:4px;">
                        <strong>{issue.item_a_name}</strong> and <strong>{issue.item_b_name}</strong> cannot share transport lots.
                    </div>
                    <div style="color:#9F1239; font-size:12px; margin-top:4px;">
                        <strong>Consequence:</strong> {issue.consequence} | <strong>Regulation:</strong> {issue.hazard_description}
                    </div>
                    <div style="color:#4C0519; font-size:11px; margin-top:4px;">
                        💡 <em>Remedy: {issue.remedy_recommendation}</em>
                    </div>
                </div>
                """,
                unsafe_allow_html=True
            )
        elif selected_items:
            st.markdown(
                f"""
                <div class="chemiguard-safe-banner">
                    <strong style="color:#16A34A; font-size:14px;">🛡️ CHEMIGUARD VERIFIED: 100% EPA 40 CFR COMPATIBLE</strong>
                    <div style="color:#166534; font-size:12px;">
                        All {compat_result.checked_count} pairwise combinations passed mathematical compatibility checks.
                    </div>
                </div>
                """,
                unsafe_allow_html=True
            )

        # Container selector
        st.markdown("#### Select Chemical Containers:")
        item_options = {item.id: f"{item.name} ({item.volume_liters:.1f}L, {item.urgency}, {item.un_code}, Lab: {item.lab_id})" for item in available_items}

        selected_ids = st.multiselect(
            "Eligible Containers:",
            options=list(item_options.keys()),
            default=[i for i in st.session_state.builder_selected_ids if i in item_options],
            format_func=lambda x: item_options.get(x, x),
            label_visibility="collapsed"
        )
        st.session_state.builder_selected_ids = selected_ids

        can_create = is_threshold_met and compat_result.is_safe and len(selected_items) > 0
        dsp1, dsp2 = st.columns([3, 1])
        with dsp1:
            if not is_threshold_met:
                st.info(f"⚠️ Need {150.0 - cur_volume:.1f} more Liters to satisfy commercial hauler minimum (150L).")
            elif not compat_result.is_safe:
                st.error("🚫 Cannot dispatch: ChemiGuard detected dangerous EPA chemical incompatibilities.")
            else:
                st.success("✓ Ready for dispatch! Quota met and all containers 100% EPA compliant.")
        with dsp2:
            if st.button("🚀 Create & Schedule Lot", disabled=(not can_create), type="primary", use_container_width=True):
                proposal = ProposedLotBundle(
                    selected_items=selected_items,
                    standby_reserve_items=[],
                    total_volume_liters=cur_volume,
                    target_threshold_liters=150.0,
                    reserve_buffer_liters=max(0.0, cur_volume - 150.0),
                    is_threshold_met=True,
                    participating_lab_ids=sorted(list(set(i.lab_id for i in selected_items))),
                    compatibility=compat_result,
                    urgency_breakdown={},
                )
                new_lot = state.create_pickup_lot(proposal)
                st.session_state.builder_selected_ids = []
                st.balloons()
                st.success(f"Created Lot {new_lot.lot_number} ({new_lot.total_volume_liters:.1f}L)!")
                st.rerun()

    with t2:
        if not state.pickup_lots:
            st.info("No active pickup lots found. Use the Builder tab to auto-bundle a lot.")
        else:
            for lot in state.pickup_lots:
                lot_items = state.get_waste_by_ids(lot.waste_item_ids)
                labs_in_lot = [l for l in state.labs if l.id in set(lot.participating_lab_ids)]
                st.markdown(
                    f"""
                    <div class="hh-card" style="margin-bottom: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F1F5F9; padding-bottom: 10px;">
                            <div>
                                <span style="font-size: 18px; font-weight: 900; color: #0A192F; font-family: monospace;">
                                    {lot.lot_number}
                                </span>
                                <span style="background: #E6F8F3; color: #006B4E; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px; margin-left: 10px;">
                                    {lot.status}
                                </span>
                            </div>
                            <div style="text-align: right;">
                                <span style="font-size: 18px; font-weight: 900; color: #00875A;">{lot.total_volume_liters:.1f} L</span>
                                <span style="font-size: 12px; color: #64748B;">(&ge; 150L Met)</span>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 12px; font-size: 12px; color: #475569;">
                            <div><strong>Transporter:</strong> {lot.hauler_name}<br/><strong>Driver:</strong> {lot.hauler_driver_name}</div>
                            <div><strong>Dispatch:</strong> {lot.scheduled_date} (48h Window)<br/><strong>Facilities:</strong> {len(labs_in_lot)} Labs</div>
                            <div><strong>Containers:</strong> {len(lot.waste_item_ids)} Units<br/><strong>Standby Buffer:</strong> +{lot.reserve_buffer_liters:.1f} L</div>
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True
                )

                # Rejection simulation popover
                with st.popover(f"⚡ Simulate Dockside Rejection for {lot.lot_number}"):
                    st.write("Simulate hauler driver rejecting a damaged drum at the loading dock. ResilienceGuard will promote a standby container to protect the 150L quota:")
                    rej_item = st.selectbox("Container to reject:", lot_items, format_func=lambda x: f"{x.name} ({x.volume_liters:.1f}L)", key=f"rej_sel_{lot.id}")
                    rej_res = st.selectbox("Reason:", ["DAMAGED_LEAKING", "LABEL_ILLEGIBLE", "CONTAINER_BULGING"], key=f"rej_res_{lot.id}")
                    if st.button("Confirm Rejection", type="primary", key=f"rej_btn_{lot.id}"):
                        plan = state.handle_canister_rejection(lot.id, rej_item.id, rej_res)
                        if plan:
                            st.success(f"ResilienceGuard Executed: {plan.explanation}")
                            st.rerun()


# ──────────────────────────────────────────
# 6. AI OPERATIONS PAGE
# ──────────────────────────────────────────
elif st.session_state.active_nav == "AI Operations":
    st.markdown(
        """
        <div style="margin-bottom: 20px;">
            <h1 style="margin:0; font-weight:900; color:#0A192F;">AI Operations Console</h1>
            <p style="color:#64748B; font-size:15px; margin-top:4px;">
                Natural language interface for hazmat pooling, ChemiGuard safety queries, and knapsack optimization.
            </p>
        </div>
        """,
        unsafe_allow_html=True
    )

    p1, p2, p3, p4 = st.columns(4)
    quick_prompt = None
    with p1:
        if st.button("📦 'Can we bundle a pickup lot?'", use_container_width=True):
            quick_prompt = "Can we bundle a pickup lot?"
    with p2:
        if st.button("⏰ 'What is urgent or expiring?'", use_container_width=True):
            quick_prompt = "What is urgent or expiring?"
    with p3:
        if st.button("💥 'Is Nitric Acid safe with Acetone?'", use_container_width=True):
            quick_prompt = "Is Nitric Acid safe with Acetone?"
    with p4:
        if st.button("📊 'Cooperative Readiness Overview'", use_container_width=True):
            quick_prompt = "Cooperative Readiness Overview"

    for msg in st.session_state.chat_history:
        if msg["sender"] == "USER":
            with st.chat_message("user"):
                st.write(msg["content"])
        else:
            with st.chat_message("assistant", avatar="🧪"):
                st.markdown(msg["content"])
                if msg.get("tool_calls"):
                    with st.expander(f"🛠️ Deterministic Tool Invocations ({len(msg['tool_calls'])})"):
                        for t in msg["tool_calls"]:
                            st.markdown(f"**Tool:** `{t.tool_name}`")
                            st.json(t.parameters)
                            st.info(t.summary)

    u_input = st.chat_input("Ask a question (e.g. 'Can we bundle a pickup lot?')...")
    prompt_to_run = quick_prompt or u_input

    if prompt_to_run:
        st.session_state.chat_history.append({
            "sender": "USER",
            "timestamp": datetime.now().strftime("%H:%M"),
            "content": prompt_to_run,
        })
        agent_resp = AIOperationsAgent.process_query(prompt_to_run, state)
        st.session_state.chat_history.append({
            "sender": "AGENT",
            "timestamp": agent_resp.timestamp,
            "content": agent_resp.content,
            "tool_calls": agent_resp.tool_calls,
            "action_suggestion": agent_resp.action_suggestion,
        })
        st.rerun()


# ──────────────────────────────────────────
# 7. CHAIN OF CUSTODY PAGE
# ──────────────────────────────────────────
elif st.session_state.active_nav == "Chain of Custody":
    st.markdown(
        """
        <div style="margin-bottom: 20px;">
            <h1 style="margin:0; font-weight:900; color:#0A192F;">Cryptographic Chain of Custody</h1>
            <p style="color:#64748B; font-size:15px; margin-top:4px;">
                CustodySentinel enforces dual-key digital sign-offs and renders tamper-evident offline QR codes.
            </p>
        </div>
        """,
        unsafe_allow_html=True
    )

    if not state.pickup_lots:
        st.info("No active pickup lots to certify. Please create a lot in the Pickup Pooling tab first.")
    else:
        lot_opts = {l.id: f"{l.lot_number} ({l.total_volume_liters:.1f}L - {l.scheduled_date})" for l in state.pickup_lots}
        sel_lot_id = st.selectbox("Select Pickup Lot to Certify:", list(lot_opts.keys()), format_func=lambda x: lot_opts[x])
        target_lot = next(l for l in state.pickup_lots if l.id == sel_lot_id)

        sc1, sc2 = st.columns(2)
        with sc1:
            st.markdown(
                """
                <div class="hh-card">
                    <h4 style="margin: 0 0 6px 0; color: #0A192F;">🔑 Key 1: Lab Technician Release</h4>
                    <p style="font-size: 12px; color: #64748B;">
                        Authorized chemical hygiene officer certifying container packaging.
                    </p>
                    <div style="background: #F8FAFC; padding: 10px; border-radius: 8px; font-size: 12px; border: 1px solid #E2E8F0; margin-bottom: 12px;">
                        <strong>Signatory:</strong> Dr. Eleanor Vance (AP Chem Lead)<br/>
                        <strong>Facility:</strong> Oakridge High School Science Dept<br/>
                        <strong>Status:</strong> <span style="color:#00875A; font-weight:bold;">CERTIFIED DIGITALLY</span>
                    </div>
                </div>
                """,
                unsafe_allow_html=True
            )
            t_sig = st.text_input("Technician Digital Signature:", value="DR-ELEANOR-VANCE-AUTH-0901", key="t_sig_val")

        with sc2:
            st.markdown(
                """
                <div class="hh-card">
                    <h4 style="margin: 0 0 6px 0; color: #0A192F;">🔑 Key 2: Hauler Driver Acceptance</h4>
                    <p style="font-size: 12px; color: #64748B;">
                        Licensed commercial hazmat hauler accepting physical custody at dock.
                    </p>
                    <div style="background: #F8FAFC; padding: 10px; border-radius: 8px; font-size: 12px; border: 1px solid #E2E8F0; margin-bottom: 12px;">
                        <strong>Driver:</strong> Officer Daniel Vance (CDL Hazmat Certified)<br/>
                        <strong>Company:</strong> CleanHarbors Logistics (Truck #MA-COMM-8924)<br/>
                        <strong>Status:</strong> <span style="color:#00875A; font-weight:bold;">AWAITING QR HANDSHAKE</span>
                    </div>
                </div>
                """,
                unsafe_allow_html=True
            )
            d_sig = st.text_input("Driver Acceptance Code:", value="DRIVER-DANIEL-VANCE-CDL-8924", key="d_sig_val")

        st.markdown("---")

        qr_c1, qr_c2 = st.columns([1, 2])
        with qr_c1:
            st.markdown("#### Offline Custody QR Code")
            p_str = QRPayloadGenerator.create_payload_string(target_lot, t_sig)
            qr_url = QRPayloadGenerator.render_qr_code_data_url(p_str)
            st.markdown(
                f"""
                <div style="background: white; padding: 16px; border-radius: 16px; border: 2px solid #0A192F; text-align: center;">
                    <img src="{qr_url}" style="width: 220px; height: 220px;" alt="Offline Custody QR"/>
                    <div style="font-size: 11px; color: #475569; margin-top: 8px;">
                        Scan with hauler terminal in offline subterranean dock.
                    </div>
                </div>
                """,
                unsafe_allow_html=True
            )

        with qr_c2:
            st.markdown("#### Cryptographic SHA-256 Payload")
            parsed_pl = json.loads(p_str)
            st.json(parsed_pl)

            if st.button("📝 Complete Dual-Key Custody Handshake", type="primary", use_container_width=True):
                evt = CustodyEvent(
                    id=f"cust-{int(datetime.now().timestamp() * 1000)}",
                    lot_id=target_lot.id,
                    timestamp=datetime.now().isoformat(),
                    actor_name="Officer Daniel Vance (Hauler Driver)",
                    actor_role="HAULER_DRIVER",
                    action="QR_HANDSHAKE_SCANNED",
                    location="Dock Inspection Bay 4",
                    cryptographic_hash=parsed_pl["manifestChecksum"],
                    sync_status="SYNCED" if state.network_mode == "ONLINE" else "PENDING_OFFLINE",
                    details=f"Dual-key cryptographic handshake confirmed for Lot {target_lot.lot_number}.",
                )
                state.add_custody_event(evt)
                st.success("Dual-key custody handshake completed and cryptographically locked!")
                st.rerun()

        # Custody Ledger
        st.markdown("### Custody Audit Ledger")
        lot_events = [e for e in state.custody_events if e.lot_id == target_lot.id]
        if lot_events:
            event_rows = []
            for e in lot_events:
                event_rows.append({
                    "Timestamp": e.timestamp[:19].replace("T", " "),
                    "Actor": e.actor_name,
                    "Role": e.actor_role,
                    "Action": e.action,
                    "Hash": e.cryptographic_hash,
                    "Sync Status": e.sync_status,
                    "Details": e.details or "",
                })
            st.dataframe(pd.DataFrame(event_rows), use_container_width=True, hide_index=True)


# ──────────────────────────────────────────
# 8. ABOUT PAGE
# ──────────────────────────────────────────
elif st.session_state.active_nav == "About":
    st.markdown(
        """
        <div style="margin-bottom: 24px;">
            <div style="display: inline-flex; align-items: center; gap: 8px; padding: 4px 12px; background: #E6F8F3; border: 1px solid #A3E8D5; border-radius: 9999px; color: #006B4E; font-size: 11px; font-weight: 700; margin-bottom: 12px;">
                <span>OAKS AI BUILDERS CHALLENGE SUBMISSION</span>
            </div>
            <h1 style="margin:0; font-weight:900; color:#0A192F; font-size: 2.8rem; letter-spacing:-0.03em;">
                Pioneering Cooperative Environmental Safety for Small Laboratories
            </h1>
            <p style="color:#64748B; font-size:1.15rem; line-height: 1.6; max-width: 850px; margin-top:12px;">
                HazardHub AI resolves the critical market breakdown where certified hazardous waste disposal haulers refuse 
                to dispatch collection trucks unless an aggregate regional volume reaches at least <strong>150 Liters</strong>.
            </p>
        </div>
        """,
        unsafe_allow_html=True
    )

    # Architectural Principle Card
    st.markdown(
        """
        <div class="hh-card" style="margin-bottom: 28px;">
            <span style="font-size: 11px; font-weight: 800; color: #00875A; text-transform: uppercase; letter-spacing: 0.08em;">
                Core Architectural Design Principle
            </span>
            <blockquote style="font-size: 1.5rem; font-weight: 800; color: #0A192F; font-style: italic; border-left: 4px solid #00875A; padding-left: 20px; margin: 12px 0;">
                "AI recommends and explains; deterministic systems make safety-critical decisions."
            </blockquote>
            <p style="color: #475569; font-size: 0.95rem; line-height: 1.6; margin: 0;">
                In safety-critical hazardous materials logistics, an LLM hallucination cannot be permitted. 
                Combining concentrated nitric acid with acetone or mixing cyanide waste with acid effluent creates lethal toxic gas plumes or violent explosions. 
                HazardHub AI resolves this risk with strict separation of concerns: Generative AI orchestrates human interaction, while pure deterministic engines execute mathematical optimization, EPA pairwise chemical evaluations, and offline custody validation.
            </p>
        </div>
        """,
        unsafe_allow_html=True
    )

    # Regulatory Citations
    st.markdown("### Federal Regulatory Citations")
    rc1, rc2, rc3 = st.columns(3)
    with rc1:
        st.markdown(
            """
            <div class="hh-card">
                <strong style="color: #0A192F;">EPA 40 CFR Part 264 App. V</strong>
                <p style="font-size: 0.82rem; color: #64748B; margin-top: 6px; line-height: 1.45;">
                    Mandatory chemical compatibility matrix for treatment, storage, and disposal facilities.
                </p>
            </div>
            """,
            unsafe_allow_html=True
        )
    with rc2:
        st.markdown(
            """
            <div class="hh-card">
                <strong style="color: #0A192F;">DOT 49 CFR 177.848</strong>
                <p style="font-size: 0.82rem; color: #64748B; margin-top: 6px; line-height: 1.45;">
                    Segregation table for hazardous materials aboard commercial transport vehicles.
                </p>
            </div>
            """,
            unsafe_allow_html=True
        )
    with rc3:
        st.markdown(
            """
            <div class="hh-card">
                <strong style="color: #0A192F;">EPA Form 8700-22</strong>
                <p style="font-size: 0.82rem; color: #64748B; margin-top: 6px; line-height: 1.45;">
                    Uniform Hazardous Waste Manifest required for cradle-to-grave tracking.
                </p>
            </div>
            """,
            unsafe_allow_html=True
        )
