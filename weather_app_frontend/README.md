# Smart TV Weather App (LightningJS + Blits)

### Overview

This is a Lightning 3 Blits application optimized for smart TVs that displays current weather, forecasts, and settings using large-screen friendly UI and remote navigation.

### Getting started

Follow the steps below to get your app up and running.

#### IDE setup

It is highly recommended to install the Blits VS Code extension which provides template highlighting and improved autocompletion:
https://marketplace.visualstudio.com/items?itemName=LightningJS.lightning-blits

#### Project setup

Install dependencies:

```sh
npm install
```

#### Environment configuration

The app reads configuration via Vite environment variables (import.meta.env). Create a .env file in the project root if you need to override defaults.

Required/primary:
- VITE_API_BASE: Optional base URL for a proxy to the weather provider. If unset, the app calls OpenWeather directly at https://api.openweathermap.org/data/2.5
- VITE_WEATHER_API_KEY: API key for the weather provider. Required when calling OpenWeather directly. If using a proxy via VITE_API_BASE that injects credentials, this can be omitted.

Optional:
- VITE_WEATHER_PROVIDER: Weather provider key. Default: openweather
- VITE_WEATHER_UNITS_DEFAULT: Default units to use in the UI and API calls. One of metric, imperial, standard. Default: metric

Common Vite variables available in this container (not all are required for running locally):
- VITE_API_BASE, VITE_BACKEND_URL, VITE_FRONTEND_URL, VITE_WS_URL, VITE_NODE_ENV, VITE_NEXT_TELEMETRY_DISABLED, VITE_ENABLE_SOURCE_MAPS, VITE_PORT, VITE_TRUST_PROXY, VITE_LOG_LEVEL, VITE_HEALTHCHECK_PATH, VITE_FEATURE_FLAGS, VITE_EXPERIMENTS_ENABLED

Example .env:

```env
VITE_API_BASE=
VITE_WEATHER_API_KEY=your_openweather_key_here
VITE_WEATHER_PROVIDER=openweather
VITE_WEATHER_UNITS_DEFAULT=metric
VITE_LOG_LEVEL=info
```

Notes:
- If neither VITE_API_BASE nor VITE_WEATHER_API_KEY are set, the app will still start, but live weather calls may fail. In that case you can point VITE_API_BASE to a proxy that injects the API key, or set VITE_WEATHER_API_KEY directly.
- The weather client uses these variables in src/services/api.js.

#### Run in development

Run the app with hot reload:

```sh
npm run dev
```

Vite serves on port 3000 (see vite.config.js). Open the provided URL to view the app.

#### Preview a production build

Build and preview a production bundle locally:

```sh
npm run build
npm run preview
```

This produces an optimized build in dist and serves it for local testing.

### Application structure and routes

Core entry points:
- src/index.js: Launches the Blits app, sets canvas size (1920x1080), debug level, and maps TV remote keys (Arrow keys, Enter/NumpadEnter, Backspace/Escape).
- src/App.js: Registers theme plugin, header/toast components, and routes.

Routes defined in src/App.js:
- /: Home page with current conditions and a forecast strip
- /forecast: Forecast page with hourly/daily views and details
- /settings: Settings page for units and location search (demo UX)

Routing is rendered inside a RouterView positioned under the global Header.

### Remote navigation basics

From src/index.js, these keys are mapped:
- up: ArrowUp
- down: ArrowDown
- left: ArrowLeft
- right: ArrowRight
- enter: Enter, NumpadEnter
- back: Backspace, Escape

Focus handling is implemented in components such as:
- src/components/Button.js: visual focus state and enter handling
- src/components/ForecastList.js: horizontal navigation across forecast items
- src/components/Panel.js: focus ring and elevation changes on focus

Use the arrow keys to move focus between interactive elements and Enter to select. Use Backspace or Escape to navigate back when supported by the current page.

### Weather data and configuration

The weather service is implemented in src/services/api.js. It currently supports the openweather provider and reads:
- VITE_API_BASE: optional proxy base
- VITE_WEATHER_API_KEY: API key for direct OpenWeather calls
- Units are passed per request; you can set a default via VITE_WEATHER_UNITS_DEFAULT.

Utilities for formatting and icon mapping live in src/utils/format.js.

### Assets and icons

- Weather icon mapping is handled by mapConditionToIcon in src/utils/format.js. The mapping returns an icon token used by components (for example, WeatherNow and ForecastItem). If you add custom icons, you can extend the mapping there.
- Global theme values (colors, radii, spacing, elevation, typography) are defined in src/plugins/theme.js.
- Static assets such as images can be placed under public/ to be served by Vite, or referenced via standard import paths from src/.

### Build for production

Create an optimized and minified version of your App:

```sh
npm run build
```

Output is written to the dist folder.

### Resources

- Blits documentation: https://lightningjs.io/v3-docs/blits/getting_started/intro.html
- Blits Example App: https://blits-demo.lightningjs.io/?source=true
- Blits Components: https://lightningjs.io/blits-components.html
