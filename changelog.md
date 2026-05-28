# Changelog

All notable changes to the Bagisto Headless Electronic Theme will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-05-26

### Added

- Initial project setup with Next.js 16 and React 19
- App Router architecture with `(public)` and `(checkout)` route groups
- Bagisto GraphQL API integration via Apollo Client
- Full e-commerce feature set:
  - Product catalog with filters and sorting
  - Product detail pages with image galleries and variant selection
  - Shopping cart (add, update, remove items)
  - Wishlist management
  - Product comparison
  - Guest and authenticated checkout flow
  - Multiple payment method support
  - Order tracking
- Customer account features:
  - Registration and login via NextAuth.js
  - Profile and address management
  - Order history
  - Product reviews
- Redux Toolkit for global state management
- Tailwind CSS 4 for styling
- Dark mode support via `next-themes`
- HeroUI component library integration
- Framer Motion animations
- TypeScript throughout with custom type definitions
- Fully responsive, mobile-first design
- Accessibility compliant components
- Image optimization with Next.js Image
- GraphQL query caching
- Speculation rules for route prefetching
- ESLint configuration with Next.js rules
- Environment variable template (`.env.template`)
