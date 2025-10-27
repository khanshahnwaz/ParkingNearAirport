"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/utils/config";

import OrderManager from "@/components/OrderManager";
import UserManager from "@/components/UserManager";
import PromocodeManager from "@/components/PromoCodeManager";
import ParkingOptionManager from "@/components/ParkingOptionManager";
import GrandDiscountManager from "@/components/GrandDiscountManager";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import CompaniesManager from "@/components/CompanyManager";

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  // ====== State ======
  const [activeTab, setActiveTab] = useState("orders");
  const [authChecked, setAuthChecked] = useState(false);
  const [users, setUsers] = useState([]);
  const [promocodes, setPromocodes] = useState([]);
  const [parkingOptions, setParkingOptions] = useState([]);
  const [error, setError] = useState("");

  // ====== Auth Check ======
  useEffect(() => {
    if (user) {
      if (user.role !== "admin") router.replace("/unauthorized");
      else setAuthChecked(true);
    }
  }, [user, router]);

  // ====== Generic fetch function ======
  const fetchData = useCallback(async (endpoint, setter) => {
    try {
      const data = await apiFetch(endpoint, {});
      setter(data);
      return data;
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      setError(`Failed to load data for ${endpoint}. Check API_BASE_URL or network.`);
      return null;
    }
  }, []);

  // ====== Stable fetchers ======
  const fetchUsers = useCallback(() => fetchData("get_users.php", setUsers), [fetchData]);
  const fetchPromocodes = useCallback(() => fetchData("get_promocodes.php", setPromocodes), [fetchData]);
  const fetchParkingOptions = useCallback(() => fetchData("get_parking.php", setParkingOptions), [fetchData]);

  // ====== Load data on mount ======
  useEffect(() => {
    fetchUsers();
    fetchPromocodes();
    fetchParkingOptions();
  }, [fetchUsers, fetchPromocodes, fetchParkingOptions]);

  // ====== Tabs ======
  const tabs = useMemo(
    () => [
      { key: "orders", label: "Orders" },
      { key: "users", label: "Users" },
      { key: "promocodes", label: "Promo Codes" },
      { key: "companies", label: "Companies" },
      { key: "parking", label: "Parking Options" },
      { key: "discount", label: "Grand Discount" },
    ],
    []
  );

  // ====== Render content ======
  const renderContent = useMemo(() => {
    switch (activeTab) {
      case "companies":
        return <CompaniesManager/>
      case "orders":
        return <OrderManager />;
      case "users":
        return <UserManager users={users} fetchUsers={fetchUsers} />;
      case "promocodes":
        return (
          <PromocodeManager
            promocodes={promocodes}
            fetchPromocodes={fetchPromocodes}
          />
        );
      case "parking":
        return (
          <ParkingOptionManager
            parkingOptions={parkingOptions}
            fetchParkingOptions={fetchParkingOptions}
          />
        );
      case "discount":
        return <GrandDiscountManager />;
      default:
        return null;
    }
  }, [activeTab, users, promocodes, parkingOptions, fetchUsers, fetchPromocodes, fetchParkingOptions]);

  // ====== Loading state ======
  if (!authChecked) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Checking admin access...
      </div>
    );
  }

  // ====== Error state ======
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-medium">
        {error}
      </div>
    );
  }

  // ====== UI ======
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            Admin Dashboard
          </h1>
          <span className="text-gray-500 text-sm">Welcome, {user?.name}</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-6 flex space-x-4 overflow-x-auto py-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-t-md font-medium transition ${
                activeTab === tab.key
                  ? "bg-white text-blue-600 shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-7xl mx-auto px-6 py-6"
      >
        {renderContent}
      </motion.div>
    </div>
  );
}
