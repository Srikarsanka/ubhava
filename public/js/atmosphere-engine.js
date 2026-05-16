/**
 * MOANSSON — Intelligent Atmosphere Engine
 * Real-time weather-aware UI with rain, snow, sun, and dynamic CSS theming
 */

const AtmosphereEngine = {
    currentTheme: null,
    weatherData: null,
    rainCanvas: null,
    snowCanvas: null,
    animFrameId: null,

    async init() {
        console.log('🌧️ Moansson Atmosphere Engine: Booting...');

        // 1. Try to get user location
        let lat = 13.0827, lon = 80.2707; // Default: Chennai
        try {
            const pos = await this.getLocation();
            lat = pos.latitude;
            lon = pos.longitude;
        } catch (e) {
            console.log('📍 Location unavailable, using Chennai default');
        }

        // 2. Fetch weather context from backend
        try {
            const res = await fetch(`/api/weather-context?lat=${lat}&lon=${lon}`);
            this.weatherData = await res.json();
            console.log(`⛅ Weather: ${this.weatherData.current?.temperature}°C | ${this.weatherData.weatherInfo?.weather} | Theme: ${this.weatherData.resolvedTheme}`);
        } catch (err) {
            console.warn('Weather fetch failed, using season fallback');
            const month = new Date().getMonth() + 1;
            this.weatherData = {
                resolvedTheme: month >= 6 && month <= 9 ? 'monsoon' : month >= 3 && month <= 5 ? 'summer' : 'winter',
                weatherInfo: { weather: 'clear' },
                atmosphere: { vfx: [] }
            };
        }

        // Check for Admin Preview Override
        const urlParams = new URLSearchParams(window.location.search);
        const previewTheme = urlParams.get('previewTheme');
        if (['summer', 'monsoon', 'winter'].includes(previewTheme)) {
            this.weatherData.resolvedTheme = previewTheme;
            // Fake weather data to match preview
            this.weatherData.weatherInfo = { weather: previewTheme === 'summer' ? 'clear' : previewTheme === 'monsoon' ? 'rain' : 'snow' };
            if (!this.weatherData.atmosphere) this.weatherData.atmosphere = { vfx: [] };
            this.weatherData.atmosphere.vfx = previewTheme === 'summer' ? ['sun-glow'] : previewTheme === 'monsoon' ? ['rain-drops'] : ['snowfall'];
        }

        // 3. Apply theme
        this.applyTheme(this.weatherData.resolvedTheme);

        // 4. Start ambient VFX
        this.startAtmosphericVFX();

        // 5. Inject weather status bar
        this.injectWeatherBar();
    },

    getLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) return reject('No geolocation');
            navigator.geolocation.getCurrentPosition(
                pos => resolve(pos.coords),
                err => reject(err),
                { timeout: 10000, maximumAge: 60000 }
            );
        });
    },

    applyTheme(theme) {
        this.currentTheme = theme;
        const root = document.documentElement;
        const body = document.body;

        // Remove old theme classes
        body.classList.remove('moansson-summer', 'moansson-monsoon', 'moansson-winter');
        body.classList.add(`moansson-${theme}`);

        // Apply CSS variable overrides for dynamic theming
        const overrides = this.weatherData?.atmosphere?.cssOverrides?.[theme];
        if (overrides) {
            Object.entries(overrides).forEach(([prop, val]) => {
                root.style.setProperty(prop, val);
            });
        }

        console.log(`🎨 Theme applied: ${theme}`);
    },

    startAtmosphericVFX() {
        const vfxList = this.weatherData?.atmosphere?.vfx || [];
        const weather = this.weatherData?.weatherInfo?.weather || 'clear';
        const theme = this.currentTheme;

        // Create atmosphere container
        let container = document.getElementById('moansson-atmosphere');
        if (!container) {
            container = document.createElement('div');
            container.id = 'moansson-atmosphere';
            document.body.appendChild(container);
        }
        container.innerHTML = '';

        // Rain
        if (theme === 'monsoon' || weather === 'rain' || weather === 'thunderstorm') {
            this.createRainEffect(container);
        }

        // Snow
        if (theme === 'winter' || weather === 'snow') {
            this.createSnowEffect(container);
        }

        // Sun glow
        if (theme === 'summer' && weather === 'clear') {
            this.createSunGlow(container);
        }

        // Lightning
        if (weather === 'thunderstorm') {
            this.createLightningEffect(container);
        }
    },

    // ═══════════ RAIN EFFECT ═══════════
    createRainEffect(container) {
        const canvas = document.createElement('canvas');
        canvas.className = 'atmo-canvas rain-canvas';
        container.appendChild(canvas);
        this.rainCanvas = canvas;

        const ctx = canvas.getContext('2d');
        const drops = [];
        const splashes = [];
        const intensity = this.weatherData?.weatherInfo?.intensity === 'heavy' ? 200 : 80;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        // Create drops
        for (let i = 0; i < intensity; i++) {
            drops.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                length: 15 + Math.random() * 25,
                speed: 12 + Math.random() * 8,
                opacity: 0.15 + Math.random() * 0.25,
                width: 1 + Math.random() * 1.5
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw rain streaks
            drops.forEach(drop => {
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x - 1, drop.y + drop.length);
                ctx.strokeStyle = `rgba(174, 214, 241, ${drop.opacity})`;
                ctx.lineWidth = drop.width;
                ctx.stroke();

                drop.y += drop.speed;
                drop.x -= 0.5; // Wind drift

                // Splash at bottom
                if (drop.y > canvas.height) {
                    splashes.push({
                        x: drop.x,
                        y: canvas.height - 5,
                        radius: 2,
                        maxRadius: 4 + Math.random() * 3,
                        opacity: 0.4
                    });
                    drop.y = -drop.length;
                    drop.x = Math.random() * canvas.width;
                }
            });

            // Draw splashes
            for (let i = splashes.length - 1; i >= 0; i--) {
                const s = splashes[i];
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(174, 214, 241, ${s.opacity})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
                s.radius += 0.3;
                s.opacity -= 0.02;
                if (s.opacity <= 0) splashes.splice(i, 1);
            }

            requestAnimationFrame(animate);
        }
        animate();
    },

    // ═══════════ SNOW EFFECT ═══════════
    createSnowEffect(container) {
        const canvas = document.createElement('canvas');
        canvas.className = 'atmo-canvas snow-canvas';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const flakes = [];

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        for (let i = 0; i < 100; i++) {
            flakes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: 1 + Math.random() * 3,
                speed: 0.5 + Math.random() * 1.5,
                drift: Math.random() * 0.5 - 0.25,
                opacity: 0.3 + Math.random() * 0.5
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            flakes.forEach(f => {
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
                ctx.fill();

                // Gentle glow
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.radius * 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(200, 220, 255, ${f.opacity * 0.15})`;
                ctx.fill();

                f.y += f.speed;
                f.x += f.drift + Math.sin(f.y * 0.01) * 0.3;

                if (f.y > canvas.height) {
                    f.y = -f.radius;
                    f.x = Math.random() * canvas.width;
                }
            });

            requestAnimationFrame(animate);
        }
        animate();
    },

    // ═══════════ SUN GLOW ═══════════
    createSunGlow(container) {
        const glow = document.createElement('div');
        glow.className = 'atmo-sun-glow';
        container.appendChild(glow);

        // Floating light particles
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'atmo-sun-particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 8}s`;
            particle.style.animationDuration = `${6 + Math.random() * 6}s`;
            particle.style.width = `${3 + Math.random() * 5}px`;
            particle.style.height = particle.style.width;
            particle.style.opacity = 0.2 + Math.random() * 0.3;
            container.appendChild(particle);
        }
    },

    // ═══════════ LIGHTNING ═══════════
    createLightningEffect(container) {
        const flash = document.createElement('div');
        flash.className = 'atmo-lightning-flash';
        container.appendChild(flash);

        function triggerLightning() {
            flash.style.opacity = '0.8';
            setTimeout(() => { flash.style.opacity = '0'; }, 80);
            setTimeout(() => { flash.style.opacity = '0.4'; }, 150);
            setTimeout(() => { flash.style.opacity = '0'; }, 200);

            // Random interval 5-20 seconds
            setTimeout(triggerLightning, 5000 + Math.random() * 15000);
        }
        setTimeout(triggerLightning, 2000 + Math.random() * 5000);
    },

    // ═══════════ WEATHER STATUS BAR + PRECAUTIONS ═══════════
    injectWeatherBar() {
        if (!this.weatherData?.current) return;

        const bar = document.createElement('div');
        bar.id = 'moansson-weather-bar';

        const temp = Math.round(this.weatherData.current.temperature);
        const humidity = this.weatherData.current.humidity;
        const wind = Math.round(this.weatherData.current.windSpeed);
        const weather = this.weatherData.weatherInfo.weather;
        const theme = this.currentTheme;
        const mood = this.weatherData.tempInfo?.mood || 'pleasant';

        const icons = {
            rain: '🌧️', thunderstorm: '⛈️', snow: '❄️',
            clear: '☀️', cloudy: '⛅', fog: '🌫️', unknown: '🌡️'
        };

        // Smart precautions based on conditions
        const precautions = this.getPrecautions(weather, temp, humidity, wind);
        const precautionHTML = precautions.map(p => 
            `<div class="precaution-item"><span class="precaution-icon">${p.icon}</span><span>${p.text}</span></div>`
        ).join('');

        const locationName = this.weatherData.location?.name || 'Hyderabad';
        
        bar.innerHTML = `
            <div class="weather-bar-inner">
                <span class="weather-bar-icon">${icons[weather] || icons.unknown}</span>
                <span class="weather-bar-temp">${temp}°C</span>
                <span class="weather-bar-divider">|</span>
                <span class="weather-bar-location" style="margin-right: 8px;">📍 ${locationName}</span>
                <span class="weather-bar-label">${theme.charAt(0).toUpperCase() + theme.slice(1)} Collection</span>
                
                <div class="weather-precaution-tooltip">
                    <div class="precaution-title">
                        <span>🛡️</span> Today's Advisory for ${locationName}
                    </div>
                    <div class="weather-detail-row">
                        <span class="weather-detail-label">Temperature</span>
                        <span class="weather-detail-value">${temp}°C — ${mood}</span>
                    </div>
                    <div class="weather-detail-row">
                        <span class="weather-detail-label">Humidity</span>
                        <span class="weather-detail-value">${humidity}%</span>
                    </div>
                    <div class="weather-detail-row">
                        <span class="weather-detail-label">Wind</span>
                        <span class="weather-detail-value">${wind} km/h</span>
                    </div>
                    <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(128,128,128,0.15);">
                        ${precautionHTML}
                    </div>
                </div>
            </div>
        `;

        // Insert after navbar or header
        const navbar = document.querySelector('.navbar') || document.querySelector('header');
        if (navbar) {
            navbar.parentNode.insertBefore(bar, navbar.nextSibling);
        }
    },

    getPrecautions(weather, temp, humidity, wind) {
        const tips = [];

        // Temperature-based
        if (temp >= 40) {
            tips.push({ icon: '🔥', text: 'Extreme heat — stay hydrated, wear light cotton' });
            tips.push({ icon: '🧴', text: 'Apply SPF 50+ sunscreen before heading out' });
        } else if (temp >= 35) {
            tips.push({ icon: '☀️', text: 'Hot day — opt for breathable cotton fabrics' });
            tips.push({ icon: '💧', text: 'Keep hydrated, carry a water bottle' });
        } else if (temp >= 25) {
            tips.push({ icon: '🌤️', text: 'Warm & pleasant — light clothing recommended' });
        } else if (temp >= 15) {
            tips.push({ icon: '🧥', text: 'Cool breeze — layer up with a light jacket' });
        } else if (temp >= 5) {
            tips.push({ icon: '🧣', text: 'Cold — wear warm layers and a scarf' });
        } else {
            tips.push({ icon: '❄️', text: 'Freezing temps — bundle up with heavy winter wear' });
        }

        // Weather-based
        if (weather === 'rain' || weather === 'thunderstorm') {
            tips.push({ icon: '🌂', text: 'Rain expected — carry waterproof gear' });
            if (weather === 'thunderstorm') {
                tips.push({ icon: '⚡', text: 'Thunderstorm alert — avoid open areas' });
            }
        }
        if (weather === 'snow') {
            tips.push({ icon: '🧤', text: 'Snowfall — wear insulated & waterproof boots' });
        }
        if (weather === 'fog') {
            tips.push({ icon: '🌫️', text: 'Low visibility fog — drive carefully' });
        }

        // Humidity-based
        if (humidity >= 80) {
            tips.push({ icon: '💦', text: 'High humidity — choose moisture-wicking fabrics' });
        }

        // Wind-based
        if (wind >= 30) {
            tips.push({ icon: '💨', text: 'Strong winds — secure loose clothing' });
        }

        return tips.slice(0, 4); // Max 4 precautions
    }
};

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to let festival system load first
    setTimeout(() => AtmosphereEngine.init(), 1500);
});
