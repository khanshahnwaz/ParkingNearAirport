import { useState } from 'react';

// --- Configuration ---
// !!! IMPORTANT: Update this base URL to point to your PHP backend directory !!!
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE;

/**
 * Handles all API calls using POST method as required by the PHP config.
 * Implements exponential backoff for resilience.
 */
export const apiFetch = async (endpoint, payload = {}) => {
    const url = `${API_BASE_URL}/${endpoint}`;
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!data.ok) {
                // PHP APIs return { ok: false, error: '...' } on failure
                throw new Error(data.error || 'API response indicated failure.');
            }

            return data.data;

        } catch (error) {
            lastError = error;
            console.error(`Attempt ${attempt + 1} failed for ${endpoint}:`, error);

            if (attempt < maxRetries - 1) {
                // Exponential backoff
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    // If all retries fail, throw the last error
    throw new Error(`Failed to fetch ${endpoint} after ${maxRetries} attempts. Last error: ${lastError.message}`);
};
