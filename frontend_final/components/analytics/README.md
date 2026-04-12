Add Chart components and usage notes

Install required packages in the frontend project root:

npm install react-chartjs-2 chart.js

Or with pnpm:

pnpm add react-chartjs-2 chart.js

Then run the Next dev server in `frontend_final`:

```bash
cd frontend_final
npm run dev
```

The new components are:
- `components/analytics/bar-chart.tsx`
- `components/analytics/line-chart.tsx`
- `components/analytics/pie-chart.tsx`

They are wired into the coordinator dashboard at `app/coordinator/page.tsx` and use the existing systemic insights API responses when available, falling back to mock values if not.
