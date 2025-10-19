# Deployment Instructions

## GitHub Pages Setup

To enable the live demo at https://gabeperez.github.io/underground-ascent:

### Method 1: GitHub Web Interface (Recommended)

1. Go to your repository: https://github.com/gabeperez/underground-ascent
2. Click **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **"GitHub Actions"**
5. The workflow will automatically trigger and deploy the game

### Method 2: GitHub CLI (if the feature becomes available)

```bash
# This may work in future versions of gh CLI
gh repo edit --enable-pages --pages-source-branch main
```

## Manual Deployment Verification

After setting up Pages, the GitHub Action workflow should:

1. Copy `src/` directory to `public/src/`
2. Update file paths for web deployment
3. Deploy the `public/` directory to GitHub Pages

## Alternative Hosting Options

### Netlify
1. Connect your GitHub repository to Netlify
2. Set publish directory to `public`
3. Add build command: `cp -r src public/`

### Vercel
1. Import your GitHub repository
2. Set output directory to `public`
3. Add build command: `cp -r src public/`

### Cloudflare Pages
```bash
npx wrangler pages project create underground-ascent
npx wrangler pages deploy public
```

## Local Development

```bash
git clone https://github.com/gabeperez/underground-ascent.git
cd underground-ascent
npm run dev
```

Open http://localhost:8000