"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash, Power, Loader2, Building2, Mail, Phone, CalendarDays, MapPin } from "lucide-react";
import { apiFetch } from "@/utils/config";

export default function CompanyManager() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  const [formData, setFormData] = useState({
    logo: "",
    name: "",
    tag_line: "",
    email: "",
    phone: "",
    status: "active",
    date_added: "",
  });

  // Fetch companies
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("get_companies.php?action=read");
      setCompanies(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const action = editingCompany ? "update" : "create";
    
    // COMMENT: Creating the payload with the explicit action
    const payload = {
        action: action,
        id: editingCompany?.id,
        ...formData
    };

    try {
        // COMMENT: Explicitly setting method and JSON body for clarity
        await apiFetch("company_api.php", {
            method: "POST",
            body: JSON.stringify(payload)
        });
        
        setShowForm(false);
        setEditingCompany(null);
        fetchCompanies();
    } catch (err) {
        console.error("Error saving company:", err);
    }
};

  // Delete
  const handleDelete = async (id) => {
    if (!confirm("Delete this company?")) return;
    await apiFetch("company_api.php", {
      method: "POST",
      body: JSON.stringify({ action: "delete", id }),
    });
    fetchCompanies();
  };

  // Deactivate / Activate
  const handleToggleActive = async (company) => {
    await apiFetch("company_api.php", {
      method: "POST",
      body: JSON.stringify({
        action: "update",
        id: company.id,
        status: company.activeness === "active" ? "inactive" : "active",
      }),
    });
    fetchCompanies();
  };

  // Edit
  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData(company);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" /> Companies
        </h2>
        <button
          onClick={() => {
            setEditingCompany(null);
            setFormData({
              logo: "",
              name: "",
              tag_line: "",
              email: "",
              phone: "",
              status: "active",
              date_added: "",
            });
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add Company
        </button>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center py-10 text-gray-500">
          <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading...
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-xl shadow-sm border p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={company.logo || "/placeholder.png"}
                    alt={company.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{company.name}</h3>
                    <p className="text-sm text-gray-500">{company.tag_line}</p>
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" /> {company.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> {company.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" /> {company.date_of_addition}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {company.airport_count || 0} airport
                  </p>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <span
                  className={`text-xs px-2 py-1 rounded-md font-medium ${
                    company.activeness === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {company.activeness}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(company)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(company)}
                    className="text-gray-600 hover:text-black"
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingCompany ? "Edit Company" : "Add Company"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="name"
                placeholder="Company Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border rounded-md px-3 py-2"
              />
              <input
                type="text"
                name="tag_line"
                placeholder="Tag Line"
                value={formData.tag_line}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
              <input
                type="text"
                name="logo"
                placeholder="Logo URL"
                value={formData.logo}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
