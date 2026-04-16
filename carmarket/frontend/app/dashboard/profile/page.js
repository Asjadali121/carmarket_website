'use client';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../../../store/slices/authSlice';
import toast from 'react-hot-toast';
import { authAPI } from '../../../lib/api';

export default function ProfilePage() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    bio: user?.bio || '',
  });
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await dispatch(updateProfile(form));
    if (updateProfile.fulfilled.match(result)) toast.success('Profile updated!');
    else toast.error('Update failed');
    setSaving(false);
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setSavingPw(true);
    try {
      await authAPI.changePassword(pwForm);
      toast.success('Password changed!');
      setPwForm({ old_password: '', new_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.old_password?.[0] || 'Failed to change password');
    }
    setSavingPw(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div>
            <p className="font-bold text-lg text-gray-800">{user?.first_name} {user?.last_name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className={`badge text-xs mt-1 ${user?.role === 'seller' ? 'bg-blue-100 text-blue-700' : user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">First Name</label>
              <input className="input-field mt-1" value={form.first_name} onChange={e => setForm(p => ({...p, first_name: e.target.value}))} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <input className="input-field mt-1" value={form.last_name} onChange={e => setForm(p => ({...p, last_name: e.target.value}))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input className="input-field mt-1" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder="03XX-XXXXXXX" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">City</label>
            <input className="input-field mt-1" value={form.city} onChange={e => setForm(p => ({...p, city: e.target.value}))} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Bio</label>
            <textarea className="input-field mt-1" rows="3" value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))} placeholder="Tell buyers about yourself..." />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-2.5">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Change Password</h2>
        <form onSubmit={handlePassword} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Current Password</label>
            <input type="password" className="input-field mt-1" value={pwForm.old_password} onChange={e => setPwForm(p => ({...p, old_password: e.target.value}))} required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <input type="password" className="input-field mt-1" value={pwForm.new_password} onChange={e => setPwForm(p => ({...p, new_password: e.target.value}))} required minLength={8} />
          </div>
          <button type="submit" disabled={savingPw} className="btn-primary w-full py-2.5">
            {savingPw ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
