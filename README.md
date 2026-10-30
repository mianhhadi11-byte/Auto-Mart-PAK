# AutoMart Pakistan

A premium car marketplace for Pakistan — buy, sell and compare verified cars across the country. Built with React 19, TypeScript and Vite.

**Project owner:** Hadi Awais · **Institute:** PNY Training Centre

---

## Highlights

- **Home page** — hero search, featured listings, popular brands, latest cars, body-type shortcuts, trust section, testimonials and newsletter signup.
- **Buy Cars** — full-text search plus brand, model, city, year, price, transmission, fuel and body-type filters. Sorting, grid/list view, pagination and shareable URL state.
- **Car detail** — photo gallery with lightbox, specifications, features, EMI estimator, seller contact reveal, WhatsApp link, inquiry form and related cars.
- **Compare** — compare up to four cars side by side with best-value highlighting and one-click add/remove.
- **Sell Your Car** — validated listing form with drag-and-drop photo upload (compressed in-browser) and a live preview before publishing.
- **Accounts** — login and sign up with validation, session persistence, saved favourites and "My Listings" management.
- **About / Contact** — company story, team, safety guidance, FAQ, contact form and embedded map.
- **Everything persisted** in `localStorage`, so the demo keeps its state between refreshes.

## Tech stack

| Layer | Choice |
| --- | --- |
| UI | React 19 + TypeScript |
| Build | Vite 8 |
| Routing | React Router 7 |
| Icons | lucide-react |
| Fonts | Plus Jakarta Sans + Inter (self-hosted via Fontsource) |
| Linting | Oxlint |
| Styling | Modular hand-written CSS in `src/styles/` |

## Getting started

```bash
npm install
npm run dev      # start the dev server at http://localhost:5173
```

Other scripts:

```bash
npm run build    # type-check and build for production into dist/
npm run preview  # preview the production build locally
npm run lint     # run Oxlint
```

> On Windows PowerShell where script execution is restricted, use `npm.cmd` instead of `npm`.

## Demo account

```
Email:    demo@automart.pk
Password: automart123
```

You can also create a new account — accounts are stored locally in the browser.

## Project structure

```
src/
  components/   Reusable UI: header, footer, car card, search bar, compare bar, toasts…
  context/      AppContext — auth, favourites, comparison, listings, messages, toasts
  data/         Seed catalogue: 27 cars, 6 brands, 12 cities, sellers and features
  hooks/        Page title, scroll restoration and body-lock helpers
  pages/        Home, Buy, CarDetail, Compare, Sell, Auth, About, Contact, Favorites, MyListings
  styles/       Design tokens and per-area stylesheets
  utils/        Formatting, validation and placeholder image helpers
public/
  images/cars/  Optimised WebP photography used across the site
```

## Notes

- All car photography is optimised WebP served from `public/images/cars/`.
- Listings without uploaded photos fall back to a branded "Photos coming soon" placeholder.
- Data is seeded from `src/data/cars.ts`; user-created listings live alongside it in local storage.
- This is a front-end demo — there is no backend, payment processing or real messaging service.
