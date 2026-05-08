# Turkey Inflation Dashboard 🇹🇷 📉

A web-based dashboard for visualizing and analyzing inflation trends in Turkey. This project provides an accessible interface for comparing inflation data from multiple major indices (TÜİK, İTO, ENAG), allowing for a comprehensive view of Turkey's economic trajectory.

**Live Site:** ([Türkiye'de üçlü enflasyon göstergesi paneli](https://sinantankutgulhan.com/turkiyede-enflasyon-enag-tuik-ve-ito-karsilastirmasi/))

## 📋 Overview

As an ongoing economic phenomenon, inflation in Turkey requires accessible tools for longitudinal analysis. This dashboard was developed to provide a clear, interactive visualization of price indices over time, aggregating data from official and alternative sources.

It is designed for students, researchers, and the general public interested in tracking Turkey's economic indicators through a statistical lens.

## 🚀 Key Features

* **Multi-Source Comparison:** Simultaneously visualizes data from three distinct sources:
    * **TÜİK** (Turkish Statistical Institute)
    * **İTO** (Istanbul Chamber of Commerce)
    * **ENAG** (Inflation Research Group)
* **Interactive Visualizations:** Dynamic charts allowing users to toggle datasets and analyze specific time periods.
* **Responsive Design:** Optimized for both desktop and mobile viewing.
* **Resilient Architecture:** Built as a static Single Page Application (SPA) with robust error handling and loading states.

## 🛠️ Technologies Used

* **Frontend:** [React.js](https://react.dev/) (v18+)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
* **Data Handling:** Asynchronous fetch of static JSON datasets.
* **Deployment:** Firebase Hosting for the Turkish dashboard; Vercel for the separate English dashboard.

## 📊 Data & Methodology

The dashboard processes inflation data on the client-side. By default, the application fetches pre-processed JSON datasets located in the public directory:

1.  `tuik_inflation.json` - Official state data.
2.  `ito_simple_inflation.json` - Retail price indices for Istanbul.
3.  `enag_inflation.json` - Alternative academic inflation research data.

### Google Sheets updates

To update the dashboard without rebuilding the static JSON files, publish a Google Sheet as CSV and set this Vite environment variable:

```bash
VITE_GOOGLE_SHEETS_CSV_URL="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit?usp=sharing"
```

The app accepts the regular Google Sheets edit URL and converts it to a CSV endpoint automatically. The sheet must be visible to the deployed dashboard, so use a published/public sheet for the static frontend. Keep a private sheet only if you add a backend proxy or authenticated API layer.

Use one row per month with these columns:

| Column | Example |
| --- | --- |
| `Date` | `Mar 2025` or `Mart 2025` |
| `TÜİK Monthly (%)` | `2.46` |
| `TÜİK Annualized (%)` | `38.10` |
| `ENAG Monthly (%)` | `3.91` |
| `ENAG Annualized (%)` | `75.20` |
| `İTO Monthly (%)` | `3.79` |
| `İTO Annualized (%)` | `46.23` |

Alternatively, replace `Date` with separate `Year` and `Month` columns. The loader accepts Turkish month names and common English month names. If the Google Sheet cannot be loaded, the app falls back to the bundled JSON files.

### Turkish and English deployments

The Turkish dashboard remains the default build, so the existing Firebase deployment can continue using the current settings.

For the separate English blog dashboard on Vercel, create a separate Vercel project from this repository and set:

```bash
VITE_DASHBOARD_LOCALE="en"
```

Use the same `VITE_GOOGLE_SHEETS_CSV_URL` value as the Turkish dashboard if you want both versions to update from the exact same Google Sheet. If this variable is omitted, both deployments use the default Google Sheets URL already configured in the app.

Vercel settings:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |

*> **Note:** This project is for educational and analytical purposes. While efforts are made to ensure data accuracy, users should verify figures with official institutions for citation purposes.*

## 💻 Local Development

To run this project locally for development or contribution:

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/sinantankut/turkey-inflation-dashboard.git](https://github.com/sinantankut/turkey-inflation-dashboard.git)
    cd turkey-inflation-dashboard
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

## 👤 Author

**Dr. Sinan Tankut Gülhan (Doç. Dr. in Turkey)** *Assistant Professor of Sociology, University of Zielona Góra* *Specializations: Urban Sociology, Computational Social Science, Statistics*

[Academic Website](https://en.sinantankutgulhan.com/) | [LinkedIn](https://www.linkedin.com/in/sinan-tankut-gulhan/)

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
