# nextjs-electronic-theme

A modern electronics eCommerce theme built with **Bagisto Headless Commerce** and **Next.js**, featuring a responsive UI, fast performance, product-focused layouts, and a scalable storefront architecture for electronic and gadget stores.

<p align="center">
    <a href="https://bagisto.com/en/headless-ecommerce/">Website</a> | <a href="https://bagisto.com/en/bagisto-headless-ecommerce-installation-guide/">Documentation</a> | <a href="https://forums.bagisto.com/">Forums</a> | <a href="https://www.facebook.com/groups/bagisto/">Community</a>
</p>

<p align="center">
    <a href="https://twitter.com/intent/follow?screen_name=bagistoshop"><img src="https://img.shields.io/twitter/follow/bagistoshop?style=social"></a>
    <a href="https://www.youtube.com/channel/UCbrfqnhyiDv-bb9QuZtonYQ"><img src="https://img.shields.io/youtube/channel/subscribers/UCbrfqnhyiDv-bb9QuZtonYQ?style=social"></a>
</p>

<p align="center">
    <a href="https://packagist.org/packages/bagisto/bagisto"><img src="https://poser.pugx.org/bagisto/bagisto/license.svg" alt="License"></a>
</p>

## Overview

A **headless eCommerce theme** built with **Next.js** and powered by **Bagisto**, designed specifically for electronics and gadget retailers. This theme delivers exceptional performance and a modern shopping experience optimized for tech products.

Through layered caching and optimized rendering strategies, it consistently achieves a **100/100 Core Web Vitals score**, delivering lightning-fast performance and seamless shopping experiences.

Check the [Documentation](https://headless-doc.bagisto.com/) to quickly set up your Headless eCommerce store.

**Bagisto Version:** v2.4.x

**Bagisto API:** v1.0.3

## Features

- **Ultra-fast storefront** with 100/100 Core Web Vitals score.  
- **Layered caching** for API responses and page rendering.  
- Fully **responsive and mobile-friendly** design optimized for electronics.  
- SEO optimized with meta tags, OpenGraph, and Twitter cards.  
- Secure authentication via **NextAuth.js**.  
- Powered by **Bagisto** GraphQL APIs for robust commerce functionality.  
- **Incremental Static Regeneration (ISR)** with revalidation.
- Product-focused layouts tailored for electronics and gadgets.
- Advanced filtering and search for tech products.
- Support for multiple product types (simple, configurable, bundled, downloadable).

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and **pnpm**
- Check Bagisto [backend requirement detail](https://devdocs.bagisto.com/2.3/introduction/requirements.html#server-configuration)

---

## Installation

1) **Install Bagisto**
 
    Begin by [installing the Bagisto](https://devdocs.bagisto.com/) eCommerce platform on your server or local environment.

2) **Install the Bagisto Headless Extension**

    After installing Bagisto, install the [Bagisto Headless Extension](https://github.com/bagisto/bagisto-api) to expose the required APIs for your frontend.

3) **Get your storefront up and running in one command:**
   
   ```bash
   npx -y @bagisto-headless/create your-storefront
   ```
   
4) **Configure `.env.local` in the Next.js Project**

   In your Next.js frontend project, create or update your `.env.local` file with the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_BAGISTO_ENDPOINT` | Enter Your Bagisto Shop URL | `https://your-store.bagisto.com/` |
| `NEXT_PUBLIC_BAGISTO_STOREFRONT_KEY` | Enter Your Bagisto Storefront Key | `pk_storefront_*************************` |
| `NEXTAUTH_URL` | Enter Your Headless Shop URL | `https://headless-store.com/` |
| `NEXTAUTH_SECRET` | Enter Your Headless Shop Secret | Generate with `openssl rand -base64 32` |
| `COMPANY_NAME` | Enter Your company name | Electronics Store |

**Important Notes**  
- You will need to use the environment variables defined in `.env.example` to run Next.js Commerce.  
- It's recommended to use **Vercel Environment Variables**, but a `.env` file is sufficient for local development.  
- **Never commit your `.env` file** to version control — it contains secrets that would allow others to control your Bagisto store.

---

## Deployment

### One-Click Deploy to Netlify

Click the button below to deploy your own copy of the Electronics Theme to Netlify instantly!

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/bagisto/nextjs-electronic-theme)

### Vercel Setup

Install the Vercel CLI:

```bash
npm i -g vercel
```

Link your local instance with Vercel and GitHub accounts (this creates the `.vercel` directory):

```bash
vercel link
```

Download your environment variables:

```bash
vercel env pull
```

---

## Getting Started

**Run the development server:**

```bash
pnpm dev
```

Access the store at: [http://localhost:3000](http://localhost:3000)

**Build for production:**

```bash
pnpm build
pnpm start
```

---

## Key Features

### Products

Browse a comprehensive range of electronic products with built-in pagination and advanced search functionality. Each product features:

- Detailed product pages with multiple images
- Comprehensive descriptions and specifications
- Pricing information and availability status
- Customer reviews and ratings
- Support for multiple product types (simple, configurable, bundled, downloadable)

### Categories

Products are organized into hierarchical categories, making it easy for customers to navigate your electronics store:

- Category-based filtering and sorting
- SEO-friendly category URLs with meta titles and descriptions
- Breadcrumb navigation for improved UX
- Customizable category layouts

### Checkout

A fully functional checkout process featuring:

- Complete cart management (add, update, remove items)
- Guest and logged-in user checkout options
- Shipping address selection
- Multiple payment methods support
- Instant order synchronization with Bagisto backend
- Smooth order processing and management

---

## Community

Get support and connect with the Bagisto community:

- [Facebook Group](https://www.facebook.com/groups/bagisto)
- [Forums](https://forums.bagisto.com/)
- [Documentation](https://headless-doc.bagisto.com/)

---

## License

Bagisto Headless eCommerce framework that will always remain free under the [MIT License](https://github.com/bagisto/nextjs-commerce/blob/main/license.md).

---

## Security Vulnerabilities

If you believe you have found a security issue in the Electronics Theme, please do not use the issue tracker and do not post it publicly. Instead, all security issues must be sent to [support@bagisto.com](mailto:support@bagisto.com).
