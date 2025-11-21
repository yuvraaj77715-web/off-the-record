# Custom Domain Integration Guide
## Connecting off-the-record.42web.io to Railway

This guide will help you connect your InfinityFree custom domain to your Railway deployment.

---

## Overview

- **Custom Domain**: `https://off-the-record.42web.io`
- **Railway URL**: `https://off-the-record-production.up.railway.app`
- **Goal**: Access your app via the custom domain

---

## Step 1: Add Custom Domain in Railway

### 1.1 Access Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Open your **off-the-record** project
3. Click on your service
4. Navigate to **Settings** → **Networking**

### 1.2 Add Custom Domain

1. In the **Custom Domains** section, click **"+ Custom Domain"**
2. Enter: `off-the-record.42web.io`
3. Click **"Add Domain"**

### 1.3 Get DNS Configuration

Railway will show you the DNS records you need to add. It will look something like:

**For Root Domain (if using):**
```
Type: A
Name: @
Value: [Railway IP Address]
```

**For Subdomain:**
```
Type: CNAME
Name: off-the-record (or @)
Value: off-the-record-production.up.railway.app
```

> **Note**: Railway will provide the exact values. Copy them for the next step.

---

## Step 2: Configure DNS in InfinityFree

### 2.1 Access InfinityFree Control Panel

1. Go to [InfinityFree Control Panel](https://app.infinityfree.com/)
2. Log in to your account
3. Find your domain `off-the-record.42web.io`
4. Click **"Manage"** or **"DNS Settings"**

### 2.2 Add DNS Records

**Option A: If Railway provides CNAME record**

1. Click **"Add DNS Record"** or **"Manage DNS"**
2. Add a CNAME record:
   - **Type**: `CNAME`
   - **Name**: `@` (or leave blank for root domain)
   - **Value**: `off-the-record-production.up.railway.app`
   - **TTL**: `3600` (or default)
3. Click **"Save"** or **"Add Record"**

**Option B: If Railway provides A record**

1. Add an A record:
   - **Type**: `A`
   - **Name**: `@`
   - **Value**: `[Railway IP Address from Step 1.3]`
   - **TTL**: `3600`
2. Click **"Save"**

### 2.3 Important Notes for InfinityFree

⚠️ **InfinityFree Limitations:**
- InfinityFree may not support CNAME records for root domains
- You might need to use their nameservers
- Some DNS features may be restricted on free hosting

**If DNS management is restricted:**
1. You may need to use InfinityFree's **Cloudflare integration**
2. Or consider using a subdomain like `app.off-the-record.42web.io`

---

## Step 3: Alternative - Use Cloudflare (Recommended)

If InfinityFree's DNS is limited, use Cloudflare as a free DNS proxy:

### 3.1 Sign Up for Cloudflare

1. Go to [cloudflare.com](https://www.cloudflare.com/)
2. Sign up for a free account
3. Click **"Add a Site"**
4. Enter: `42web.io` (your base domain)

### 3.2 Update Nameservers

1. Cloudflare will provide nameservers like:
   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```
2. Go to InfinityFree control panel
3. Update your domain's nameservers to Cloudflare's nameservers
4. Wait 24-48 hours for propagation

### 3.3 Add DNS Record in Cloudflare

1. In Cloudflare dashboard, go to **DNS** → **Records**
2. Add a CNAME record:
   - **Type**: `CNAME`
   - **Name**: `off-the-record`
   - **Target**: `off-the-record-production.up.railway.app`
   - **Proxy status**: ☁️ Proxied (orange cloud)
   - **TTL**: Auto
3. Click **"Save"**

### 3.4 Configure SSL/TLS

1. In Cloudflare, go to **SSL/TLS**
2. Set SSL/TLS encryption mode to: **"Full (strict)"**
3. Enable **"Always Use HTTPS"**

---

## Step 4: Verify Domain Configuration

### 4.1 Check DNS Propagation

Use online tools to verify DNS changes:
- [whatsmydns.net](https://www.whatsmydns.net/)
- Enter: `off-the-record.42web.io`
- Check if it points to Railway

### 4.2 Test in Railway

1. Go back to Railway dashboard
2. Check if the custom domain shows as **"Active"** or **"Verified"**
3. Railway will automatically provision SSL certificate

### 4.3 Access Your App

Once DNS propagates (5 minutes to 48 hours):
1. Visit: `https://off-the-record.42web.io`
2. It should redirect to your Railway app
3. SSL certificate should be active (🔒 in browser)

---

## Troubleshooting

### Domain Not Working

**Check DNS propagation:**
```bash
nslookup off-the-record.42web.io
```

**Common issues:**
- DNS not propagated yet (wait 24-48 hours)
- Wrong DNS record type (use CNAME for Railway)
- InfinityFree DNS restrictions (use Cloudflare)

### SSL Certificate Issues

- Railway auto-provisions SSL via Let's Encrypt
- May take 5-10 minutes after DNS verification
- Ensure Railway shows domain as "Active"

### InfinityFree Restrictions

If InfinityFree blocks external DNS:
1. Use Cloudflare (recommended)
2. Or use Railway's provided subdomain
3. Or upgrade to a paid hosting provider

---

## Recommended Approach

**Best Option: Use Cloudflare**

✅ Free DNS management  
✅ Free SSL/TLS  
✅ DDoS protection  
✅ CDN for faster loading  
✅ No restrictions like InfinityFree  

**Steps:**
1. Add domain to Cloudflare
2. Update nameservers in InfinityFree
3. Add CNAME record in Cloudflare
4. Add custom domain in Railway
5. Wait for DNS propagation

---

## Summary

| Step | Action | Where |
|------|--------|-------|
| 1 | Add custom domain | Railway Dashboard |
| 2 | Get DNS records | Railway (CNAME or A record) |
| 3 | Add DNS record | InfinityFree or Cloudflare |
| 4 | Wait for propagation | 5 min - 48 hours |
| 5 | Verify domain | Railway Dashboard |
| 6 | Test access | Browser |

---

## Expected Timeline

- **DNS Configuration**: 5-10 minutes
- **DNS Propagation**: 5 minutes to 48 hours (usually 1-2 hours)
- **SSL Certificate**: Automatic after DNS verification
- **Total Time**: 1-48 hours

---

## Final Result

Once complete, users can access your app at:
- ✅ `https://off-the-record.42web.io` (custom domain)
- ✅ `https://off-the-record-production.up.railway.app` (Railway URL)

Both URLs will work and serve the same application with HTTPS! 🎉
