# ClearCam Segmentation Tool

A modern React web application for segmenting laparoscopic surgery images and analyzing lens cleanliness.

## Features

- **Login Page**: Single authentication method with prefilled mock credentials
- **Segmentation Dashboard**: V7-style layout with canvas, toolbars, and sidebars
- **Analytics Dashboard**: Comprehensive charts and statistics with mock data
- **Profile Page**: User profile management

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

## Mock Credentials

- **Email**: `clearcam.com`
- **Password**: `password`

## Tech Stack

- React 18
- React Router DOM
- Tailwind CSS
- Recharts (for analytics charts)
- Vite (build tool)

## Project Structure

```
src/
  components/
    LoginPage.jsx
    SegmentationDashboard.jsx
    SegmentationCanvas.jsx
    ToolPanel.jsx
    LabelSidebar.jsx
    ImageThumbnailGrid.jsx
    StatusBar.jsx
    AnalyticsDashboard.jsx
    ProfilePage.jsx
    NavSidebar.jsx
    TopBar.jsx
  utils/
    mockData.js
  App.jsx
  main.jsx
  index.css
```

