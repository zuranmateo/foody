# Foody

Foody is a modern restaurant ordering platform built with Next.js, Sanity, NextAuth, Tailwind CSS, and PayPal Sandbox. It combines a customer-facing food ordering experience with an admin dashboard for managing dishes, ingredients, orders, and communication.

## Highlights

- Customer menu with categorized dishes and featured meals
- Local cart flow with checkout preview
- PayPal Sandbox payment integration
- Account system with credentials login and GitHub OAuth
- User profile and order history
- Admin dashboard for restaurant operations
- Sanity Studio embedded directly inside the app

## Built With

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- NextAuth v5 beta
- Sanity CMS
- PayPal Sandbox
- Resend

## Preview

Main areas of the app:

- `/` landing page
- `/menu` dish browsing experience
- `/cart` cart review
- `/order` checkout flow
- `/login` and `/register` authentication
- `/user/[id]` customer account page
- `/control` admin dashboard
- `/studio` Sanity Studio

## Features

### Customer Experience

- Browse dishes by category
- View popular dishes
- Add meals to cart
- Review cart totals
- Complete payment through PayPal Sandbox
- Access profile and previous orders
- Download receipts

### Admin Experience

- View dashboard stats
- Manage dishes
- Manage ingredients
- Track and update orders
- Contact users by email
- Review recent activity


## Environment Variables

Create a `.env.local` file in the root of the project:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000

NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
NEXT_PUBLIC_SANITY_API_VERSION=2026-04-07
SANITY_WRITE_TOKEN=

GITHUB_ID=
GITHUB_SECRET=

NEXT_PUBLIC_PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=

RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Add the required values to `.env.local`.

### 3. Run the development server

```bash
npm run dev
```

### 4. Open the app

Visit `http://localhost:3000`.

## Authentication

Foody uses [NextAuth](C:/xampp/htdocs/RO/foody/auth.ts) for authentication.

Supported methods:

- Email and password
- GitHub OAuth

User role data is stored in Sanity and used to control admin access.

## Sanity CMS

Sanity is used as the content and application data layer.

Current schema areas include:

- users
- dishes
- ingredients
- orders
- reviews
- sentEmails

The Sanity Studio is available at `/studio`.

## Payments

Checkout is powered by PayPal Sandbox.

- Cart data is collected from local storage
- Checkout is previewed server-side before payment starts
- PayPal order creation and capture happen through API routes
- Successful capture creates an order and can trigger confirmation email sending
- Receipts are available through the receipt endpoint

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Notes

- This repository uses a newer Next.js version than many tutorials and examples.
- Local Next.js docs are available in `node_modules/next/dist/docs/`.
- Sanity write operations require `SANITY_WRITE_TOKEN`.
- PayPal should use sandbox credentials during development.

## Future Improvements

- Add screenshots or GIF previews
- Add automated tests
- Improve type safety around query results
- Continue unifying older UI sections with the newer design system
