/**
 * MOANSSON — Intelligent Weather & Season Detection Service
 * Detects real-world conditions and maps them to theme states
 */

const axios = require('axios');

// Free weather API (no key needed for basic)
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

// Season mapping for Indian subcontinent
function getIndianSeason(month) {
    if (month >= 3 && month <= 5) return 'summer';
    if (month >= 6 && month <= 9) return 'monsoon';
    if (month >= 10 && month <= 11) return 'autumn';
    return 'winter'; // Dec, Jan, Feb
}

// Weather code to theme mapping (WMO codes from Open-Meteo)
function weatherCodeToTheme(code) {
    // Thunderstorm
    if (code >= 95) return { weather: 'thunderstorm', theme: 'monsoon', intensity: 'heavy' };
    // Rain/Drizzle
    if (code >= 51 && code <= 67) return { weather: 'rain', theme: 'monsoon', intensity: code >= 63 ? 'heavy' : 'light' };
    if (code >= 80 && code <= 82) return { weather: 'rain', theme: 'monsoon', intensity: 'heavy' };
    // Snow
    if (code >= 71 && code <= 77) return { weather: 'snow', theme: 'winter', intensity: 'medium' };
    if (code >= 85 && code <= 86) return { weather: 'snow', theme: 'winter', intensity: 'heavy' };
    // Fog/Mist
    if (code >= 45 && code <= 48) return { weather: 'fog', theme: 'monsoon', intensity: 'light' };
    // Cloudy
    if (code >= 2 && code <= 3) return { weather: 'cloudy', theme: 'monsoon', intensity: 'light' };
    // Clear/Sunny
    if (code <= 1) return { weather: 'clear', theme: 'summer', intensity: 'none' };
    
    return { weather: 'clear', theme: 'summer', intensity: 'none' };
}

// Temperature to mood mapping
function tempToMood(tempC) {
    if (tempC >= 38) return { mood: 'scorching', vfx: ['heat-shimmer'], priority: 'summer' };
    if (tempC >= 30) return { mood: 'warm', vfx: ['sun-rays'], priority: 'summer' };
    if (tempC >= 22) return { mood: 'pleasant', vfx: ['gentle-breeze'], priority: 'summer' };
    if (tempC >= 15) return { mood: 'cool', vfx: ['autumn-leaves'], priority: 'winter' };
    if (tempC >= 5) return { mood: 'cold', vfx: ['frost'], priority: 'winter' };
    return { mood: 'freezing', vfx: ['snowfall', 'frost'], priority: 'winter' };
}

async function getWeatherContext(lat = 17.385, lon = 78.4867) {
    // Default: Hyderabad, India
    try {
        const response = await axios.get(WEATHER_API, {
            params: {
                latitude: lat,
                longitude: lon,
                current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day',
                daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
                timezone: 'Asia/Kolkata',
                forecast_days: 3
            },
            timeout: 5000
        });

        const current = response.data.current;
        const daily = response.data.daily;
        const now = new Date();
        const month = now.getMonth() + 1;

        const weatherInfo = weatherCodeToTheme(current.weather_code);
        const tempInfo = tempToMood(current.temperature_2m);
        const season = getIndianSeason(month);

        // Rain prediction for next 3 days
        const rainForecast = daily.precipitation_sum || [];
        const isRainExpected = rainForecast.some(r => r > 2);

        // Compute final theme priority
        let resolvedTheme = season;

        // Weather overrides season when conditions are strong
        if (weatherInfo.weather === 'rain' || weatherInfo.weather === 'thunderstorm') {
            resolvedTheme = 'monsoon';
        } else if (weatherInfo.weather === 'snow') {
            resolvedTheme = 'winter';
        } else if (current.temperature_2m >= 35) {
            resolvedTheme = 'summer';
        }

        // Reverse geocode to get city name
        let locationName = 'Unknown Location';
        try {
            const geoRes = await axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client`, {
                params: { latitude: lat, longitude: lon, localityLanguage: 'en' },
                timeout: 3000
            });
            if (geoRes.data?.city || geoRes.data?.locality) {
                locationName = geoRes.data.city || geoRes.data.locality;
            }
        } catch (e) {
            // Fallback: use simple lat/lon based city detection
            if (lat > 17 && lat < 18 && lon > 78 && lon < 79) locationName = 'Hyderabad';
            else if (lat > 12 && lat < 14 && lon < 78) locationName = 'Bangalore';
            else if (lat > 18 && lat < 20 && lon > 72 && lon < 73) locationName = 'Mumbai';
            else if (lat > 28 && lat < 29) locationName = 'New Delhi';
            else if (lat > 12 && lat < 14 && lon > 80) locationName = 'Chennai';
            else locationName = `${lat.toFixed(1)}°N, ${lon.toFixed(1)}°E`;
        }

        return {
            success: true,
            location: { lat, lon, name: locationName },
            current: {
                temperature: current.temperature_2m,
                humidity: current.relative_humidity_2m,
                weatherCode: current.weather_code,
                windSpeed: current.wind_speed_10m,
                isDay: current.is_day === 1
            },
            weatherInfo,
            tempInfo,
            season,
            resolvedTheme,
            isRainExpected,
            forecast: {
                nextDays: daily.weather_code?.slice(0, 3) || [],
                maxTemps: daily.temperature_2m_max?.slice(0, 3) || [],
                rainPrediction: rainForecast.slice(0, 3)
            },
            atmosphere: {
                vfx: [
                    ...tempInfo.vfx,
                    ...(weatherInfo.weather === 'rain' ? ['rain-drops', 'wet-surface'] : []),
                    ...(weatherInfo.weather === 'thunderstorm' ? ['rain-drops', 'lightning-flash', 'thunder-rumble'] : []),
                    ...(weatherInfo.weather === 'snow' ? ['snowfall', 'frost-glass'] : []),
                    ...(weatherInfo.weather === 'clear' && current.is_day ? ['sun-glow'] : []),
                    ...(weatherInfo.weather === 'fog' ? ['mist-overlay'] : [])
                ],
                cssOverrides: {
                    monsoon: {
                        '--bg-primary': '#0a1628',
                        '--bg-secondary': '#1a2744',
                        '--text-primary': '#e0e8f5',
                        '--accent': '#4fc3f7',
                        '--glass-bg': 'rgba(255,255,255,0.08)',
                        '--glass-border': 'rgba(255,255,255,0.12)'
                    },
                    summer: {
                        '--bg-primary': '#FFFBF0',
                        '--bg-secondary': '#FFF3E0',
                        '--text-primary': '#4e342e',
                        '--accent': '#ff8f00',
                        '--glass-bg': 'rgba(255,255,255,0.7)',
                        '--glass-border': 'rgba(255,140,0,0.15)'
                    },
                    winter: {
                        '--bg-primary': '#eceff1',
                        '--bg-secondary': '#cfd8dc',
                        '--text-primary': '#263238',
                        '--accent': '#4fc3f7',
                        '--glass-bg': 'rgba(255,255,255,0.6)',
                        '--glass-border': 'rgba(144,202,249,0.2)'
                    }
                }
            }
        };
    } catch (err) {
        console.warn('⛅ Weather API unavailable, using season fallback:', err.message);
        const month = new Date().getMonth() + 1;
        const season = getIndianSeason(month);
        return {
            success: false,
            season,
            resolvedTheme: season,
            weatherInfo: { weather: 'unknown', theme: season, intensity: 'none' },
            tempInfo: { mood: 'unknown', vfx: [], priority: season },
            atmosphere: { vfx: [], cssOverrides: {} }
        };
    }
}

module.exports = { getWeatherContext, getIndianSeason, weatherCodeToTheme };
