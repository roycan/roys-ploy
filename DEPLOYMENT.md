# Deployment Guide for Roy's Ploy

## Quick Deployment to GitHub Pages

### Step 1: Initialize Git Repository (if not already done)

```bash
cd /home/roy/Documents/Git-projs/roys-ploy
git init
git add .
git commit -m "Initial commit: Roy's Ploy MVP"
```

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click **New Repository** (or visit https://github.com/new)
3. Repository name: `roys-ploy`
4. Description: "A strengths-driven companion for sustainable long-term projects"
5. Visibility: **Public** (required for free GitHub Pages)
6. **Do NOT** initialize with README (we already have one)
7. Click **Create repository**

### Step 3: Connect Local Repo to GitHub

```bash
git remote add origin https://github.com/<your-username>/roys-ploy.git
git branch -M main
git push -u origin main
```

### Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. In the left sidebar, click **Pages**
4. Under "Source":
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**

### Step 5: Wait for Deployment

- GitHub Actions will build and deploy your site (usually takes 1-2 minutes)
- You'll see a green checkmark when it's ready
- Your site will be live at: `https://<your-username>.github.io/roys-ploy`

### Step 6: Test Live Site

1. Visit your GitHub Pages URL
2. Test on desktop browser
3. Test on mobile device (highly recommended!)
4. Run through the smoke test in `TESTING.md`

### Step 7: (Optional) Custom Domain

If you have a custom domain:

1. Add a `CNAME` file to the root:
   ```bash
   echo "roysploy.yourdomain.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```

2. Configure DNS:
   - Add a CNAME record pointing to `<your-username>.github.io`
   - Or add A records for GitHub Pages IPs

3. In GitHub Settings → Pages:
   - Enter your custom domain
   - Enable "Enforce HTTPS"

---

## Alternative: Deploy to Other Platforms

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd /home/roy/Documents/Git-projs/roys-ploy
netlify deploy --prod
```

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd /home/roy/Documents/Git-projs/roys-ploy
vercel --prod
```

### Cloudflare Pages

1. Connect your GitHub repository
2. Build settings:
   - Build command: (leave empty)
   - Build output directory: `/`
3. Deploy

---

## Post-Deployment Checklist

- [ ] Site loads without errors
- [ ] All navigation works
- [ ] Data persists across sessions
- [ ] Backup/restore works
- [ ] Calendar exports download correctly
- [ ] Mobile layout is responsive
- [ ] FAB and bottom nav function properly
- [ ] No console errors in browser DevTools

---

## Updating the App

After making changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

GitHub Pages will automatically redeploy (takes 1-2 minutes).

---

## Sharing Your App

Once deployed, share with others:

- Direct link: `https://<username>.github.io/roys-ploy`
- QR code: Generate at https://www.qr-code-generator.com
- Social: Tweet, blog post, or forum thread about your approach
- Install on phone: On iOS/Android, open in browser → Add to Home Screen

---

## Monitoring & Feedback

- **GitHub Issues**: Enable issues for bug reports and feature requests
- **Analytics** (optional): Add privacy-friendly analytics like Plausible or Simple Analytics
- **Feedback form**: Consider adding a simple feedback link in Settings → About

---

## Backup Recommendation for Users

Include this in your app's help text or README:

> **Backup Strategy**
> 
> 1. Go to Settings weekly
> 2. Download Backup (JSON)
> 3. Save to pCloud, Dropbox, or another cloud folder
> 4. On mobile, use "Share Backup" to send to Files app or cloud storage
> 
> Your data is stored locally in your browser. Regular backups ensure you never lose progress!

---

**You're ready to deploy!** 🚀

Run the git commands above, enable GitHub Pages, and your app will be live in minutes.
