# Deploy — quickpos-pos

## Vercel project
- Name: `quickpos-pos`
- GitHub: https://github.com/ubaid-dev-01/pos-saas
- Root Directory: `apps/pos`

## CLI
```bash
cd POS-SAAS/apps/pos
vercel --prod --yes
```

## Pipeline
1. Native Git: `vercel git connect https://github.com/ubaid-dev-01/pos-saas.git`
2. GitHub Actions: set secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

