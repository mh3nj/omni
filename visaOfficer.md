# Omni – technical portfolio document

**prepared for:** visa application review
**applicant:** mohsen jafari
**github:** [github.com/mh3nj](https://github.com/mh3nj)
**project repository:** [github.com/mh3nj/omni](https://github.com/mh3nj/omni)
**document date:** june 10, 2026
**development period:** may 15 – june 10, 2026

---

## what is omni

omni is a complete health tracking web application. it monitors seventeen organ systems, provides twenty smart utility tools, supports five languages (including persian and arabic with full rtl layout), and works entirely offline after initial load.

the project was conceived, designed, and built entirely by mohsen jafari, solo, over the course of approximately four weeks, under significant technical constraints due to internet restrictions in iran.

it is not a prototype or a proof of concept. it is a complete, stable, production-ready web application used for real health tracking.

**verified by cloning and running:**

```bash
git clone https://github.com/mh3nj/omni.git
cd omni
pnpm install
pnpm run dev
```

---

## the problem it solves

chronic health conditions require tracking multiple data points across different domains. a diabetic needs to track glucose, insulin, food intake, activity, sleep, blood pressure, foot health, eye exams, and more. existing solutions are fragmented. diabetes apps don't track sleep. fitness apps don't track medications. medication reminders don't track food. and almost none of them work in persian or arabic.

omni consolidates everything. seventeen organ trackers cover all major health domains. twenty smart tools add utility features. the entire application works in five languages, including full rtl support for persian and arabic.

the application was built because no existing solution combined comprehensive health tracking, offline-first architecture, multi-language support including rtl, and complete privacy with no cloud dependency.

---

## technical scope

| metric | value |
|--------|-------|
| total lines of code | 15,000+ (typescript, tsx, css, json) |
| typescript files | 35+ |
| development period | may 15 – june 10, 2026 |
| total active development hours | ~80 hours |
| platform | web (desktop, tablet, mobile) |
| primary language | typescript 6.0.3 |
| ui framework | react 19.2.6 |
| build tool | vite 8.0.12 |
| styling | tailwindcss 4.3.0 |
| animations | framer-motion 12.38.0 |
| i18n | i18next 26.2.0 |
| data storage | browser local storage |
| internet required | no (offline-first) |

---

## organ trackers implemented

| organ system | tracker | features |
|--------------|---------|----------|
| pancreas | glucose tracker | hba1c estimation, insulin logging, pre/post meal readings, type classification |
| heart | blood pressure tracker | systolic/diastolic, pulse, hypertension staging, trend analysis |
| kidneys | water tracker | daily goal tracking, glass/bottle presets, weekly history, hydration streak |
| stomach | food manager | iranian food database (12 items), custom food creation, carb counting, gi levels, blood sugar before/after meals, insulin dose tracking |
| brain | sleep tracker | bedtime/waketime, duration, quality rating (1-5), deep sleep tracking, wakeup count |
| muscles | activity tracker | 7 activity types, duration, intensity, calories, steps, distance, heart rate, blood sugar correlation |
| lungs | habit tracker | 5 core habits + custom habits, daily/weekly/monthly views, streak tracking, perfect days count |
| teeth | dental tracker | morning/evening brushing, flossing, mouthwash, dentist visits, teeth issues with tooth mapping |
| bones | weight tracker | weight, bmi, body fat, waist, hip, muscle mass, trend chart, bmi category |
| eyes | vision tracker | prescription (sphere, cylinder, axis), visual acuity, eye pressure, retinopathy staging, exam records |
| ears | hearing tracker | hearing tests (frequency, db loss), tinnitus logging (severity, pitch, triggers), noise exposure |
| skin | wound tracker | location, type, size, pain level, healing progress, treatment status, daily skin care (feet check, moisturizer, sunscreen) |
| liver | alcohol tracker | units consumed, fatty liver risk assessment (low/moderate/high), alt/ast/ggt levels, symptom tracking |
| intestines | bowel tracker | frequency, bristol stool chart (types 1-7), pain, bloating, constipation, diarrhea, fiber/water intake |
| bladder | urination tracker | daily frequency, night urination, urgency (1-5), pain/burning, blood/cloudy urine, uti episode tracking |
| nails | nail care tracker | fingernail/toenail trimming, condition assessment, fungal infection tracking, professional care |
| reproductive | health tracker | menstrual cycle (start/end dates, flow intensity), symptoms (10 tracked), sexual health (libido, satisfaction, protection) |

---

## smart tools implemented

| tool | features |
|------|----------|
| pill tracker | medication schedule, times, reminders, taken/missed tracking, active/inactive toggle |
| doctor appointments | upcoming/past appointments, doctor name, specialty, date, time, location, reminders |
| foot diary | left/right foot photos (upload), status classification (good/warning/critical), weekly overview, diabetic foot care focus |
| lab results | test name, value, unit, normal range, status (low/normal/high), notes, understanding guide |
| voice log | speech recognition, process commands for glucose, water, bp, walking, command history |
| insulin rotator | injection site tracking (abdomen left/right, arm left/right, thigh left/right), usage statistics, recommended next site |
| smart alerts | automatic detection: high/low glucose, low water, no activity, poor sleep, high bp, critical/warning/info classification |
| anti-stress hub | breathing/meditation/yoga sessions, configurable duration (1-30 min), stress level check, session history |
| growth tracker | reading (book, pages), writing (words, topic), fun activities (duration, enjoyment), social interactions (person, quality) |
| notifications | pill reminders, appointment reminders, unread count, mark all as read |
| hair checker | density (1-5), shedding (1-5), treatment tracking, photo upload, history with trend |
| bone cracking checker | track joint cracking (neck, back, fingers, wrists, knees, ankles, toes), streak tracking, success rate |
| caffeine tracker | sources (coffee, espresso, tea, soda, energy drink), mg amount, time, daily/weekly totals, recommended limit (400mg) |
| salt/sugar balance | daily salt (limit 5g), added sugar (limit 25g), weekly averages, exceeds limit warnings |
| forgetfulness tracker | daily incidents, description, context, weekly average, trend (improving/worsening/stable) |
| barbershop tracker | visit date, service, cost, barber name, next appointment, total spent |
| hand therapy | exercises (wrist circles, finger stretches, fist clenches, thumb touches, prayer stretch, wrist flex/extend), pain before/after, reps |
| hygiene tracker | shower, teeth, deodorant, perfume, product name, streak tracking |
| cloud backup | google cloud sync (configurable), auto-sync interval, export/import, data safe messaging |
| local backup | create/restore backups, automatic backup scheduling (15 min to daily), backup rotation (keeps last 20), import/export backup files |

---

## internationalization

five languages are fully supported with complete translation files.

| language | code | rtl | translation completeness |
|----------|------|-----|--------------------------|
| english | en | no | 100% |
| persian | fa | yes | 100% |
| german | de | no | 100% |
| turkish | tr | no | 100% |
| arabic | ar | yes | 100% |

each translation file contains over 1,500 key-value pairs covering:
- app navigation and common ui elements
- all 17 organ trackers (glucose, bp, water, food, sleep, activity, habits, dental, weight, vision, hearing, skin, liver, intestines, bladder, nails, reproductive)
- all 20 smart tools
- dashboard, settings, and all modals
- status messages, tips, and educational content

the language switcher uses a swipeable horizontal slider on mobile devices and a standard dropdown on desktop.

---

## responsive design

mobile users represent approximately 90% of the target audience. the entire interface was designed for phones first.

| screen size | layout | features |
|-------------|--------|----------|
| mobile (<640px) | 2 column grid | hamburger menu, swipe gestures, bottom sheet modals, touch targets min 44px |
| tablet (640-1024px) | 2-3 column grid | optional desktop menu, touch-friendly |
| desktop (>1024px) | 4 column grid | full menu, mouse hover states |

the hardware back button is fully supported. pressing back on android navigates within the app (tracker → organs → dashboard) instead of exiting the browser.

---

## data privacy and security

| aspect | implementation |
|--------|----------------|
| data storage | browser local storage only |
| network requests | none (except optional cloud sync) |
| tracking | none |
| telemetry | none |
| analytics | none |
| external apis | none |
| third-party cookies | none |
| data export | json, pdf, txt |
| backup | local (rotating, keeps last 20) |
| cloud sync | optional, google cloud ready (requires backend) |
| data ownership | user's device, user's control |

no analytics. no tracking pixels. no third-party apis. omni makes no network requests except for optional cloud sync that you explicitly enable. your health data never leaves your device unless you explicitly export it or configure cloud sync.

---

## development timeline

version 1.0 was built over approximately four weeks.

### week 1 – may 15-21, 2026 (~30 hours)

| date | hours | work completed |
|------|-------|----------------|
| may 15 | ~6h | project setup: vite + react + typescript + tailwind + i18n, app structure, routing between dashboard and organ grid |
| may 16 | ~6h | glucose tracker, bp tracker, water tracker (full implementation) |
| may 17 | ~6h | food manager with iranian food database, meal logging, carb counting |
| may 18 | ~4h | sleep tracker, activity tracker |
| may 19 | ~4h | habit tracker, dental tracker |
| may 20 | ~2h | weight tracker, vision tracker |
| may 21 | ~2h | hearing tracker, skin tracker |

### week 2 – may 22-28, 2026 (~25 hours)

| date | hours | work completed |
|------|-------|----------------|
| may 22 | ~4h | liver tracker, intestines tracker |
| may 23 | ~4h | bladder tracker, nails tracker |
| may 24 | ~4h | reproductive tracker |
| may 25 | ~3h | smart tools structure, pill tracker, doctor appointments |
| may 26 | ~3h | foot diary, lab results, voice log |
| may 27 | ~4h | insulin rotator, smart alerts |
| may 28 | ~3h | anti-stress hub, growth tracker, notifications |

### week 3 – may 29 – june 4, 2026 (~20 hours)

| date | hours | work completed |
|------|-------|----------------|
| may 29 | ~3h | hair checker, bone cracking checker, caffeine tracker |
| may 30 | ~3h | salt/sugar tracker, forgetfulness tracker |
| may 31 | ~3h | barbershop tracker, hand therapy, hygiene tracker |
| june 1 | ~3h | cloud backup, local backup |
| june 2 | ~4h | settings dialog, data manager, export/import, backup system |
| june 3 | ~2h | language switcher with swipe, rtl support fixes |
| june 4 | ~2h | mobile menu, responsive layout fixes |

### week 4 – june 5-10, 2026 (~15 hours)

| date | hours | work completed |
|------|-------|----------------|
| june 5 | ~4h | dark mode implementation, theme persistence |
| june 6 | ~3h | translation completion for all 5 languages |
| june 7 | ~3h | bug fixes, edge cases, performance optimization |
| june 8 | ~2h | css refinement, dark mode fixes, yasi light theme |
| june 9 | ~2h | hardware back button support, mobile ux improvements |
| june 10 | ~1h | documentation, build testing, release preparation |

**combined total: approximately 90 hours. four weeks. one developer.**

---

## code quality indicators

- full typescript with strict mode enabled
- no `any` types in critical paths (exceptions for local storage parsing)
- consistent component structure (props interface, useState, useEffect, handlers, return)
- i18n integration throughout (no hardcoded user-facing strings)
- responsive design with tailwind breakpoints
- dark mode support via tailwind dark variant
- rtl support with document direction toggling
- local storage persistence with version handling
- error boundaries for component failures
- toast notifications for user feedback
- skeleton loading states for perceived performance

---

## third-party dependencies

| library | version | purpose |
|---------|---------|---------|
| react | 19.2.6 | ui framework |
| react-dom | 19.2.6 | dom rendering |
| typescript | 6.0.3 | type safety |
| vite | 8.0.12 | build tool |
| tailwindcss | 4.3.0 | styling |
| framer-motion | 12.38.0 | animations |
| i18next | 26.2.0 | internationalization |
| react-i18next | 17.0.8 | react bindings for i18next |
| i18next-browser-languagedetector | 8.2.1 | language detection |

no proprietary libraries. no tracking libraries. no analytics libraries.

---

## verification instructions

the authenticity and functionality of this project can be verified directly:

1. clone the repository: `git clone https://github.com/mh3nj/omni.git`
2. install dependencies: `pnpm install` (or `npm install`)
3. run development server: `pnpm run dev`
4. open `http://localhost:5173` in a browser
5. verify all organ trackers load and function
6. change language to persian, verify rtl layout
7. toggle dark mode, verify theme persists
8. add test data, verify it saves to local storage
9. export data to json, verify export works
10. on mobile device or devtools mobile emulation, verify responsive layout and hardware back button

the full application launches and operates exactly as documented. every line of code is readable in the repository.

---

## known limitations

- cloud sync requires backend configuration (template provided, not active by default)
- the full hibp database for breach detection is not included (optional, requires separate download)
- voice recognition works only in browsers that support the web speech api
- local storage has a 5-10mb limit per origin; large attachments may exceed this
- exporting very large datasets to pdf may cause browser performance issues
- some fontawesome icons may not render without an internet connection (fallback text provided)

---

## about the author

**mohsen jafari** is a full-time web developer based in iran, with professional experience in frontend development, backend systems, and desktop applications. he has been programming in typescript and react for several years.

omni was built to solve a real need: a complete health tracking platform that works offline, supports persian and arabic, and respects user privacy. the result is a tool he uses himself, that he built himself, that requires no subscription and no cloud dependency.

- github: [github.com/mh3nj](https://github.com/mh3nj)
- xing: [xing.com/profile/Mohsen_Jafari093223](https://www.xing.com/profile/Mohsen_Jafari093223/)
- portfolio: [dahgan.com](https://dahgan.com)
- logo: [parsegan.com](https://parsegan.com)

---

## declaration

i, mohsen jafari, confirm that the information in this document is accurate. omni was built by me, solo, over the period of may 15 to june 10, 2026. the source code is available at the github repository listed above. the application works as described.

---

*this project was built during internet restrictions in iran. no stack overflow. no npm. no github. no reliable connectivity. just whatever was cached, whatever could be reasoned through, and the determination to ship something real.*

*ninety hours. fifteen thousand lines of code. thirty-seven trackers and tools. five languages. four weeks. one developer.*

*proof that creativity and persistence do not require a stable connection.*