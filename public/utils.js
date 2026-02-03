/* =========================================
   UTILITIES & HELPER FUNCTIONS
   Shared logic for formatting and math
   ========================================= */

// 1. FORMATTING
export const Format = {
    /**
     * Format number to Indian Currency (₹ 50,000)
     */
    currency: (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumSignificantDigits: 3
        }).format(amount);
    },

    /**
     * Get current timestamp in "HH:MM:SS"
     */
    timestamp: () => {
        return new Date().toLocaleTimeString('en-US', { hour12: false });
    }
};

// 2. RANDOMIZERS (RNG)
export const Random = {
    /**
     * Get a random integer between min and max
     */
    int: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },

    /**
     * Pick a random item from an array
     */
    choice: (array) => {
        return array[Math.floor(Math.random() * array.length)];
    }
};

// 3. ASYNC DELAY (Sleep function)
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
