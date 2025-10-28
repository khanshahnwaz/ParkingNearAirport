// PROMOCODE MANAGER - Updated with start_date and end_date support

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Loader2, Calendar } from 'lucide-react';
import { apiFetch } from '@/utils/config';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import UsageProgressBar from './UsageProgressBar';

const PromocodeManager = ({ promocodes, fetchPromocodes }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState(null);
  const [editingCode, setEditingCode] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formState, setFormState] = useState({
    id: null,
    code: '',
    label: '',
    discount: '',
    usage_limit: '',
    start_date: '',
    end_date: ''
  });

  const handleOpenModal = (promo = null) => {
    setEditingCode(promo);
    setFormState(
      promo
        ? {
            id: promo.id,
            code: promo.code,
            label: promo.label,
            discount: promo.discount,
            usage_limit: promo.usage_limit || '',
            start_date: promo.start_date || '',
            end_date: promo.end_date || ''
          }
        : {
            id: null,
            code: '',
            label: '',
            discount: '',
            usage_limit: '',
            start_date: '',
            end_date: ''
          }
    );
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleAction = async (action) => {
    setError('');
    setIsSubmitting(true);
    let payload = { action, ...formState };

    payload.discount = parseInt(payload.discount, 10) || 0;
    payload.usage_limit = parseInt(payload.usage_limit, 10) || 0;

    if (action === 'update' && editingCode) payload.id = editingCode.id;

    try {
      await apiFetch('promocodes_crud.php', payload);
      await fetchPromocodes();
      setModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAction(editingCode ? 'update' : 'add');
  };

  const handleConfirmDelete = (promo) => {
    setPromoToDelete(promo);
    setConfirmationOpen(true);
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    setConfirmationOpen(false);
    try {
      await apiFetch('promocodes_crud.php', { action: 'delete', id: promoToDelete.id });
      await fetchPromocodes();
      setPromoToDelete(null);
    } catch (err) {
      console.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-2xl">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-extrabold text-gray-800">Promocodes Management</h2>
        <button
          onClick={() => handleOpenModal(null)}
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition duration-200"
        >
          + Add New Code
        </button>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {promocodes.length === 0 ? (
          <p className="text-gray-500 text-center py-10 text-lg">No promocodes found.</p>
        ) : (
          promocodes.map((promo) => (
            <motion.div
              key={promo.id}
              className="p-5 border rounded-xl shadow hover:shadow-lg transition bg-white"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-mono font-bold text-indigo-700">{promo.code}</h3>
                <span className="px-3 py-1 bg-green-100 text-green-700 font-semibold rounded-full">
                  {promo.discount}%
                </span>
              </div>
              <p className="text-gray-700 mt-2 font-medium">{promo.label}</p>

              <div className="text-xs text-gray-500 mt-3 flex items-center space-x-2">
                <Calendar className="w-3 h-3" />
                <span>
                  {promo.start_date ? promo.start_date : 'N/A'} →{' '}
                  {promo.end_date ? promo.end_date : 'N/A'}
                </span>
              </div>

              <UsageProgressBar uses_count={promo.uses_count} usage_limit={promo.usage_limit} />

              <div className="flex justify-end gap-3 mt-4 border-t pt-3">
                <button
                  onClick={() => handleOpenModal(promo)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleConfirmDelete(promo)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCode ? 'Edit Promocode' : 'Add New Promocode'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <input
            type="text"
            name="code"
            placeholder="Code"
            value={formState.code}
            onChange={handleChange}
            required
            readOnly={!!editingCode}
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="text"
            name="label"
            placeholder="Label"
            value={formState.label}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="number"
            name="discount"
            placeholder="Discount (%)"
            value={formState.discount}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="number"
            name="usage_limit"
            placeholder="Usage Limit (0 for Unlimited)"
            value={formState.usage_limit}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          />
          <div className="flex gap-3">
            <input
              type="date"
              name="start_date"
              value={formState.start_date}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
            <input
              type="date"
              name="end_date"
              value={formState.end_date}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 flex justify-center"
          >
            {isSubmitting && <Loader2 className="animate-spin w-5 h-5 mr-2" />}
            {editingCode ? 'Save Changes' : 'Add Promocode'}
          </button>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={handleDelete}
        item={promoToDelete || { code: '' }}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default PromocodeManager;
