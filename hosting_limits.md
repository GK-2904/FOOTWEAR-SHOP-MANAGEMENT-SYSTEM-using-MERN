# Footwear Shop Management System - Hosting Guide & Free Tier Limits

This document outlines the free tier limitations and potential future costs for the three cloud services hosting your application: **Supabase** (Database), **Render** (Backend Server), and **Netlify** (Frontend Website).

---

## 1. Supabase (Database & Storage)
Supabase stores all of your shop's actual data, such as your brands, inventory numbers, generated bills, and admin accounts.

### What is included in your Free Plan?
- **500 MB of Database Space:** Your current shop data taking up less than 1 Megabyte (0.26 MB). You can store hundreds of thousands of bills before hitting this limit.
- **5 GB of Bandwidth / Month:** The amount of data moving in and out of the database.
- **50,000 Monthly Active Users:** The number of unique people logging in per month.

### When will I be charged?
You will **never be automatically charged** on the Free Plan. Supabase will simply pause your database if you exceed the limits.
- **Inactivity Pause:** If you do not log in or use your shop for **7 consecutive days**, Supabase will temporarily pause your database to save resources. You can unpause it for free from their website dashboard.
- **Pro Upgrade:** If you ever outgrow the 500 MB limit (which will take years) or need 24/7 un-pausable access without the 7-day rule, the standard "Pro" tier costs **$25 / month**.

---

## 2. Render (Backend Server)
Render runs the Node.js/Express "engine" of your application. It acts as the secure middleman between your frontend website and your Supabase database.

### What is included in your Free Plan?
- **750 Free Hours / Month:** This is enough to run the server entirely for a 31-day month (24 hours x 31 days = 744 hours).
- **100 GB of Bandwidth / Month:** The amount of traffic hitting your server.
- **Shared CPU & 512 MB RAM:** Enough power to quickly process your shop's daily bills and reporting.

### When will I be charged?
You will **never be automatically charged** on the Free Plan. 
- **The "Sleep" Rule:** If no one uses your shop website for **15 minutes**, Render will put your server to sleep to save your 750 free hours. 
- **Cold Starts:** Because of the sleep rule, the *very first time* you log in after 15 minutes of inactivity, it might take **30 to 60 seconds** for the server to wake up. After it is awake, it will be fast again.
- **Upgrade:** If you ever want your server to be instantly fast 24/7 without the 15-minute sleep delay, you can upgrade to Render's "Starter" tier for **$7 / month**.

---

## 3. Netlify (Frontend Website)
Netlify hosts the actual visual website (React/Tailwind) that you see and interact with in your browser window.

### What is included in your Free Plan?
- **100 GB of Bandwidth / Month:** Extremely high allocation for a private shop dashboard.
- **300 Build Minutes / Month:** The amount of time Netlify spends updating your site if you ever change the codebase.

### When will I be charged?
You will **never be automatically charged** as your traffic is vastly below the heavy limits. 
- A standard physical retail shop dashboard will realistically never exceed 100 GB of monthly frontend bandwidth.
- If you were to somehow exceed 100 GB, Netlify requires a manual upgrade payment to continue serving the extra traffic, starting around **$19 / month** for the "Pro" tier (though they often simply charge a $55 overage fee for the next 100GB). You are incredibly safe from this.

---

### **Summary Conclusion**
Your physical shop's management system is designed to uniquely maximize three separate free tiers. 
You are **currently paying $0.00 / month**. If you ever wish to remove the minor inconveniences (like the Render 15-minute sleep delay or the Supabase 7-day inactivity pause), the cheapest path is to upgrade Render ($7/month) and keep Supabase and Netlify on their free tiers!
