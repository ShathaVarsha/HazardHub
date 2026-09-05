"""
HazardHub UI Styling & CSS Design System
Matches the modern corporate environmental aesthetic:
White/off-white background, dark navy text, teal/green environmental accents, light gray borders, subtle shadows.
"""

CUSTOM_CSS = """
<style>
/* Main Container & Modern Typography */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

html, body, [class*="css"], [data-testid="stAppViewContainer"] {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background-color: #F8FAFC !important;
    color: #0A192F !important;
}

/* Hide default streamlit header decoration */
header[data-testid="stHeader"] {
    background: transparent;
}

/* Clean Professional Top Navigation & Branding */
.hh-brand-title {
    font-size: 1.6rem;
    font-weight: 900;
    color: #0A192F;
    letter-spacing: -0.03em;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
}
.hh-brand-title span.green {
    color: #00875A;
}

.hh-brand-badge {
    background: #E6F8F3;
    border: 1px solid #A3E8D5;
    color: #006B4E;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 9999px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

/* Modern Card Containers */
.hh-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02);
    transition: all 0.2s ease-in-out;
}
.hh-card:hover {
    border-color: #CBD5E1;
    box-shadow: 0 8px 20px -4px rgba(15, 23, 42, 0.08);
}

.hh-stat-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
    transition: all 0.2s ease-in-out;
}
.hh-stat-card:hover {
    border-color: #00875A;
    box-shadow: 0 8px 16px rgba(0, 135, 90, 0.08);
}

.hh-stat-val {
    font-size: 2.1rem;
    font-weight: 900;
    color: #0A192F;
    line-height: 1.1;
}
.hh-stat-label {
    font-size: 0.78rem;
    font-weight: 600;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 6px;
}

/* 150L Progress Bar Container */
.hh-progress-wrapper {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
    margin: 16px 0 24px 0;
}
.hh-progress-bar-bg {
    background: #F1F5F9;
    border-radius: 9999px;
    height: 22px;
    width: 100%;
    overflow: hidden;
    position: relative;
    border: 1px solid #CBD5E1;
}
.hh-progress-bar-fill {
    height: 100%;
    border-radius: 9999px;
    background: linear-gradient(90deg, #00875A 0%, #10B981 100%);
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Badges */
.badge-urgent {
    background: #FEE2E2;
    color: #B91C1C;
    border: 1px solid #FCA5A5;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 800;
}
.badge-high {
    background: #FEF3C7;
    color: #B45309;
    border: 1px solid #FCD34D;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 800;
}
.badge-medium {
    background: #E0F2FE;
    color: #0369A1;
    border: 1px solid #BAE6FD;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 800;
}
.badge-low {
    background: #F1F5F9;
    color: #475569;
    border: 1px solid #CBD5E1;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 800;
}

/* ChemiGuard Alert Banners */
.chemiguard-block-banner {
    background: #FFF1F2;
    border: 2px solid #E11D48;
    border-radius: 16px;
    padding: 18px 22px;
    margin: 16px 0;
    box-shadow: 0 4px 12px rgba(225, 29, 72, 0.1);
}
.chemiguard-safe-banner {
    background: #F0FDF4;
    border: 2px solid #16A34A;
    border-radius: 16px;
    padding: 18px 22px;
    margin: 16px 0;
    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.08);
}

/* Network Mode Pills */
.net-online {
    background: #DCFCE7;
    color: #15803D;
    border: 1px solid #86EFAC;
    padding: 4px 12px;
    border-radius: 9999px;
    font-weight: 700;
    font-size: 11px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}
.net-spotty {
    background: #FEF9C3;
    color: #A16207;
    border: 1px solid #FDE047;
    padding: 4px 12px;
    border-radius: 9999px;
    font-weight: 700;
    font-size: 11px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}
.net-offline {
    background: #FEE2E2;
    color: #B91C1C;
    border: 1px solid #FCA5A5;
    padding: 4px 12px;
    border-radius: 9999px;
    font-weight: 700;
    font-size: 11px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

/* Storytelling Landing Sections */
.landing-hero {
    padding: 24px 0 40px 0;
}
.landing-section {
    padding: 40px 0;
    border-top: 1px solid #E2E8F0;
}
.landing-section-title {
    font-size: 1.85rem;
    font-weight: 900;
    color: #0A192F;
    letter-spacing: -0.02em;
    line-height: 1.25;
}
.landing-section-eyebrow {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #00875A;
}

/* CTA Banner */
.cta-banner {
    background: linear-gradient(135deg, #00875A 0%, #006B4E 100%);
    border-radius: 24px;
    padding: 48px;
    color: #FFFFFF;
    box-shadow: 0 12px 28px -4px rgba(0, 135, 90, 0.25);
    text-align: center;
}

/* Footer */
.corporate-footer {
    border-top: 1px solid #E2E8F0;
    background: #FFFFFF;
    padding: 48px 0 24px 0;
    margin-top: 60px;
    color: #475569;
    font-size: 0.85rem;
}
</style>
"""
