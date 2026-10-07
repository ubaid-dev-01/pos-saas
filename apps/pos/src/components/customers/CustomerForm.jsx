import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../ui/Modal';
import useAuthStore from '../../stores/authStore';
import useCustomerStore from '../../stores/customerStore';
import toast from 'react-hot-toast';
import { useTranslation } from '../../context/LocaleContext';

export default function CustomerForm({ open, onClose, customer }) {
  const { t } = useTranslation();
  const { userDoc } = useAuthStore();
  const { addCustomer, updateCustomer } = useCustomerStore();
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (!open) return;
    if (customer) {
      reset(customer);
    } else {
      reset({ name: '', email: '', phone: '', address: '', creditLimit: 0, currentCredit: 0 });
    }
  }, [open, customer, reset]);

  const onSubmit = async (data) => {
    try {
      if (customer) {
        await updateCustomer(userDoc.storeId, customer.id, {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          creditLimit: Number(data.creditLimit) || 0,
        });
        toast.success(t('toast.updated'));
      } else {
        await addCustomer(userDoc.storeId, data);
        toast.success(t('toast.saved'));
      }
      onClose?.();
    } catch (e) {
      toast.error(e?.message || t('toast.failed'));
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={customer ? t('customers.edit') : t('customers.add')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-sm">
        <div>
          <label className="text-xs text-text-muted">Name *</label>
          <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" {...register('name', { required: true })} />
        </div>
        <div>
          <label className="text-xs text-text-muted">Email</label>
          <input type="email" className="mt-1 w-full rounded-xl border border-border px-3 py-2" {...register('email')} />
        </div>
        <div>
          <label className="text-xs text-text-muted">Phone *</label>
          <input className="mt-1 w-full rounded-xl border border-border px-3 py-2" {...register('phone', { required: true })} />
        </div>
        <div>
          <label className="text-xs text-text-muted">Address</label>
          <textarea rows={2} className="mt-1 w-full rounded-xl border border-border px-3 py-2" {...register('address')} />
        </div>
        <div>
          <label className="text-xs text-text-muted">Credit limit (udhaar)   0 = unlimited</label>
          <input
            type="number"
            min="0"
            className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            {...register('creditLimit')}
          />
        </div>
        {customer && (
          <div className="rounded-xl bg-background p-3 text-xs text-text-muted">
            Current udhaar balance: Rs {Number(customer.currentCredit || 0).toLocaleString()}
          </div>
        )}
        <button type="submit" className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold">
          Save
        </button>
      </form>
    </Modal>
  );
}
