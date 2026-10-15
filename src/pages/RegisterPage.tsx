import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import { GraduationCap, User, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    studentFacultyId: '',
    department: 'Computer Applications',
    course: 'BCA (Bachelor of Computer Applications)',
    year: '1st Year',
    bio: '',
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Frontend Validations
    if (!formData.name.trim()) {
      setFormError('Please enter your full name.');
      showToast('Please enter your full name.', 'warning');
      return;
    }

    if (formData.name.trim().length < 2) {
      setFormError('Full name must be at least 2 characters long.');
      showToast('Full name must be at least 2 characters long.', 'warning');
      return;
    }

    if (!formData.email.trim() || !EMAIL_REGEX.test(formData.email.trim())) {
      setFormError('Please enter a valid institutional email address.');
      showToast('Please enter a valid email address.', 'warning');
      return;
    }

    if (!formData.password) {
      setFormError('Password is required.');
      showToast('Password is required.', 'warning');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      showToast('Password must be at least 6 characters long.', 'warning');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match. Please verify both password fields.');
      showToast('Passwords do not match.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
        studentFacultyId: formData.studentFacultyId.trim(),
        department: formData.department.trim(),
        course: formData.course.trim(),
        year: formData.year,
        bio: formData.bio.trim(),
      });
      showToast('Registration successful! Welcome to the portal.', 'success');
      navigate('/');
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please try again.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const departments = [
    'Computer Applications',
    'Computer Science & Engineering',
    'Data Science & AI',
    'Electronics & Media Arts',
    'Management Studies (BBA/MBA)',
    'Commerce & Finance',
    'Mechanical Engineering',
    'Humanities & Social Sciences',
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-2"
          >
            <GraduationCap className="w-8 h-8" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif">
            Join the Campus Newsroom
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Create an academic profile to submit campus articles, write comments, and register for workshops.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {formError && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Radio Pill */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                Account Type *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'student' })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    formData.role === 'student'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span>🎒 Enrolled Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'faculty' })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    formData.role === 'faculty'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span>🎓 Faculty / Staff</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'admin' })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    formData.role === 'admin'
                      ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span>🛡️ Portal Admin</span>
                </button>
              </div>
            </div>

            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Aarav Mehta"
                    autoComplete="name"
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Institutional Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@campusnews.edu"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Department & Student ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Academic Department *
                </label>
                <select
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  {formData.role === 'student' ? 'Student Enrollment ID' : 'Faculty ID Code'}
                </label>
                <input
                  type="text"
                  value={formData.studentFacultyId}
                  onChange={e => setFormData({ ...formData, studentFacultyId: e.target.value })}
                  placeholder={formData.role === 'student' ? 'STU-BCA-2026-001' : 'FAC-CS-101'}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Course & Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Degree / Program Course
                </label>
                <input
                  type="text"
                  value={formData.course}
                  onChange={e => setFormData({ ...formData, course: e.target.value })}
                  placeholder="e.g. BCA (Bachelor of Computer Applications)"
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Academic Year / Semester
                </label>
                <select
                  value={formData.year}
                  onChange={e => setFormData({ ...formData, year: e.target.value })}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                >
                  <option value="1st Year">1st Year (Freshman)</option>
                  <option value="2nd Year">2nd Year (Sophomore)</option>
                  <option value="3rd Year">3rd Year (Final Year)</option>
                  <option value="4th Year">4th Year (Engineering)</option>
                  <option value="Faculty / Staff">Faculty / Staff</option>
                </select>
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Profile...' : 'Complete Registration'}</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Log in with credentials
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
