import { useState } from 'react';
import CertificateMaker from '../components/CertificateMaker';
import { Certificate } from '../lib/types';

export default function Home() {
  const [certificate, setCertificate] = useState<Certificate>({
      name: 'New Certificate',
      bgImage: '',
      elements: []
    });
    const [certificateName, setCertificateName] = useState('New Certificate');

  const saveCertificate = async () => {
    try {
      // Prepare the certificate data with current timestamp
      const certToSave = {
        ...certificate,
        name: certificateName,
        updatedAt: new Date().toISOString(),
        createdAt: certificate.createdAt || new Date().toISOString()
      };
  
      const response = await fetch(`${API_BASE_URL}/certificates/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(certToSave),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to save certificate: ${response.statusText}`);
      }
  
      const savedCert = await response.json();
      
      // Update state with the saved certificate (including the ID from server)
      setCertificate(savedCert);
      setCertificateName(savedCert.name);
  
      // Refresh certificates list
      const listResponse = await fetch(`http://localhost:8080/api/certificates`);
      if (listResponse.ok) {
        const updatedList = await listResponse.json();
        setCertificatesList(updatedList);
      }
  
      setShowSaveModal(false);
      setError(null);
    } catch (err) {
      console.error('Error saving certificate:', err);
      setError(err.message || 'Failed to save certificate');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <CertificateMaker />
        </div>
      </div>
    </main>
  )
}