# 🚪 DoorCheck — Should you step outside?

<p align="center">
  <img src="src/assets/logo.png" alt="DoorCheck logo" width="112" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.87-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Open--Meteo-Weather%20%2B%20AQI-0EA5E9?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey?style=for-the-badge" />
</p>

> Open the app. Get one giant answer: **GO / WAIT / STAY**. GPS + live weather + air quality. React Native CLI (**not Expo**). **No API key. No backend. No Gemini.**

---

## ✨ What you get

| Bit | What it does |
|-----|----------------|
| 🟢 **GO** | Clear-ish air, no serious rain, temps you can actually walk in |
| 🟠 **WAIT** | Rain, fog, mid AQI, or too hot/cold — try a later hour |
| 🟣 **STAY** | Thunder, snow, AQI 150+, or extreme heat/cold |
| 📍 **GPS** | Uses your pin. Denied? Falls back to Delhi |
| 🌍 **Demo cities** | Delhi, Mumbai, London, New York — tap a chip |
| ⏳ **12-hour strip** | Each hour scored GO / WAIT / STAY |

Not a camera app. Not a resume scorer. The phone asks **where you are**, Open-Meteo answers **what the air is doing**, and **your rules** pick the verdict.

---

## 🏗️ How it works

```
GPS (or a demo city pin)
        ↓
Open-Meteo forecast  +  Open-Meteo air quality
        ↓
src/api/decision.ts  (your rules, not a model)
        ↓
GO / WAIT / STAY  +  12-hour strip
```

Same idea as any REST call: URL, `fetch`, JSON. No key on the door.

---

## 🛠️ Create this project from zero

React Native **CLI 0.87**, TypeScript, **not Expo**.

```bash
npx @react-native-community/cli@20.2.0 init DoorCheck --version 0.87.1 --pm npm --skip-git-init
cd DoorCheck

npm install @react-native-community/geolocation react-native-gesture-handler react-native-screens react-native-linear-gradient
```

Then add the app files in this repo:

| Path | Role |
|------|------|
| `src/api/location.ts` | GPS + Android permission |
| `src/api/openMeteo.ts` | Weather + AQI `fetch` |
| `src/api/decision.ts` | GO / WAIT / STAY rules |
| `src/screens/HomeScreen.tsx` | Animated verdict UI |
| `src/assets/logo.png` | App mark (also splash + icons) |
| `ios/.../Info.plist` | `NSLocationWhenInUseUsageDescription` |
| `android/.../AndroidManifest.xml` | `ACCESS_FINE_LOCATION` |

iOS pods (once):

```bash
bundle install
cd ios && bundle exec pod install && cd ..
```

Copy `src/assets/logo.png` into:

- iOS `Images.xcassets/AppIcon.appiconset` and `SplashLogo.imageset`
- Android `res/mipmap-*` and `res/drawable/splash_logo.png`

---

## 🚀 Run it

```bash
git clone https://github.com/Aishwaryaofficial/DoorCheck.git
cd DoorCheck
npm install

bundle install
cd ios && bundle exec pod install && cd ..

npm start
# other terminal
npm run ios
# or
npm run android
```

If the clone URL is not live yet, copy the folder and run the same commands from `DoorCheck/`.

### Try it

1. Allow location, or tap **Delhi / Mumbai / London / New York**
2. Read **GO / WAIT / STAY**
3. Scroll the 12-hour strip
4. Tap **Check again**

Simulator GPS is often empty — use a demo city chip.

---

## 🎨 Stack

- React Native 0.87 CLI + TypeScript
- `@react-native-community/geolocation`
- `react-native-linear-gradient` + RN `Animated` (blobs, pulse, spring)
- Open-Meteo (free, no key): [forecast](https://open-meteo.com/en/docs) + [air quality](https://open-meteo.com/en/docs/air-quality-api)

---

## 🧪 Tests

```bash
npm test
```

Decision rules live in `__tests__/decision.test.ts` (GO / WAIT / STAY without the network).

---

## 📄 License

MIT
