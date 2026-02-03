/* =========================================
   SETTINGS MANAGER
   Handles: Audio/Video Preferences
   ========================================= */

// DEFAULT CONFIG
const defaultConfig = {
    sfx: true,
    voice: true,
    haptic: true,
    gfx: true,
    vfx: true
};

// ELEMENTS
const toggles = {
    sfx: document.getElementById('toggle-sfx'),
    voice: document.getElementById('toggle-voice'),
    haptic: document.getElementById('toggle-haptic'),
    gfx: document.getElementById('toggle-gfx'),
    vfx: document.getElementById('toggle-vfx')
};

// 1. INITIALIZE
function initSettings() {
    const saved = localStorage.getItem('CV_Settings');
    const config = saved ? JSON.parse(saved) : defaultConfig;

    // Apply to UI
    for (let key in toggles) {
        if (toggles[key]) {
            toggles[key].checked = config[key];
            toggles[key].addEventListener('change', () => saveSettings());
        }
    }
}

// 2. SAVE CONFIG
function saveSettings() {
    const newConfig = {};
    for (let key in toggles) {
        if (toggles[key]) {
            newConfig[key] = toggles[key].checked;
        }
    }
    
    localStorage.setItem('CV_Settings', JSON.stringify(newConfig));
    // Broadcast change
    window.dispatchEvent(new Event('settingsChanged'));
}

// 3. EXPORT HELPER (For other files to read)
export const getSetting = (key) => {
    const saved = localStorage.getItem('CV_Settings');
    const config = saved ? JSON.parse(saved) : defaultConfig;
    return config[key];
};

// Run Init
initSettings();
