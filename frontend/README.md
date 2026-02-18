# GreenMiles Frontend

A modern React-based frontend application for the GreenMiles EV (Electric Vehicle) platform. This application provides route planning, EV profile management, charging station locator, and sustainability analytics for electric vehicle users.

## 🚀 Features

- **Route Planning**: Plan and analyze routes with EV-specific optimization
- **EV Profile Management**: Create and manage electric vehicle profiles
- **Charging Stations**: Locate nearby charging stations with Mapbox integration
- **Route Analysis**: Get detailed analysis of planned routes including distance, time, and battery consumption
- **Sustainability Report**: Track and view environmental impact metrics
- **Interactive Map**: Real-time map visualization powered by Mapbox GL

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher (or yarn/pnpm)
- **Backend API**: Running on `http://localhost:8000` (default)
- **Mapbox Access Token**: Required for map features

## 🔧 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the frontend root directory:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_MAPBOX_TOKEN=your_mapbox_access_token_here
```

> **Note**: Get your Mapbox token from [Mapbox Dashboard](https://account.mapbox.com/tokens/)

### 3. Verify Dependencies

```bash
npm list
```

## 🏃 Running the Application

### Development Server

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (default Vite port)





## 📁 Project Structure

```
src/
├── components/           # Reusable React components
│   ├── ChargingStations.jsx      # Charging station locator
│   ├── ControlPanel.jsx          # Control interface
│   ├── EVProfile.jsx             # EV profile management
│   ├── MapComponent.jsx          # Mapbox map integration
│   ├── MapView.jsx               # Map view container
│   ├── Navbar.jsx                # Navigation bar
│   ├── RouteAnalysis.jsx         # Route analysis display
│   ├── RouteForm.jsx             # Route input form
│   ├── Sidebar.jsx               # Sidebar navigation
│   └── SustainabilityReport.jsx  # Sustainability metrics
├── services/            # API and service integrations
│   ├── api.js           # HTTP requests (Axios)
│   └── profileService.js # EV profile service
├── App.jsx              # Main app component with routing
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## 🔌 API Integration

The frontend communicates with the backend API through the `services/api.js` module. Ensure the backend is running before starting the frontend.

**Default API URL**: `http://localhost:8000`

Configure the API URL in `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
```

## 🛠️ Technologies Used

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2.0 | UI Framework |
| Vite | 7.3.1 | Build tool & dev server |
| React Router | 7.13.0 | Client-side routing |
| Tailwind CSS | 3.4.19 | Styling |
| Mapbox GL | 3.18.1 | Map visualization |
| Axios | 1.13.5 | HTTP client |
| ESLint | 9.39.1 | Code linting |
| Lucide React | 0.564.0 | Icon library |

## 🌐 State Management

The application uses React Context API for global state management:

- **GlobalStateContext**: Manages application-wide state
  - `evProfile`: EV profile data
  - `routeData`: Current route information
  - `chargingStations`: Nearby charging stations
  - `sustainabilityMetrics`: Environmental metrics

Use the `useGlobalState()` hook to access global state in any component.

## 📝 Component Guidelines

### Creating New Components

1. Create component file in `src/components/`
2. Follow functional component patterns with hooks
3. Use Tailwind CSS for styling
4. Export as named export at the bottom of the file


## 🐛 Troubleshooting

### Port Already in Use

If port 5173 is already in use:

```bash
npm run dev -- --port 3000
```

### API Connection Issues

- Verify backend is running on `http://localhost:8000`
- Check `VITE_API_BASE_URL` in `.env`
- Check browser console for CORS errors

### Missing Mapbox Token

- Get token from [Mapbox Dashboard](https://account.mapbox.com/)
- Add to `.env` as `VITE_MAPBOX_TOKEN`


---

**Happy coding! 🚗⚡**
