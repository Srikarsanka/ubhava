const fs = require('fs');
const path = require('path');

const filePath = 'c:\\pride pt 2 project\\public\\index.css';
const cssToAppend = `
/* --- Abundance VFX Particles --- */
.particle-grain {
    width: 6px;
    height: 10px;
    background: #FFD700;
    border-radius: 50% 50% 40% 40%;
    box-shadow: 0 0 5px rgba(255,165,0,0.3);
    animation: fallAmbient 8s linear infinite;
    z-index: 5;
    position: absolute;
    top: -20px;
}

.particle-flower {
    width: 12px;
    height: 12px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(255,255,255,0.8);
    position: absolute;
    top: -20px;
    animation: fallAmbient 10s linear infinite;
    z-index: 5;
}

.particle-flower::after {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    width: 4px; height: 4px;
    background: #fdf5e6;
    border-radius: 50%;
    transform: translate(-50%, -50%);
}

@keyframes fallAmbient {
    0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
    10% { opacity: 0.8; }
    90% { opacity: 0.8; }
    100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
}

/* Mango Leaf Toran for Spring/Ugadi */
.mango-toran {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 60px;
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='60' viewBox='0 0 100 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0 Q 30 50 50 0' stroke='%234c9a2a' fill='none' stroke-width='3'/%3E%3Cpath d='M0 0 L15 45 L30 0' fill='%2368bb59' fill-opacity='0.8'/%3E%3Cpath d='M35 0 L50 45 L65 0' fill='%234c9a2a' fill-opacity='0.9'/%3E%3Cpath d='M70 0 L85 45 L100 0' fill='%2368bb59' fill-opacity='0.8'/%3E%3Ccircle cx='15' cy='0' r='3' fill='%23ff4500'/%3E%3Ccircle cx='50' cy='0' r='3' fill='%23ff4500'/%3E%3Ccircle cx='85' cy='0' r='3' fill='%23ff4500'/%3E%3C/svg%3E");
    background-repeat: repeat-x;
    z-index: 10;
}

/* Harvest Product Showcase (Golden Abundance) */
.harvest-theme + .festival-product-showcase {
    background-color: #fff9e6 !important;
    background-image: 
        radial-gradient(circle at 70% 30%, rgba(255, 215, 0, 0.1) 0%, transparent 100%),
        url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 10 L65 50 L105 55 L65 60 L60 100 L55 60 L15 55 L55 50 Z' fill='%23FFD700' fill-opacity='0.03'/%3E%3C/svg%3E") !important;
    border-top: 5px solid #FFD700;
}

/* Spring Product Showcase (Fresh Bloom) */
.spring-theme + .festival-product-showcase {
    background-color: #f7fff0 !important;
    background-image: 
        radial-gradient(circle at 30% 70%, rgba(104, 187, 89, 0.1) 0%, transparent 100%),
        url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='40' stroke='%2368bb59' stroke-opacity='0.03' fill='none' stroke-dasharray='4 2'/%3E%3C/svg%3E") !important;
    border-top: 5px solid #68bb59;
}
`;

fs.appendFileSync(filePath, cssToAppend);
console.log('✅ CSS Appended successfully!');
