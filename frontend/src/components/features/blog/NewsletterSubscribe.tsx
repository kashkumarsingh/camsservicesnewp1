'use client';

import { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertCircle, CheckCircle } from 'lucide-react';
import { useNewsletter } from '@/interfaces/web/hooks/contact/useNewsletter';
import { validateEmail } from '@/utils/validation';

export default function NewsletterSubscribe() {
  const [email, setEmail] = useState('');
  const { subscribe, loading, error, success } = useNewsletter();

  // Validation states
  const [emailError, setEmailError] = useState<string>('');
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [touched, setTouched] = useState(false);

  // Real-time validation
  useEffect(() => {
    if (touched || email) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        setEmailError(emailValidation.error || 'Please enter a valid email address');
        setEmailValid(false);
      } else {
        setEmailError('');
        setEmailValid(true);
      }
    }
  }, [email, touched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await subscribe({
        email,
        // name is optional - omit it if not provided
      });
      
      // Clear email on success
      setEmail('');
    } catch (err) {
      // Error is handled by the hook
      // Component will display error state automatically
    }
  };

  // Reset success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        // Success state is managed by the hook
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (success) {
    return (
      <div className="bg-white/20 backdrop-blur-sm rounded-card p-6 flex items-center justify-center gap-3">
        <CheckCircle2 size={24} className="text-white" />
        <p className="text-white font-semibold">Thanks for subscribing!</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/20 backdrop-blur-sm rounded-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-red-300" size={24} />
          <h3 className="text-xl font-bold text-white">Subscription Error</h3>
        </div>
        <p className="text-white/90 mb-4">
          {error.message || 'Failed to subscribe. Please try again later.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-white text-primary-blue rounded-lg font-bold hover:bg-gray-100 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/20 backdrop-blur-sm rounded-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <Mail className="text-white" size={24} />
        <h3 className="text-xl font-bold text-white">Subscribe to Our Newsletter</h3>
      </div>
      <p className="text-white/90 mb-4">
        Get the latest insights on SEN support, parenting tips, and exclusive offers straight to your inbox.
      </p>
      <div className="space-y-2">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (!touched) setTouched(true);
              }}
              onBlur={() => setTouched(true)}
              required
              disabled={loading}
              className={`w-full px-4 py-3 pr-10 text-gray-900 rounded-lg focus:outline-none focus:ring-2 placeholder:text-gray-400 disabled:opacity-50 transition-all ${
                touched
                  ? emailError
                    ? 'border-2 border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50'
                    : emailValid
                    ? 'border-2 border-green-500 focus:border-green-500 focus:ring-green-200 bg-green-50'
                    : 'border-2 border-gray-300 focus:border-primary-blue focus:ring-primary-blue'
                  : 'border-2 border-gray-300 focus:border-primary-blue focus:ring-primary-blue'
              }`}
            />
            {touched && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {emailError ? (
                  <AlertCircle className="text-red-500" size={18} />
                ) : emailValid ? (
                  <CheckCircle className="text-green-500" size={18} />
                ) : null}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !email.trim() || !!emailError}
            className="px-6 py-3 bg-white text-primary-blue rounded-lg font-bold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>
        {touched && emailError && (
          <p className="text-xs text-red-200 flex items-center gap-1">
            <AlertCircle size={12} />
            {emailError}
          </p>
        )}
      </div>
    </form>
  );
}


