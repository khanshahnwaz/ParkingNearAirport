"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  Plane,
  Calendar,
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Pie,
  PieChart as RPieChart,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

export default function AdminDashboard({
  orders = [],
  users = [],
  companies = [],
  parkingOptions = [],
}) {
  // KPI counts
  const airports = parkingOptions;
  const totalUsers = users?.length || 0;
  const totalCompanies = companies?.length || 0;
  const totalAirports = airports?.length || 0;
  const totalOrders = orders?.length || 0;

  // Successful vs Failed revenue factoring
  const { successRevenue, failedRevenue, successOrders, failedOrders } = useMemo(() => {
    let successRevenue = 0,
      failedRevenue = 0,
      successOrders = 0,
      failedOrders = 0;
    orders.forEach((o) => {
      const amount = parseFloat(o.amount || 0);
      if (o.status === "ACCEPTED" || o.status === "SUCCESS") {
        successRevenue += amount;
        successOrders++;
      } else {
        failedRevenue += amount;
        failedOrders++;
      }
    });
    return { successRevenue, failedRevenue, successOrders, failedOrders };
  }, [orders]);

  const totalRevenue = (successRevenue + failedRevenue).toFixed(2);

  // --- Analytics sections ---

  // Top Companies by Bookings
  const topCompanies = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const name = o?.booking_details?.name?.trim();
      if (name) map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [orders]);

  // Revenue by Company
  const revenueByCompany = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const name = o?.booking_details?.name?.trim();
      const amount = parseFloat(o?.amount || 0);
      if (name && !isNaN(amount)) map[name] = (map[name] || 0) + amount;
    });
    return Object.entries(map)
      .map(([name, revenue]) => ({ name, revenue: parseFloat(revenue.toFixed(2)) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  // Bookings by Location
  const bookingsByLocation = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const loc = o?.booking_details?.location?.trim();
      if (loc) map[loc] = (map[loc] || 0) + 1;
    });
    return Object.entries(map)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [orders]);

  // Bookings over Time
  const bookingsOverTime = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const date = o?.created_at?.split(" ")[0];
      if (date) map[date] = (map[date] || 0) + 1;
    });
    return Object.entries(map)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [orders]);

  // Bookings by Type
  const bookingsByType = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const type = o?.booking_details?.type?.trim();
      if (type) map[type] = (map[type] || 0) + 1;
    });
    return Object.entries(map).map(([type, value]) => ({ type, value }));
  }, [orders]);

  // Revenue breakdown (Success vs Failed)
  const revenueBreakdown = useMemo(
    () => [
      { name: "Successful Revenue", value: parseFloat(successRevenue.toFixed(2)) },
      { name: "Failed Revenue", value: parseFloat(failedRevenue.toFixed(2)) },
    ],
    [successRevenue, failedRevenue]
  );

  // Success/Failure order ratio
  const orderStatusData = useMemo(
    () => [
      { name: "Successful Orders", value: successOrders },
      { name: "Failed Orders", value: failedOrders },
    ],
    [successOrders, failedOrders]
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
        {[
          { title: "Total Users", value: totalUsers, icon: Users, color: "text-blue-600" },
          { title: "Total Companies", value: totalCompanies, icon: Building2, color: "text-emerald-600" },
          { title: "Total Parking Options", value: totalAirports, icon: Plane, color: "text-yellow-600" },
          { title: "Total Orders", value: totalOrders, icon: Calendar, color: "text-purple-600" },
          { title: "Total Revenue", value: `£${totalRevenue}`, icon: DollarSign, color: "text-red-600" },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="bg-white shadow-md rounded-2xl p-5 flex items-center justify-between border"
          >
            <div>
              <p className="text-gray-500 text-sm">{item.title}</p>
              <p className="text-2xl font-semibold text-gray-800">{item.value}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                {/* <span className="text-xs text-green-600">+5% this month</span> */}
              </div>
            </div>
            <item.icon className={`w-10 h-10 ${item.color}`} />
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Companies */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow p-6"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Top Companies by Bookings</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCompanies}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue by Company */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow p-6"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Revenue by Company</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByCompany}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#10b981" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bookings Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow p-6"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Bookings Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bookingsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue Success vs Failed */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow p-6"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Revenue Breakdown (Successful vs Failed)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RPieChart>
              <Pie data={revenueBreakdown} dataKey="value" nameKey="name" outerRadius={100} label>
                {revenueBreakdown.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#10b981" : "#ef4444"} />
                ))}
              </Pie>
              <Tooltip />
            </RPieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bookings by Location */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow p-6 col-span-1 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Top Locations by Bookings</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookingsByLocation}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="location" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Order Success vs Failed */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow p-6 col-span-1 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Orders: Successful vs Failed</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orderStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={8}>
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>


      </div>
    </div>
  );
}
