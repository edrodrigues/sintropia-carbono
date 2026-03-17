# GEO Implementation - Post-Deployment Checklist

## ✅ Phase 1: Deployment Complete

The feature branch `feature/geo-optimization` has been pushed to GitHub.
**PR URL**: https://github.com/edrodrigues/sintropia-carbono/pull/new/feature/geo-optimization

---

## 📋 Phase 2: Manual Steps Required

### Step 1: Create Pull Request

1. Visit: https://github.com/edrodrigues/sintropia-carbono/pull/new/feature/geo-optimization
2. Use the PR description from `.worktrees/geo-optimization/PR_DESCRIPTION.md`
3. Create PR targeting `main` branch
4. Merge after review (or merge directly if confident)

### Step 2: Deploy to Production

If using Vercel (automatic):
- Merge PR to main
- Vercel will auto-deploy

If manual deployment:
```bash
# After merging PR
git checkout main
git pull origin main
# Run your deployment command
```

---

## 🔍 Phase 3: Submit Sitemap to Search Engines

### Google Search Console

1. Go to: https://search.google.com/search-console
2. Select your property: `sintropia.space`
3. Navigate to: **Sitemaps** (left sidebar)
4. Enter sitemap URL: `https://sintropia.space/sitemap.xml`
5. Click **Submit**
6. Wait for "Success" status (usually within minutes)

### Bing Webmaster Tools

1. Go to: https://www.bing.com/webmasters
2. Sign in and select your site
3. Go to: **Sitemaps** → **Submit Sitemap**
4. Enter: `https://sintropia.space/sitemap.xml`
5. Click **Submit**

---

## ✅ Phase 4: Validate Structured Data

### Google Rich Results Test

Test these URLs:

#### 1. Homepage (Portuguese)
- **URL**: https://search.google.com/test/rich-results?url=https%3A%2F%2Fsintropia.space%2Fpt
- **Expected Results**:
  - ✅ Organization schema detected
  - ✅ WebSite schema detected
  - ✅ FAQ schema detected (4 questions)

#### 2. About Page (Portuguese)
- **URL**: https://search.google.com/test/rich-results?url=https%3A%2F%2Fsintropia.space%2Fpt%2Fsobre
- **Expected Results**:
  - ✅ FAQ schema detected (3 questions)

#### 3. Homepage (English)
- **URL**: https://search.google.com/test/rich-results?url=https%3A%2F%2Fsintropia.space%2Fen
- **Expected Results**:
  - ✅ Organization schema detected
  - ✅ FAQ schema detected

### Schema.org Validator

1. Go to: https://validator.schema.org/
2. Enter URL: `https://sintropia.space/pt`
3. Click **Run Test**
4. Verify no errors in:
   - Organization
   - WebSite
   - FAQPage

---

## 📊 Phase 5: Monitor for 7 Days

### Google Search Console Monitoring

Check daily for:

1. **Coverage Report**
   - Path: Index → Coverage
   - Look for: New pages indexed (/sobre, /contato)
   - Watch for: Any "Excluded" or "Error" status

2. **Rich Results Report**
   - Path: Enhancements → FAQs
   - Look for: Valid FAQ items increasing
   - Target: 7+ valid FAQ items

3. **Performance Report**
   - Path: Performance → Search Results
   - Track: 
     - Total impressions (should increase)
     - Average CTR (should improve)
     - New queries related to "carbon credits", "S-REC"

4. **Sitemap Report**
   - Path: Index → Sitemaps
   - Verify: All URLs submitted and indexed

### Bing Webmaster Tools Monitoring

1. Go to: https://www.bing.com/webmasters
2. Check: **Site Explorer** → **Indexed Pages**
3. Verify: New pages (/sobre, /contato) appear in index

---

## 🎯 Success Metrics to Track

After 7 days, check these metrics:

| Metric | Baseline | Target |
|--------|----------|--------|
| Homepage Word Count | 171 | 400+ ✅ |
| Valid FAQ Items in GSC | 0 | 7+ |
| Indexed Pages | ~50 | ~58 |
| Rich Results | 2 types | 5+ types |
| AI Crawl Rate | Low | Increased |

### AI Engine Testing

Test citations in AI engines after 1-2 weeks:

1. **ChatGPT** (chat.openai.com)
   - Ask: "What is the S-REC Index and how is it calculated?"
   - Look for: Sintropia citation

2. **Claude** (claude.ai)
   - Ask: "What carbon certifiers are monitored in Brazil?"
   - Look for: Sintropia citation

3. **Perplexity** (perplexity.ai)
   - Ask: "What is the global carbon credit volume in 2025?"
   - Look for: Sintropia citation with "5.2 Gt"

4. **Google Gemini** (gemini.google.com)
   - Ask: "Tell me about Sintropia carbon market intelligence"
   - Look for: Detailed response about platform

---

## 🚨 Troubleshooting

### Issue: Schema Not Detected
**Solution**: 
- Clear CDN cache (Cloudflare/Vercel)
- Wait 24-48 hours for re-crawl
- Check robots.txt allows crawlers

### Issue: Pages Not Indexed
**Solution**:
- Request manual indexing in GSC
- Check for noindex meta tags
- Verify canonical URLs correct

### Issue: Build Errors
**Solution**:
- Check Vercel deployment logs
- Ensure all environment variables set
- Verify no TypeScript errors: `npm run lint`

---

## 📅 Timeline

| Day | Action |
|-----|--------|
| 0 | Deploy PR, submit sitemaps |
| 1 | Validate structured data |
| 2-3 | Monitor initial crawl |
| 4-7 | Track indexing progress |
| 14 | Test AI engine citations |
| 30 | Full impact assessment |

---

## 📞 Support

If issues arise:
1. Check deployment logs
2. Validate HTML at: https://validator.w3.org/
3. Test mobile: https://search.google.com/test/mobile-friendly
4. Review Core Web Vitals: https://pagespeed.web.dev/

---

## Summary

✅ **Code Complete**: All GEO optimizations implemented
✅ **Build Passing**: No errors or warnings
✅ **Branch Pushed**: Ready for PR and merge
⏳ **Pending**: Manual deployment and monitoring steps above

**Expected Impact**: +30-40 GEO score points, improved AI citations
