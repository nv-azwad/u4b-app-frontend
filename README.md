# Upcycle4Better (U4B) - Frontend

A modern, mobile-first web application for **Upcycle4Better** — a sustainability platform that gamifies textile donation through a voucher reward system. Users donate unwanted fabrics at collection bins and earn vouchers redeemable at partner businesses.

> Built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

## Features

### User Features
- **Dashboard** — Donation stats, impact metrics, and quick actions
- **Donation Flow** — QR code scanning, video recording (max 15s), fabric count tracking, and GPS-based location verification
- **Find Bins** — Search and discover nearby collection bins with Google Maps integration and real-time distance calculation
- **Voucher System** — Claim and manage reward vouchers from partner businesses
- **Donation History** — Track all donations with status filtering (pending, approved, rejected)
- **User Profile** — Account management with password change support

### Admin Features
- **Admin Dashboard** — Platform overview with pending reviews, approval stats, user counts, and health metrics
- **Pending Reviews** — Review donations with video preview, GPS distance verification, and approve/reject workflow
- **User Management** — View and manage all registered users
- **Donations Log** — Complete filterable donation history

### Authentication
- Email/password registration with email verification
- Forgot password with OTP-based reset
- JWT-based session management

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| [Next.js](https://nextjs.org/) | 16.0.7 | React framework with App Router |
| [React](https://react.dev/) | 19.2.3 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first styling |
| [Lucide React](https://lucide.dev/) | 0.553 | Icon library |

## Project Structure

```
app/
├── page.tsx                 # Splash screen
├── layout.tsx               # Root layout with navigation
├── globals.css              # Global styles & animations
├── dashboard/               # User dashboard
├── donation/                # Donation recording flow
├── bins/                    # Bin location finder
├── voucher/                 # Voucher management
│   └── [id]/                # Individual voucher view
├── history/                 # Donation history
├── profile/                 # User profile & password change
│   └── change-password/
├── login/                   # Login & registration
├── forgot-password/         # Password recovery
├── reset-password/          # OTP-based password reset
├── verify-email/            # Email verification
└── admin/                   # Admin panel
    ├── pending/             # Donation review queue
    ├── users/               # User management
    ├── donations/           # All donations log
    └── settings/            # Admin settings

components/
├── Navigation.tsx           # Bottom navigation bar
├── AdminNav.tsx             # Admin navigation toggle
├── PageTransition.tsx       # Page transition animations
└── Toast.tsx                # Toast notification system

hooks/
└── useToast.ts              # Toast notification hook

lib/
├── auth.ts                  # Auth helpers (token management, API calls)
└── voucherdata.ts           # Voucher data utilities
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/nv-azwad/u4b-app-frontend.git
cd u4b-app-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Environment Variables

See [`.env.example`](.env.example) for required configuration.

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |

## Related

- **Backend API** — [u4b-app-backend](https://github.com/nv-azwad/u4b-app-backend)

## License

All rights reserved. This source code is made publicly available for portfolio and demonstration purposes only. See [LICENSE](LICENSE) for details.
