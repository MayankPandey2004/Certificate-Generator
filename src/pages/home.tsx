import { useState } from 'react';
import { Wand2, Download, BookTemplate, AlertCircle } from "lucide-react"
import { Button } from "../components/button"
import CertificateMaker from '../components/CertificateMaker';

export default function Home() {
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full px-6 py-2 mb-4">
            <Wand2 className="h-5 w-5 mr-2" />
            <span className="font-medium">Professional Certificate Creator</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Certificate Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create beautiful, custom certificates with our intuitive drag-and-drop editor
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Wand2 className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Customization</h3>
            <p className="text-gray-600">
              Drag and drop elements, change colors, and customize every detail to create the perfect certificate.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BookTemplate className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Templates</h3>
            <p className="text-gray-600">
              Choose from multiple elegant templates that suit any occasion or organization.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Download className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Download</h3>
            <p className="text-gray-600">
              Download your certificate as a high-quality PNG image ready for printing or sharing.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                try {
                  const link = document.createElement('a');
                  link.href = './sample-certificate.png';
                  link.download = 'sample-certificate.png';
                  link.click();
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (err) {
                  setError('Failed to download sample certificate');
                }
              }}
            >

              Download Sample
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <CertificateMaker />
        </div>
      </div>
    </main>
  )
}