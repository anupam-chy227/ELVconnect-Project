# ELV Connect Google Stitch Prompt Pack

This file contains a complete set of Google Stitch prompts for designing the ELV Connect web app.

Use order:
1. Paste the `Master Product Prompt` first to establish the overall product direction.
2. Then generate the `Public Marketing Prompt`.
3. Then generate the `Product Dashboard Prompt`.
4. Then use the `Component and Interaction Prompt` to refine the live widgets, payments, language, and location interactions.

Recommended Stitch usage:
- Ask for desktop-first screens with strong mobile adaptation.
- Keep the output as a premium web app, not a generic directory site.
- If Stitch supports follow-up refinements, ask it to preserve the same design language across all generated screens.

## Master Product Prompt

```text
Design a full-scale web app UI for ELV Connect, a premium India-wide security and ELV marketplace where clients post jobs and engineers discover, accept, and complete work. The app must feel like a large national platform, not a small listing website.

Brand direction:
- Premium tech purple design system
- White base with soft purple gradients, glassmorphism accents, floating cards, trust-led typography, and security-tech visual language
- Modern, polished, scalable, business-ready interface
- Clean but bold navigation
- English-first interface with visible Hindi-ready multilingual support

Core business:
- Clients can sign up, sign in, post jobs, browse job feeds, discover engineers, manage projects, view client-site details, pay securely, and follow up with calls and emails
- Engineers can sign up, sign in, create profiles, verify service categories, browse nearby jobs, apply to jobs, view earnings, manage active work, and receive payouts
- Admin can manage verification, jobs, regions, language controls, live metrics, payment oversight, and moderation

Core service domains:
- Fire Safety
- CCTV Camera Installation and Service
- Access Control
- Data Networking

Coverage:
- Pan-India
- City-based and area-based job discovery
- Nearby jobs based on location
- Services visible by city and region

Design the full product structure with these screens:
- Public: Home, Job Feed, Engineer Discovery, Job Detail, Services, City Discovery, Login, Signup
- Authenticated: Client Dashboard, Engineer Dashboard, Job Posting, My Jobs, Applications, Payments, Payouts, Messages and Follow-up, Profile, Settings
- Admin: User Verification, Job Moderation, City Insights, Payment Oversight, Live Platform Metrics, Language Controls

Essential product behavior the UI must communicate:
- Clients and engineers are equally important personas
- Job cards show payout, posted budget, urgency, category, city, area, site details, language, client trust markers, and follow-up contacts
- Location is a core feature, not a secondary filter
- Payments must feel highly secure and UPI-first, with escrow-like trust cues, secure badges, payment confirmation states, and payout states
- The experience must support both work discovery and service trust

Signature live interface requirement:
- Add a visually appealing floating center live stats hub that continuously shows real-time platform activity
- Show metrics like engineers joining daily, clients joining, active jobs, jobs completed, engineers working now, and business trust indicators
- Add a second rotating business review spotlight widget showing client reviews, company credibility, service reputation, and business profile highlights across India
- These widgets should feel animated, premium, trustworthy, and central to the product identity without looking spammy
- Include minimize, dismiss, auto-rotate, and hover-expand behavior

Navigation and UX:
- Friendly, intuitive navigation
- Easy movement between hiring and working flows
- Clear role switching and role-based dashboard states
- Strong mobile responsiveness
- High information density without clutter

Output:
- Create a full visual concept system for the app
- Show consistent UI patterns for public pages, dashboards, lists, detail pages, and admin tools
- Make the result feel like an ambitious marketplace plus operations platform for India's ELV and security industry
```

## Public Marketing Prompt

```text
Design the public-facing marketing and discovery experience for ELV Connect, a premium India-wide ELV and security services marketplace.

Audience:
- Clients who want to post jobs and hire verified engineers
- Engineers who want to discover jobs, register, and earn
- Both audiences should feel equally welcomed

Visual direction:
- Premium tech purple theme
- Soft gradients, glass cards, floating elements, subtle motion, strong trust visuals
- Clean white base with rich purple highlights
- Modern, high-conversion, enterprise-grade but user-friendly

Homepage goals:
- Make it immediately clear that clients can post jobs and engineers can find work
- Show India-wide service coverage
- Highlight fire safety, CCTV, access control, and data networking as the core service categories
- Emphasize secure payments, UPI support, location-led discovery, fast follow-up, and verified professionals

Required homepage sections:
- Hero with dual primary CTAs: Post a Job and Find Work
- Trust bar with secure UPI payments, pan-India support, verified engineers, multilingual support
- Service categories section for Fire Safety, CCTV, Access Control, Data Networking
- Nearby jobs by city and region discovery section
- Engineer discovery preview with verified profiles
- Client trust and business credibility section
- Reviews and reputation section
- How it works for clients
- How it works for engineers
- Multilingual language switcher preview
- Fast follow-up contact section with phone and email
- Strong footer with city/service links and trust content

Required interactive centerpiece:
- Add a live floating center stats hub that continuously displays:
  engineers joining today,
  clients joining,
  jobs posted today,
  active jobs,
  engineers currently working
- Add a rotating business spotlight popup near the center that shows:
  verified business profiles,
  client reviews,
  top services in India,
  company trust and service credibility
- Make both live widgets polished, premium, animated, and central to the visual identity

Location requirements:
- Show city-based discovery
- Display jobs posted in the user's area
- Include India map or location selector feel
- Make nearby services a visible differentiator

Tone:
- Premium, trustworthy, ambitious, national-scale
- Not a local classifieds website
- More like a modern security-tech marketplace platform

Output:
- Create a complete public website UI concept including homepage, job feed preview, engineer discovery preview, city discovery experience, and conversion-first CTA hierarchy
```

## Product Dashboard Prompt

```text
Design the authenticated ELV Connect product dashboard experience for three roles: client, engineer, and admin.

Design language:
- Premium purple security-tech UI
- Elegant dashboards with floating cards, data-rich panels, structured tables, clear filters, and modern status badges
- Strong usability on desktop and mobile

Client dashboard requirements:
- Overview with live jobs, recent postings, active engineers, payment status, follow-up tasks, and city-based job performance
- Post a new job flow with full site details, client details, service category, area, language, urgency, budget, and expected earnings/payout visibility
- My Jobs section
- Applications received
- Engineer shortlist
- Secure payments panel with UPI-first states
- Messages and follow-up contact center
- Client profile and business information

Engineer dashboard requirements:
- Nearby jobs feed based on city and area
- Recommended jobs by specialization
- Active applications
- Accepted work
- Earnings summary
- Payout section
- Verification status
- Service profile management
- Reviews and trust rating
- Messages and follow-up communication area

Admin dashboard requirements:
- Engineers joining daily
- Clients joining daily
- Jobs posted by region
- Active work and completion metrics
- User verification queue
- Job moderation tools
- Payment oversight
- UPI transaction monitoring states
- Language controls
- Region and city insights across India
- Live platform metrics widgets

Core UI requirements across dashboards:
- Role-based sidebar or top navigation
- Strong search, filters, status chips, and action buttons
- Job cards must show payout, budget, category, urgency, city, area, trust level, and client/site context
- Profile views must include contact information, service coverage, trust signals, and business details
- Payment screens must feel extremely secure and UPI-first

Essential shared live widget behavior:
- Floating center live stats hub persists across key dashboard screens in a reduced but visible form
- Rotating business review spotlight can appear as a center overlay card, smart toast, or expandable live module
- Keep it useful and premium, not distracting

Multilingual support:
- Show language switcher in dashboard chrome
- Keep layouts translation-ready for Hindi and future Indian languages

Output:
- Create a complete dashboard design system covering overview, feeds, posting flows, payments, profiles, analytics, and admin controls for all three roles
```

## Component and Interaction Prompt

```text
Design the key interaction components for ELV Connect, a premium purple security-tech web app for clients and engineers across India.

Create a component set for:
- Floating center live stats hub
- Rotating business review spotlight popup
- City and location selector
- Nearby jobs discovery card
- Job card with payout, budget, site details, client info, urgency, city, area, language, and trust markers
- Secure UPI payment module
- Payout status card
- Language switcher
- Verification badge system
- Contact follow-up card with phone and email actions

Component behavior requirements:
- The floating center live stats hub must continuously update and feel premium, smooth, and trustworthy
- The stats hub should show engineers joining daily, clients joining, active jobs, jobs completed, and engineers currently working
- The business spotlight popup should rotate through business profile reviews, client reputation, top services, and trust indicators across India
- Both center widgets should support minimize, dismiss, auto-rotate, and re-expand behavior
- The city selector should feel highly important, not hidden in filters
- The nearby jobs components should make local discovery feel fast and useful
- UPI payment components should include secure state visuals, trust badges, payment confirmation, escrow-like safety cues, and payout progress
- Language switcher should visibly support English-first with Hindi-ready UI

Visual style:
- White and soft purple base
- Glass panels, soft shadows, premium rounded corners, subtle motion
- Strong contrast for trust, safety, and status
- Elegant, modern, business-ready presentation

Responsiveness:
- All components must work for desktop, tablet, and mobile
- On mobile, the center live widget should become a smaller floating smart card without losing importance

Output:
- Create a cohesive component and interaction library that feels consistent with a national-scale, trust-first ELV/security marketplace
```

## Stitch Acceptance Checklist

Use this checklist when reviewing Stitch output:

- The homepage clearly supports both clients and engineers.
- The app visibly feels pan-India and location-first.
- Fire safety, CCTV, access control, and data networking are easy to spot.
- The design includes a central live widget with real-time platform activity.
- The design includes a rotating review or business spotlight widget.
- Job cards communicate budget, payout, city, area, urgency, and trust.
- Secure UPI payment states are clearly visible.
- The dashboard supports client, engineer, and admin experiences.
- The UI feels premium purple security-tech, not generic marketplace UI.
- The design is easy to navigate on mobile and desktop.

## Notes for Refinement

If Stitch gives a generic result, refine with one of these follow-ups:

- “Make the UI feel more like a national security-tech marketplace and less like a freelance job board.”
- “Increase the importance of live platform trust signals in the center of the experience.”
- “Make location and nearby jobs a hero feature across the product.”
- “Push the purple premium ELV brand identity further with stronger visual cohesion.”
- “Strengthen the UPI-first trust and payment safety design.”
