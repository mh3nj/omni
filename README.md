# Omni – Life Balance

![Version](https://img.shields.io/badge/version-1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/react-19.2.6-61dafb)
![TypeScript](https://img.shields.io/badge/typescript-6.0.3-3178c6)
![Platform](https://img.shields.io/badge/platform-web%20%7C%20pwa-lightgrey)
![Offline](https://img.shields.io/badge/works-offline-brightgreen)
![RTL](https://img.shields.io/badge/rtl-ready-8b5cf6)
![Built in Iran](https://img.shields.io/badge/built%20in-iran-orange)

> complete health tracking platform. 17 organ trackers. 20 smart tools. 5 languages. dark mode. rtl support. no subscription. no cloud dependency. your data stays on your device.

<img src="/assets/banner.png" alt="Omni v1.0 Banner" width="100%">

---

## the problem this solves

managing chronic health conditions requires tracking multiple data points: blood glucose, blood pressure, sleep, activity, medications, food intake, and more. most health apps focus on one thing. diabetes apps don't track your sleep. fitness apps don't track your medications. and almost none of them work in persian or arabic.

omni was built to solve this. one application that tracks everything. all organs. all smart tools. all in your language. all offline. no subscription. no cloud lock-in.

your health data never leaves your device unless you explicitly export it. you own it. you control it.

---

## what's new in version 1.0

### complete organ coverage

seventeen organ trackers cover everything from your brain to your nails. each tracker is designed specifically for health monitoring, with medical-grade reference ranges and diabetic-specific recommendations.

- glucose tracker with hba1c estimation
- blood pressure tracker with hypertension staging
- weight tracker with bmi and body composition
- water tracker with daily hydration goals
- sleep tracker with quality scoring
- activity tracker with calorie estimation
- habit tracker with streak counting
- food manager with carb counting and iranian food database
- dental tracker with brushing streaks
- vision tracker with prescription history
- hearing tracker with tinnitus logging
- skin tracker with wound monitoring
- liver tracker with fatty liver risk assessment
- intestines tracker with bristol stool chart
- bladder tracker with uti episode tracking
- nails tracker with fungal issue monitoring
- reproductive tracker with menstrual cycle and sexual health

### twenty smart tools

beyond organ tracking, omni includes twenty utility tools for comprehensive health management.

medication management: pill tracker with reminders, insulin site rotator with usage statistics, doctor appointments with upcoming notifications.

health monitoring: lab results with normal range comparison, smart alerts for critical values, voice logging for hands-free entry.

wellness tools: anti-stress hub with breathing exercises, growth tracker for reading and writing, forgetfulness tracker for memory lapses.

utility tools: foot diary with photo uploads, hair checker with density tracking, hand therapy with exercise guides, barbershop tracker, hygiene tracker, caffeine tracker, salt and sugar balance tracker, bone cracking checker.

data safety: cloud backup (google cloud ready), local backup with rotation, export to json/pdf/txt, import from backup files.

### full internationalization

five languages are fully supported with rtl layout for persian and arabic.

- english
- persian (فارسی) with full rtl support
- german (deutsch)
- turkish (türkçe)
- arabic (العربية) with full rtl support

language switching is instant. no page reload required for most content. the entire ui reflows for rtl languages.

### mobile-first responsive design

ninety percent of users access omni from mobile devices. the entire interface was designed for phones first, then expanded for tablets and desktop.

- hamburger menu for mobile navigation
- swipe gestures for language switching
- large touch targets (minimum 44x44 pixels)
- hardware back button support (navigates within app, not back in browser)
- responsive grid layouts (2 columns on mobile, 4 on desktop)
- bottom sheet modals for forms

### dark and light themes

both themes are fully supported with careful attention to contrast and readability.

light theme uses a warm yasi-inspired palette with purple primary colors and gold accents.

dark theme uses a clean dark palette with teal primary colors.

theme switching is instant and persistent across sessions.

### offline-first architecture

all data is stored in your browser's local storage. no internet connection is required after initial load. your health data never leaves your device unless you explicitly export or sync it.

backup and restore are built in. you can export your entire vault to json, pdf, or txt. you can schedule automatic local backups. you can sync to google cloud if you choose (optional, requires configuration).

---

## security architecture

| component | implementation |
|-----------|----------------|
| data storage | browser local storage |
| data export | json, pdf, txt |
| backup | local rotation (keeps last 20) |
| cloud sync | optional, google cloud ready |
| data ownership | your device, your control |
| tracking | none |
| telemetry | none |
| external requests | none (except optional cloud sync) |

no analytics. no tracking pixels. no third-party apis. omni makes no network requests except for optional cloud sync that you explicitly enable.

---

## features

| category | what's inside |
|----------|---------------|
| organ trackers | pancreas (glucose), heart (bp), kidneys (water), stomach (food), brain (sleep), muscles (activity), lungs (habits), teeth (dental), bones (weight), eyes (vision), ears (hearing), skin (wounds), liver (alcohol), intestines (fiber), bladder (urination), nails (care), reproductive (cycle) |
| smart tools | pill tracker, doctor appointments, foot diary, lab results, voice log, insulin rotator, smart alerts, anti-stress hub, growth tracker, notifications, hair checker, bone cracking checker, caffeine tracker, salt/sugar balance, forgetfulness tracker, barbershop tracker, hand therapy, hygiene tracker, cloud backup, local backup |
| food database | iranian foods (sangak, lavash, ghormeh sabzi, fesenjan, shirazi salad), custom food creation, carb counting, gi levels, blood sugar tracking before/after meals |
| languages | english, persian (فارسی), german (deutsch), turkish (türkçe), arabic (العربية) |
| accessibility | rtl layout, screen reader compatible, keyboard navigation, high contrast |
| data | local storage, backup/restore, export/import, cloud sync (optional) |
| ui | dark/light theme, responsive design, mobile-first, hardware back button support |

---

## screenshots

<div align="center">
  <table>
    <tr>
      <td align="center"><img src="/screenshots/1.png"><br/><sub>dashboard en dark theme</sub></td>
      <td align="center"><img src="/screenshots/2.png"><br/><sub>dashboard en light theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/3.png"><br/><sub>organs en dark theme</sub></td>
      <td align="center"><img src="/screenshots/4.png"><br/><sub>smart tools en dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/5.png"><br/><sub>organs brain en dark theme</sub></td>
      <td align="center"><img src="/screenshots/6.png"><br/><sub>organs brain en dark theme log sleep</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/7.png"><br/><sub>organs eyes en dark theme</sub></td>
      <td align="center"><img src="/screenshots/8.png"><br/><sub>organs eyes en dark theme log prescription</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/9.png"><br/><sub>organs eyes en dark theme log eye exam</sub></td>
      <td align="center"><img src="/screenshots/10.png"><br/><sub>organs ears en dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/11.png"><br/><sub>organs ears en dark theme log tinnitus</sub></td>
      <td align="center"><img src="/screenshots/12.png"><br/><sub>organs ears en light theme log noise exposure</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/13.png"><br/><sub>organs heart en dark theme</sub></td>
      <td align="center"><img src="/screenshots/14.png"><br/><sub>organs lungs en dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/15.png"><br/><sub>organs lungs en dark theme log habbits</sub></td>
      <td align="center"><img src="/screenshots/16.png"><br/><sub>organs pacnreas en dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/17.png"><br/><sub>organs stomach en dark theme</sub></td>
      <td align="center"><img src="/screenshots/18.png"><br/><sub>organs stomach en dark theme log meal</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/19.png"><br/><sub>organs stomach en dark theme add food</sub></td>
      <td align="center"><img src="/screenshots/20.png"><br/><sub>organs liver en dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/21.png"><br/><sub>organs liver en dark theme log liver health</sub></td>
      <td align="center"><img src="/screenshots/22.png"><br/><sub>organs kidneys en dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/23.png"><br/><sub>organs intestine en light theme</sub></td>
      <td align="center"><img src="/screenshots/24.png"><br/><sub>organs intestine en light theme log bowel movement</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/25.png"><br/><sub>organs bladder en light theme</sub></td>
      <td align="center"><img src="/screenshots/26.png"><br/><sub>organs bladder en light theme log urination</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/27.png"><br/><sub>organs reproductive en light theme</sub></td>
      <td align="center"><img src="/screenshots/28.png"><br/><sub>organs reproductive en light theme log cycle</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/29.png"><br/><sub>organs reproductive en light theme log sexual health</sub></td>
      <td align="center"><img src="/screenshots/30.png"><br/><sub>organs teeth en dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/31.png"><br/><sub>organs teeth en dark theme log dental</sub></td>
      <td align="center"><img src="/screenshots/32.png"><br/><sub>organs bones en dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/33.png"><br/><sub>organs bones en dark theme log weight</sub></td>
      <td align="center"><img src="/screenshots/34.png"><br/><sub>organs muscles en dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/35.png"><br/><sub>organs muscles en dark theme log activity</sub></td>
      <td align="center"><img src="/screenshots/36.png"><br/><sub>organs skin en light theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/37.png"><br/><sub>organs skin en light theme log wound</sub></td>
      <td align="center"><img src="/screenshots/38.png"><br/><sub>organs skin en light theme daily skin care</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/39.png"><br/><sub>organs nails en light theme</sub></td>
      <td align="center"><img src="/screenshots/40.png"><br/><sub>organs nails en light theme log nail care</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/41.png"><br/><sub>organs nails en light theme log fungal issue</sub></td>
      <td align="center"><img src="/screenshots/42.png"><br/><sub>settings en light theme part 1</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/43.png"><br/><sub>settings en light theme part 2</sub></td>
      <td align="center"><img src="/screenshots/44.png"><br/><sub>smart tools pill tracker en dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/45.png"><br/><sub>smart tools pill tracker en dark theme add pill</sub></td>
      <td align="center"><img src="/screenshots/46.png"><br/><sub>smart tools doctor appointments en dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/47.png"><br/><sub>smart tools doctor appointments en dark theme new appointments</sub></td>
      <td align="center"><img src="/screenshots/48.png"><br/><sub>smart tools foot diary en dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/49.png"><br/><sub>smart tools lab results en dark theme</sub></td>
      <td align="center"><img src="/screenshots/50.png"><br/><sub>smart tools lab results en dark theme add result</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/51.png"><br/><sub>smart tools voice log en dark theme</sub></td>
      <td align="center"><img src="/screenshots/52.png"><br/><sub>smart tools insulin rotator en light theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/53.png"><br/><sub>smart tools smart alerts en light theme</sub></td>
      <td align="center"><img src="/screenshots/54.png"><br/><sub>smart tools anti stress hub en dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/55.png"><br/><sub>smart tools growth tracker en dark theme</sub></td>
      <td align="center"><img src="/screenshots/56.png"><br/><sub>smart tools growth tracker en dark theme add reading</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/57.png"><br/><sub>smart tools notifications en dark theme</sub></td>
      <td align="center"><img src="/screenshots/58.png"><br/><sub>smart tools hair checker en dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/59.png"><br/><sub>smart tools hair checker en dark theme log check</sub></td>
      <td align="center"><img src="/screenshots/60.png"><br/><sub>smart tools anti bone cracking en dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/61.png"><br/><sub>smart tools anti bone cracking en dark theme log today</sub></td>
      <td align="center"><img src="/screenshots/62.png"><br/><sub>smart tools caffeine tracker en dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/63.png"><br/><sub>smart tools caffeine tracker en dark theme log intake</sub></td>
      <td align="center"><img src="/screenshots/64.png"><br/><sub>smart tools salt and sugar balance en dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/65.png"><br/><sub>smart tools salt and sugar balance en dark theme log today</sub></td>
      <td align="center"><img src="/screenshots/66.png"><br/><sub>smart tools forgetfulness en dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/67.png"><br/><sub>smart tools forgetfulness en dark theme log today</sub></td>
      <td align="center"><img src="/screenshots/68.png"><br/><sub>smart tools barbershop tracker en dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/69.png"><br/><sub>smart tools barbershop tracker en dark theme log visit</sub></td>
      <td align="center"><img src="/screenshots/70.png"><br/><sub>smart tools hand therapy en dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/71.png"><br/><sub>smart tools hand therapy en dark theme log exercise</sub></td>
      <td align="center"><img src="/screenshots/72.png"><br/><sub>smart tools hygiene and grooming en dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/73.png"><br/><sub>smart tools hygiene and grooming en dark theme log today</sub></td>
      <td align="center"><img src="/screenshots/74.png"><br/><sub>smart tools cloud backup en dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/75.png"><br/><sub>smart tools local backup en dark theme</sub></td>
      <td align="center"><img src="/screenshots/76.png"><br/><sub>dashboard fa dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/77.png"><br/><sub>dashboard de dark theme</sub></td>
      <td align="center"><img src="/screenshots/78.png"><br/><sub>dashboard turkce dark theme</sub></td>
    </tr>
    <tr>
      <td align="center"><img src="/screenshots/79.png"><br/><sub>dashboard ar dark theme</sub></td>
      <td align="center"><img src="/screenshots/80.png"><br/><sub>dashboard fa light theme</sub></td>
    </tr>

  </table>
</div>

---

## getting started

### web deployment

omni is a static web application. build it once, host it anywhere.

```bash
git clone https://github.com/yourusername/omni.git
cd omni
pnpm install
pnpm run build
```

the `dist` folder contains the complete production build. upload it to any static hosting service.

### development

```bash
# install dependencies
pnpm install

# run development server
pnpm dev

# build for production
pnpm run build

# preview production build
pnpm run preview

# lint
pnpm run lint
```

### requirements

- node.js 20 or higher
- pnpm (recommended) or npm
- modern browser (chrome, firefox, safari, edge)
- works offline after initial load

---

## project structure

```
omni/
├── src/
│   ├── components/
│   │   ├── ActivityTracker.tsx
│   │   ├── BladderTracker.tsx
│   │   ├── BPTracker.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DentalTracker.tsx
│   │   ├── FoodManager.tsx
│   │   ├── GlucoseTracker.tsx
│   │   ├── HabitTracker.tsx
│   │   ├── HearingTracker.tsx
│   │   ├── IntestinesTracker.tsx
│   │   ├── LiverTracker.tsx
│   │   ├── NailsTracker.tsx
│   │   ├── ReproductiveTracker.tsx
│   │   ├── SkinTracker.tsx
│   │   ├── SleepTracker.tsx
│   │   ├── VisionTracker.tsx
│   │   ├── WaterTracker.tsx
│   │   ├── WeightTracker.tsx
│   │   ├── smart/
│   │   │   ├── AntiStressHub.tsx
│   │   │   ├── BarbershopTracker.tsx
│   │   │   ├── BoneCrackingChecker.tsx
│   │   │   ├── CaffeineTracker.tsx
│   │   │   ├── CloudBackup.tsx
│   │   │   ├── DoctorAppointments.tsx
│   │   │   ├── FootDiary.tsx
│   │   │   ├── ForgetfulnessTracker.tsx
│   │   │   ├── GrowthTracker.tsx
│   │   │   ├── HairChecker.tsx
│   │   │   ├── HandGestureTracker.tsx
│   │   │   ├── InsulinRotator.tsx
│   │   │   ├── LabResults.tsx
│   │   │   ├── LocalBackup.tsx
│   │   │   ├── NotificationCenter.tsx
│   │   │   ├── PerfumeTracker.tsx
│   │   │   ├── PillTracker.tsx
│   │   │   ├── SaltSugarTracker.tsx
│   │   │   ├── SmartAlerts.tsx
│   │   │   └── VoiceLog.tsx
│   │   └── ui/
│   │       ├── AnimatedBackground.tsx
│   │       ├── LanguageSwitcher.tsx
│   │       ├── ParallaxCard.tsx
│   │       ├── PremiumCard.tsx
│   │       ├── SettingsDialog.tsx
│   │       ├── SkeletonCard.tsx
│   │       └── Toast.tsx
│   ├── locales/
│   │   ├── en/translation.json
│   │   ├── fa/translation.json
│   │   ├── de/translation.json
│   │   ├── tr/translation.json
│   │   └── ar/translation.json
│   ├── utils/
│   │   ├── dataManager.ts
│   │   ├── googleCloudSync.ts
│   │   ├── localBackup.ts
│   │   ├── pdfExport.ts
│   │   └── icons.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── i18n.ts
├── public/
│   ├── screenshots/
│   └── fonts/
├── index.html
├── package.json
├── pnpm-lock.yaml
├── vite.config.ts
├── tsconfig.json
├── README.md
└── visaOfficer.md
```

---

## dependencies

```
react 19.2.6
react-dom 19.2.6
typescript 6.0.3
vite 8.0.12
tailwindcss 4.3.0
framer-motion 12.38.0
i18next 26.2.0
react-i18next 17.0.8
i18next-browser-languagedetector 8.2.1
```

all dependencies are open source. no proprietary libraries. no tracking.

---

## development context

this project was built under internet restrictions in iran, where access to github, npm, stack overflow, and most development resources was blocked during extended periods. dependencies were researched and downloaded during brief connectivity windows. documentation was consulted from locally cached copies. problems were solved from first principles when references were unavailable.

version control pushes, dependency management, and documentation access required planning around unpredictable connectivity. the application was built anyway. it works. it is documented. it can be cloned and run by anyone.

---

## about the author

**mohsen jafari** is a full-time web developer based in iran, with experience in frontend development, backend systems, and desktop applications.

omni was built to solve a real need: a complete health tracking platform that works offline, supports persian and arabic, and respects user privacy. the result is a tool he uses himself, that he built himself, that requires no subscription and no cloud dependency.

- github: [github.com/mh3nj](https://github.com/mh3nj)
- xing: [xing.com/profile/Mohsen_Jafari093223](https://www.xing.com/profile/Mohsen_Jafari093223/)
- portfolio: [dahgan.com](https://dahgan.com)
- logo: [parsegan.com](https://parsegan.com)

---

## license

mit. use it, fork it, modify it, ship it. attribution appreciated but not required.

---

## the story behind this

this project was built during a period when the internet in iran was heavily restricted.

no stack overflow. no npm. no github. no youtube tutorials. no reliable connection to the tools most developers take for granted. just whatever was cached locally, whatever could be reasoned through from first principles, and the determination to ship something real.

one developer. one month. seventeen organ trackers. twenty smart tools. five languages. thousands of lines of code.

it works. it's useful. it was built under conditions that would have stopped most projects before they started.

**omni; track everything. master your health.**

*-mh3nj*