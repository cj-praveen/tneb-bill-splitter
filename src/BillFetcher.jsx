import React, { useState, useEffect, useRef } from 'react';

export default function BillFetcher({ onBillFetched }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const servicenoRef = useRef(null);
  const mobRef = useRef(null);
  const capRef = useRef(null);

  const fetchSession = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/session');
      if (!response.ok) throw new Error('Failed to load session');
      const data = await response.json();
      setSession(data);
    } catch (err) {
      setError(err.message || 'Error fetching session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session || !servicenoRef.current || !mobRef.current || !capRef.current) return;
    
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        form_url: session.form_url,
        serviceno: servicenoRef.current.value,
        mob: mobRef.current.value,
        cap: capRef.current.value,
        'javax.faces.ViewState': session.viewState,
        cookie: session.cookie
      };

      const response = await fetch('/api/bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Invalid details or captcha');
      const data = await response.json();
      onBillFetched(data);
    } catch (err) {
      setError(err.message || 'Error fetching bill');
      fetchSession();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md space-y-6 mt-10">
      <h1 className="text-2xl font-bold text-gray-800 text-center">TNEB Bill Fetcher</h1>
      
      {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="serviceno" className="block text-sm font-medium text-gray-700">Service Number</label>
          <input ref={servicenoRef} type="number" id="serviceno" placeholder="Service number" required className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none no-spinners" />
        </div>
        
        <div>
          <label htmlFor="mob" className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input ref={mobRef} type="number" id="mob" placeholder="Phone number" required className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none no-spinners" />
        </div>
        
        <div>
          <label htmlFor="cap" className="block text-sm font-medium text-gray-700">Captcha Code</label>
          <input ref={capRef} type="number" id="cap" placeholder="Captcha code" required className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none no-spinners" />
        </div>
        
        <div className="flex justify-center py-2">
          {session?.captcha_image && (
            <img src={session.captcha_image} alt="captcha image" className="border border-gray-300 rounded-md p-1 w-32 h-12 object-cover bg-gray-50" />
          )}
        </div>
        
        <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md p-2 transition-colors disabled:opacity-50">
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
