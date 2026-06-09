<p align="center">
  <a href="https://bagisto.com/en/headless-ecommerce/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/bagisto/temp-media/0b0984778fae92633f57e625c5494ead1fe320c3/dark-logo-P5H7MBtx.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://bagisto.com/wp-content/themes/bagisto/images/logo.png">
      <img src="https://bagisto.com/wp-content/themes/bagisto/images/logo.png" alt="Bagisto logo">
    </picture>
  </a>
</p>

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

# Bagisto Headless Electronic Theme

A **headless electronic eCommerce theme** built with **Next.js** and powered by **Bagisto**, designed specifically for electronics and gadget retailers. This theme delivers exceptional performance, modern UI, and a seamless shopping experience tailored to tech-focused stores.

Through layered caching and optimized rendering strategies, it consistently achieves a **100/100 Core Web Vitals score**, delivering lightning-fast performance and seamless shopping experiences.

Check the [Documentation](https://headless-doc.bagisto.com/) to quickly set up your Headless eCommerce store.

**Bagisto Version:** v2.4.x

**Bagisto API:** v1.0.3

![Bagisto Headless Electronic Theme — Home](./public/images/readme/home.png)

---

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

![Bagisto Headless Electronic Theme — Performance](./public/images/readme/performance.png)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and **pnpm**
- Check Bagisto [backend requirement detail](https://devdocs.bagisto.com/2.3/introduction/requirements.html#server-configuration)

---

## Installation

1. **Install Bagisto**

   Begin by [installing the Bagisto](https://devdocs.bagisto.com/) eCommerce platform on your server or local environment.

2. **Install the Bagisto Headless Extension**

   After installing Bagisto, install the [Bagisto Headless Extension](https://github.com/bagisto/bagisto-api) to expose the required APIs for your frontend.

3. **Clone the repository and install dependencies:**

   ```bash
   git clone https://github.com/bagisto/nextjs-electronic-theme.git
   cd nextjs-electronic-theme
   pnpm install
   ```

4. **Configure `.env.local` in the Next.js Project**

   In your Next.js frontend project, create or update your `.env.local` file with the following variables:

   | Variable | Description | Example |
   |----------|-------------|---------|
   | `NEXT_PUBLIC_BAGISTO_ENDPOINT` | Enter Your Bagisto Shop URL | `https://your-store.bagisto.com/` |
   | `NEXT_PUBLIC_BAGISTO_STOREFRONT_KEY` | Enter Your Bagisto Storefront Key | `pk_storefront_*************************` |
   | `NEXTAUTH_URL` | Enter Your Headless Shop URL | `https://headless-store.com/` |
   | `NEXTAUTH_SECRET` | Enter Your Headless Shop Secret | Generate with `openssl rand -base64 32` |
   | `COMPANY_NAME` | Enter Your company name | Electronics Store |

   > **Important Notes**
   > - Use the environment variables defined in `.env.example` as a reference.
   > - It's recommended to use **Vercel Environment Variables**, but a `.env.local` file is sufficient for local development.
   > - **Never commit your `.env.local` file** to version control — it contains secrets that would allow others to control your Bagisto store.

---

## Getting Started

**Run the development server:**

```bash
npm dev
```

Access the store at: [http://localhost:3000](http://localhost:3000)

**Build for production:**

```bash
npm build
npm start
```

---

## Deployment

### Deploy to Vercel

Install the Vercel CLI:

```bash
npm i -g vercel
```

Link your local instance with Vercel and GitHub accounts (creates the `.vercel` directory):

```bash
vercel link
```

Download your environment variables:

```bash
vercel env pull
```

---

## Products

Browse a comprehensive range of electronic products with built-in pagination and advanced search functionality. Each product features detailed pages with multiple images, specifications, pricing, availability, customer reviews, and ratings.

Bagisto Headless Commerce APIs support multiple product types, including simple, configurable, bundled, and downloadable products, ensuring flexibility for different business needs.

![Bagisto Headless Electronic Theme — Product Page](./public/images/readme/product.png)

---

## Categories

Products are organized into hierarchical categories, making it easy for customers to navigate your electronics store. Each category page displays relevant product listings with filtering and sorting options for a better shopping experience.

The theme also ensures SEO-friendly category URLs with meta titles, descriptions, and breadcrumbs for improved discoverability.

![Bagisto Headless Electronic Theme — Category Page](./public/images/readme/category.png)

---

## Checkout

The checkout process is fully functional, featuring complete cart management where customers can add, update, or remove items.

Both guest and logged-in users can proceed through checkout, selecting shipping addresses and preferred payment methods. Once the order is placed, it is instantly synchronized with the Bagisto backend for smooth order processing and management.

![Bagisto Headless Electronic Theme — Cart & Checkout](./public/images/readme/checkout.png)

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
