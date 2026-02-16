// shared.js - Funções compartilhadas entre todas as páginas

// Dark Mode functionality
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeIcon = document.getElementById('darkModeIcon');
    const html = document.documentElement;
    
    if (!darkModeToggle || !darkModeIcon) return;

    // Check localStorage for saved preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        html.classList.add('dark');
        darkModeIcon.textContent = '☀️';
    }

    darkModeToggle.addEventListener('click', () => {
        html.classList.toggle('dark');
        const isDark = html.classList.contains('dark');
        localStorage.setItem('darkMode', isDark);
        darkModeIcon.textContent = isDark ? '☀️' : '🌙';
    });
}

// Format number to Brazilian locale
function formatNumber(num, decimals = 0) {
    return num.toLocaleString('pt-BR', { 
        minimumFractionDigits: decimals, 
        maximumFractionDigits: decimals 
    });
}

// Common growth class getters
function getGrowthClass(delta, thresholds = {}) {
    const { high = 25, medium = 20, low = 15 } = thresholds;
    if (delta >= high) return 'growth-high';
    if (delta >= medium) return 'growth-medium';
    if (delta >= low) return 'growth-low';
    return 'growth-neg';
}

function getGrowthIcon(delta, icons = {}) {
    const { high = '🚀', medium = '🔥', low = '✓', negative = '↓' } = icons;
    if (delta >= 80) return high;
    if (delta >= 25) return medium;
    if (delta >= 20) return low;
    if (delta < 0) return negative;
    return '';
}

// Data loading with retry and fallback
async function fetchDataWithRetry(url, retries = 3, delay = 1000) {
    const paths = [
        url,
        './dados/dados.json',
        'dados/dados.json',
        '/dados/dados.json'
    ];
    
    for (const path of paths) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.warn(`Tentativa ${i + 1} falhou para ${path}:`, error.message);
                if (i < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
    }
    
    throw new Error('Não foi possível carregar os dados após várias tentativas');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDarkMode);
} else {
    initDarkMode();
}
