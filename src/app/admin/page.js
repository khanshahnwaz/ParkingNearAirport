"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/utils/config";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import OrderManager from "@/components/OrderManager";
import UserManager from "@/components/UserManager";
import PromocodeManager from "@/components/PromocodeManager";
import ParkingOptionManager from "@/components/ParkingOptionManager";
import GrandDiscountManager from "@/components/GrandDiscountManager";
import AnalyticsOverview from "@/components/AnalyticsOverview";
import CompaniesManager from "@/components/CompanyManager";

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState("");

  const [users, setUsers] = useState([]);
  const [promocodes, setPromocodes] = useState([]);
  const [parkingOptions, setParkingOptions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      if (user.role !== "admin") router.replace("/unauthorized");
      else setAuthChecked(true);
    }
  }, [user, router]);

  const fetchData = useCallback(async (endpoint, setter) => {
    try {
      const result = await apiFetch(endpoint, { method: "GET" });
      const data = result.data || result.companies || result;
      setter(data || []);
      return data;
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      setError(`Failed to load ${endpoint}. Check network or API.`);
      return null;
    }
  }, []);

  const fetchUsers = useCallback(() => fetchData("get_users.php", setUsers), [fetchData]);
  const fetchPromocodes = useCallback(() => fetchData("get_promocodes.php", setPromocodes), [fetchData]);
  const fetchParkingOptions = useCallback(() => fetchData("get_parking.php", setParkingOptions), [fetchData]);
  const fetchCompanies = useCallback(() => fetchData("get_companies.php", setCompanies), [fetchData]);
  const fetchOrders = useCallback(() => fetchData("get_all_orders.php", setOrders), [fetchData]);

  useEffect(() => {
    fetchUsers();
    fetchPromocodes();
    fetchParkingOptions();
    fetchCompanies();
    fetchOrders();
  }, [fetchUsers, fetchPromocodes, fetchParkingOptions, fetchCompanies, fetchOrders]);

  const tabs = useMemo(
    () => [
      { key: "overview", label: "Overview" },
      { key: "orders", label: "Orders" },
      { key: "users", label: "Users" },
      { key: "promocodes", label: "Promo Codes" },
      { key: "companies", label: "Companies" },
      { key: "parking", label: "Parking Options" },
      { key: "discount", label: "Grand Discount" },
    ],
    []
  );

  const renderContent = useMemo(() => {
    switch (activeTab) {
      case "overview":
        return (
          <AnalyticsOverview
            users={users}
            orders={orders}
            companies={companies}
            parkingOptions={parkingOptions}
          />
        );
      case "companies":
        return <CompaniesManager />;
      case "orders":
        return <OrderManager orders={orders} fetchOrders={fetchOrders} />;
      case "users":
        return <UserManager users={users} fetchUsers={fetchUsers} />;
      case "promocodes":
        return <PromocodeManager promocodes={promocodes} fetchPromocodes={fetchPromocodes} />;
      case "parking":
        return <ParkingOptionManager parkingOptions={parkingOptions} fetchParkingOptions={fetchParkingOptions} />;
      case "discount":
        return <GrandDiscountManager />;
      default:
        return null;
    }
  }, [activeTab, users, promocodes, parkingOptions, companies, orders]);

  if (!authChecked)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Checking admin access...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-medium">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20 border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Admin Dashboard
          </h1>
          <span className="text-gray-500 text-sm">
            Welcome, {user?.Name || user?.name || user?.email}
          </span>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex space-x-4 overflow-x-auto py-3">
          {tabs.map((tab) => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.03 }}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-6 py-8"
      >
        {renderContent}
      </motion.div>
    </div>
  );
}
