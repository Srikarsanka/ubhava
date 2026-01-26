// Toast Notification System
// Features: Auto-injects CSS, Simple API, Auto-dismiss

(function() {
    // 1. Inject CSS
    const style = document.createElement('style');
    style.innerHTML = `
        #toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .toast {
            background: white;
            color: #333;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 300px;
            transform: translateX(120%);
            transition: transform 0.3s ease-out;
            border-left: 5px solid #ccc;
            font-family: 'Segoe UI', sans-serif;
            font-size: 14px;
        }

        .toast.slide-in {
            transform: translateX(0);
        }

        .toast.success { border-left-color: #2e7d32; }
        .toast.success i { color: #2e7d32; }
        
        .toast.error { border-left-color: #c62828; }
        .toast.error i { color: #c62828; }
        
        .toast.info { border-left-color: #0288d1; }
        .toast.info i { color: #0288d1; }

        .toast-icon { font-size: 1.2rem; }
        .toast-msg { flex: 1; font-weight: 500; }
    `;
    document.head.appendChild(style);

    // 2. Create Container
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);

    // 3. Define Global Function
    window.showToast = function(message, type = 'info') {
        // Icons mapping (requires FontAwesome, fallback to emoji if needed)
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            info: 'fa-info-circle'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info} toast-icon"></i>
            <span class="toast-msg">${message}</span>
        `;

        container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('slide-in');
        });

        // Auto dismiss
        setTimeout(() => {
            toast.classList.remove('slide-in');
            setTimeout(() => {
                toast.remove();
            }, 300); // Wait for transition
        }, 3000); // Visible time
    };

    console.log("🍞 Toast System Initialized");
})();
