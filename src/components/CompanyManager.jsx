// components/CompanyManager.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash, Power, Loader2, Building2, Mail, Phone, CalendarDays, MapPin, Save, X } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

// --- Local API Fetch Utility (Self-Contained) ---
const localApiFetch = async (endpoint, options = {}) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || ''; 
    const url = `${API_BASE_URL}/${endpoint}`;
    
    const defaultHeaders = options.body && typeof options.body === 'string' 
        ? { 'Content-Type': 'application/json' } 
        : {};

    try {
        const response = await fetch(url, {
            method: options.method || 'GET',
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
            body: options.method !== 'GET' ? options.body : undefined,
        });

        const data = await response.json();

        if (data && data.ok === false) {
            throw new Error(data.error || 'API response indicated failure.');
        }
        return data.data || data.companies || data; 
    } catch (error) {
        throw new Error(error.message || `API request failed for ${endpoint}.`);
    }
};

// --- Dedicated File Upload Utility (Self-Contained) ---
const fileApiFetch = async (endpoint, formData) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';
    const url = `${API_BASE_URL}/${endpoint}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            // CRITICAL: Do NOT set Content-Type for FormData
            body: formData, 
        });

        const data = await response.json();

        if (!data.ok) {
            throw new Error(data.error || 'File upload failed.');
        }

        return data.data || data;

    } catch (error) {
        console.error("File API Fetch Error:", error);
        throw new Error(`File upload failed: ${error.message}`);
    }
};

const ASSET_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || ''; 

// --- Main Component ---
export default function CompanyManager() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);
    
    // NEW STATES for file upload and submission feedback
    const [logoFile, setLogoFile] = useState(null); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null); 

    const [formData, setFormData] = useState({
        logo: "",
        name: "",
        tag_line: "",
        email: "",
        phone: "",
        activeness: "active", // Match DB column name
        airport_count: 0,
        date_of_addition: "", 
    });

    // Fetch companies
    const fetchCompanies = async () => {
        setLoading(true);
        try {
            // Fetch logic updated to use localApiFetch
            const data = await localApiFetch("get_companies.php", { method: 'GET', body: JSON.stringify({ action: "read" }) });
            setCompanies(data || []);
        } catch (e) {
            console.error("Fetch Error:", e);
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

    // NEW: Handle file input change
    const handleFileChange = (e) => {
        setLogoFile(e.target.files[0] || null);
    };

    // Reset form states
    const resetForm = () => {
        setEditingCompany(null);
        setLogoFile(null); // Clear logo file state
        setError(null);
        setFormData({
            logo: "",
            name: "",
            tag_line: "",
            email: "",
            phone: "",
            activeness: "active",
            airport_count: 0,
            date_of_addition: "",
        });
    };

    // Submit form (Handles both JSON and FormData)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        
        const action = editingCompany ? "update" : "create";
        
        // Base payload
        const payload = {
            action: action,
            id: editingCompany?.id,
            ...formData,
            // Use 'status' in payload for PHP switch/update logic
            status: formData.activeness 
        };

        // Ensure name is present for file path creation
        if (!payload.name) {
            setError("Company Name is required for submission.");
            setIsSubmitting(false);
            return;
        }

        try {
            if (logoFile) {
                // --- FILE UPLOAD PATH (FormData) ---
                const formDataPayload = new FormData();
                formDataPayload.append('logo_upload', logoFile);
                
                // Append all text/data fields from payload
                Object.keys(payload).forEach(key => {
                    formDataPayload.append(key, payload[key] === null ? '' : payload[key]);
                });
                
                // For file saving context, PHP uses the company name from $_POST, so no extra context is needed here.

                await fileApiFetch("company_api.php", formDataPayload);
                
            } else {
                // --- STANDARD JSON PATH (No file) ---
                // If logo is empty, explicitly send it (for clearing in update)
                if (action === 'update' && !formData.logo) {
                    payload.logo = ''; 
                } else if (formData.logo) {
                    // Send existing logo path if not changed and not empty
                    payload.logo = formData.logo;
                }

                await localApiFetch("company_api.php", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });
            }
            
            setShowForm(false);
            resetForm();
            fetchCompanies();
        } catch (err) {
            console.error("Error saving company:", err);
            setError(err.message || "Failed to save company details.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete
    const handleDelete = async (id) => {
        if (!confirm("Delete this company?")) return;
        try {
             await localApiFetch("company_api.php", {
                method: "POST",
                body: JSON.stringify({ action: "delete", id }),
            });
            fetchCompanies();
        } catch (err) {
            console.error("Delete Error:", err);
            alert(`Deletion failed: ${err.message}`); 
        }
    };

    // Deactivate / Activate
    const handleToggleActive = async (company) => {
        try {
             await localApiFetch("company_api.php", {
                method: "POST",
                body: JSON.stringify({
                    action: "update",
                    id: company.id,
                    // Send new status using the 'status' key
                    status: company.activeness === "active" ? "inactive" : "active", 
                }),
            });
            fetchCompanies();
        } catch (err) {
             console.error("Toggle Error:", err);
        }
    };

    // Edit
    const handleEdit = (company) => {
        setEditingCompany(company);
        setFormData({ 
            ...company, 
            // Map DB 'activeness' back to form 'status' for select input
            status: company.activeness 
        });
        setLogoFile(null); // Clear file input on edit
        setShowForm(true);
    };

    // Helper to get the correct image URL
    const getLogoUrl = (path) => {
        if (!path) return 'https://placehold.co/48x48/f1f5f9/1e293b?text=CO'; 
        // Ensure the absolute path is constructed for assets
        return `${ASSET_BASE_URL}${path}`;
    }


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-indigo-600" /> Company Management
                </h2>
                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-indigo-700 shadow-md transition"
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companies.map((company) => (
                        <div
                            key={company.id}
                            className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:border-indigo-200"
                        >
                            <div>
                                <div className="flex items-center gap-4 mb-4 border-b pb-3">
                                    <img
                                        // Use helper for correct URL resolution
                                        src={getLogoUrl(company.logo)}
                                        alt={company.name}
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/50"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/48x48/f1f5f9/1e293b?text=CO'; }}
                                    />
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-900">{company.name}</h3>
                                        <p className="text-sm text-gray-500">{company.tag_line}</p>
                                    </div>
                                </div>

                                <div className="text-sm text-gray-700 space-y-2">
                                    <p className="flex items-center gap-2 truncate">
                                        <Mail className="w-4 h-4 text-indigo-500" /> {company.email}
                                    </p>
                                    <p className="flex items-center gap-2 truncate">
                                        <Phone className="w-4 h-4 text-indigo-500" /> {company.phone}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-indigo-500" /> Airports: <span className="font-medium">{company.airport_count || 0}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <CalendarDays className="w-4 h-4 text-indigo-500" /> Since: <span className="font-medium">{company.date_of_addition ? new Date(company.date_of_addition).toLocaleDateString() : 'N/A'}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                                <span
                                    className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                                        company.activeness === "active"
                                            ? "bg-green-100 text-green-700 ring-1 ring-green-300"
                                            : "bg-gray-200 text-gray-600 ring-1 ring-gray-400"
                                    }`}
                                >
                                    {company.activeness}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(company)}
                                        className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-100 transition"
                                        title="Edit"
                                    >
                                        <Pencil className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(company.id)}
                                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition"
                                        title="Delete"
                                    >
                                        <Trash className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleToggleActive(company)}
                                        className={`p-2 rounded-full hover:bg-gray-100 transition ${
                                            company.activeness === "active" ? "text-green-600 hover:text-gray-800" : "text-red-600 hover:text-green-600"
                                        }`}
                                        title={company.activeness === "active" ? "Deactivate" : "Activate"}
                                    >
                                        <Power className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                             <h3 className="text-xl font-bold text-gray-800">
                                {editingCompany ? "Edit Company" : "Add Company"}
                            </h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                       
                        {error && <p className="text-red-600 text-sm p-2 bg-red-100 rounded-lg mb-4">{error}</p>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Logo File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Company Logo</label>
                                <input 
                                    type="file" 
                                    name="logo_upload" 
                                    onChange={handleFileChange} 
                                    accept="image/*"
                                    className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white file:py-2 file:px-4 file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                                {/* Display feedback based on file state */}
                                {(editingCompany && editingCompany.logo && !logoFile) && (
                                    <>
                                        <p className="text-xs text-gray-500 mt-1 truncate">Current: {editingCompany.logo.split('/').pop()}</p>
                                        <img 
                                            src={getLogoUrl(editingCompany.logo)} 
                                            alt="Current Logo" 
                                            className="w-16 h-16 object-contain border rounded p-1 mt-2"
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/64x64/cccccc/000000?text=LOGO'; }}
                                        />
                                    </>
                                )}
                                {logoFile && (
                                    <p className="text-xs text-green-600 mt-1">Ready to upload: {logoFile.name}</p>
                                )}

                            </div>
                             {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Company Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full border rounded-lg px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            {/* Tag Line */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tag Line</label>
                                <input
                                    type="text"
                                    name="tag_line"
                                    placeholder="Tag Line"
                                    value={formData.tag_line}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            {/* Status (Activeness) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    name="activeness"
                                    value={formData.activeness}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center transition disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : <Save className="w-5 h-5 mr-2"/>}
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
