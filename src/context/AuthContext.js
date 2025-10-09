"use client";
import { createContext, useContext, useState, useEffect, useMemo } from "react";

// !!! IMPORTANT: Update this base URL to point to your PHP backend directory !!!
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE // <--- CHANGE THIS VALUE

// --- Local API Fetch Utility (Updated to handle different HTTP methods) ---
// NOTE: We need to modify this utility to handle GET requests for the discount
const apiFetch = async (endpoint, payload = {}, method = 'POST') => {
    const url = `${API_BASE_URL}/${endpoint}`;
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const fetchOptions = {
                method: method,
                headers: {},
            };
            
            if (method === 'POST' || method === 'PUT') {
                fetchOptions.headers['Content-Type'] = 'application/json';
                fetchOptions.body = JSON.stringify(payload);
            }
            
            // For GET, payload is expected to be null or empty, and no body is sent.

            const response = await fetch(url, fetchOptions);
            const data = await response.json();

            if (!response.ok) {
                 throw new Error(data.error || `Server error (HTTP ${response.status})`);
            }
            if (!data.ok) {
                throw new Error(data.error || 'API response indicated failure.');
            }
            // Your PHP APIs return data.data or data.discount
            return data.data || data.discount; 
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

    // New State for GRAND DISCOUNT 👈 NEW
    const [grandDiscount, setGrandDiscount] = useState(0); 

    // Existing States for Application Data
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

    // Effect for fetching dynamic application data
    useEffect(() => {
        const loadAppData = async () => {
            setIsDataLoading(true);
            setDataError(null);
            
            try {
                // 1. Fetch Parking Options (POST, default method)
                const parkingData = await apiFetch('get_parking.php', {});
                setParkingOptions(parkingData || []);
                
                // 2. Fetch Promocodes (POST, default method)
                const promoData = await apiFetch('get_promocodes.php', {});
                setPromocodes(promoData || []);

                // 3. Fetch Grand Discount (GET) 👈 NEW FETCH
                // We pass null for the payload and 'GET' for the method
                const discountValue = await apiFetch('grand-discount-api.php', null,'GET');
                // The API returns the number directly (e.g., 25.5)
                setGrandDiscount(parseFloat(discountValue) || 0);

            } catch (err) {
                console.error("Failed to load application data:", err);
                setDataError("Failed to load data from the server.");
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
                dataError,

                // New Discount Variable 👈 EXPOSED
                grandDiscount 
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}