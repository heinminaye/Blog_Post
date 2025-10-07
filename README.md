# 📝 Blog Post – Full Stack Next.js Blogging Platform

A modern **full-stack blogging platform** built entirely with **Next.js**.  
It features **secure cookie-based admin authentication**, **Cloudinary image uploads**, and **Framer Motion animations** — all styled with **Tailwind CSS**.  
Admins can log in through a protected dashboard to create and manage blog posts, while users enjoy a fast, responsive, and SEO-friendly blog experience.

🔗 **Live Demo:** [https://blog-post-xi-eosin.vercel.app/](https://blog-post-xi-eosin.vercel.app/)

---

## 🚀 Features

- 🔐 **Admin Authentication (HTTP-only Cookies)**  
  - Only admins can log in and manage posts.  
  - Authentication is handled with **secure HTTP-only cookies**, preventing client-side access and XSS attacks.  
  - Protected routes ensure only authorized admins can access the dashboard.  
  - Admin login page: `/admin/login`

- 🌄 **Image Uploads via Cloudinary**  
  - Integrated with **Cloudinary** for seamless image uploading and optimization.  
  - Automatically handles image storage, compression, and CDN delivery.

- 🧠 **Full Stack in One App**  
  - Uses **Next.js API routes** for backend logic, authentication, and uploads.  
  - Data managed with **MongoDB (Mongoose)**.  
  - Includes a seeding script to create an admin user securely.

- 🖼️ **Framer Motion Animations**  
  - Adds fluid transitions and modern motion effects to improve UX.

- 🗂️ **Dynamic Routing & SEO**  
  - Each blog post has a unique, SEO-friendly URL and meta tags.

- 📱 **Responsive Design**  
  - Built with **Tailwind CSS**, ensuring full mobile and desktop compatibility.

- ☁️ **Deployed on Vercel**  
  - Fast, scalable, and globally distributed hosting.

---

## 🛠️ Tech Stack

| Category | Technologies |
|-----------|---------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Database | MongoDB (Mongoose) |
| Authentication | Cookie-based (HTTP-only secure sessions) |
| Image Hosting | Cloudinary |
| Deployment | Vercel |
| Tools | Git, GitHub, ESLint, Prettier |

---

## ⚙️ Installation

```bash
# 1. Clone this repository
git clone https://github.com/heinminaye/blog_post.git
cd blog_post

# 2. Install dependencies
npm install

# 3. Add environment variables
# Create a file named .env.local and add:
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_URL=your_cloudinary_url
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password

# 4. Seed the admin user
npm run seed:admin

# 5. Run the development server
npm run dev
