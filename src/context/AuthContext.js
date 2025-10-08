"use client";
import { createContext, useContext, useState, useEffect, useMemo } from "react";

// !!! IMPORTANT: Update this base URL to point to your PHP backend directory !!!
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE // <--- CHANGE THIS VALUE

// --- Local API Fetch Utility (Copied from lib/api.js for context self-containment) ---
const apiFetch = async (endpoint, payload = {}) => {
    const url = `${API_BASE_URL}/${endpoint}`;
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) {
                // PHP APIs should set data.ok = false for errors, but check HTTP status just in case.
                 throw new Error(data.error || `Server error (HTTP ${response.status})`);
            }
            if (!data.ok) {
                throw new Error(data.error || 'API response indicated failure.');
            }
            return data.data;
        } catch (error) {
            lastError = error;
            console.error(`Attempt ${attempt + 1} failed for ${endpoint}:`, error.message);
            if (attempt < maxRetries - 1) {
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw new Error(`Failed to fetch ${endpoint} after ${maxRetries} attempts. Last error: ${lastError ? lastError.message : 'Unknown error'}`);
};
// --- End Local API Fetch Utility ---


const AuthContext = createContext();

export function AuthProvider({ children }) {
    // Existing States
    const [user, setUser] = useState(null);
    const[paymentReceipt,setPaymentReceipt]=useState(null);

    // New States for Application Data
    const [parkingOptions, setParkingOptions] = useState([]);
    const [promoCodes, setPromocodes] = useState([]);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [dataError, setDataError] = useState(null);

    // Derived State: Unique airport locations from parking data
    const airportLocations = useMemo(() => {
        const locations = new Set(parkingOptions.map(option => option.location));
        return Array.from(locations);
    }, [parkingOptions]);
    
    // Existing Effect for user persistence
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    // New Effect for fetching dynamic application data
    useEffect(() => {
        const loadAppData = async () => {
            setIsDataLoading(true);
            setDataError(null);
            
            try {
                // 1. Fetch Parking Options
                const parkingData = await apiFetch('get_parking.php', {});
                setParkingOptions(parkingData || []);
                
                // 2. Fetch Promocodes
                const promoData = await apiFetch('get_promocodes.php', {});
                setPromocodes(promoData || []);
                
            } catch (err) {
                console.error("Failed to load application data:", err);
                setDataError("Failed to load parking and promotion data from the server.");
            } finally {
                setIsDataLoading(false);
            }
        };

        loadAppData();
    }, []);
    // End New Effect

    // Existing functions
    const login = (userData) => {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider 
            value={{ 
                // Existing variables
                user, 
                login, 
                logout,
                paymentReceipt,
                setPaymentReceipt,
                
                // New application data variables
                parkingOptions,
                promoCodes,
                airportLocations,
                isDataLoading,
                dataError
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
