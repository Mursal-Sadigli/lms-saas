import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Download, Award, ShieldCheck, Loader, X } from 'lucide-react'
import { getCertificateById } from '../src/api'

export default function CertificateView() {
  const { id } = useParams()
  const [cert, setCert] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getCertificateById(id)
      .then(data => {
        setCert(data)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader size={40} className="text-violet-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Sertifikat axtarılır...</p>
      </div>
    )
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sertifikat Tapılmadı</h2>
          <p className="text-gray-500 mb-6">Bu URL etibarsızdır və ya sertifikat mövcud deyil.</p>
          <Link to="/" className="inline-block bg-violet-600 text-white font-bold py-3 px-6 rounded-xl">
            Ana Səhifəyə Qayıt
          </Link>
        </div>
      </div>
    )
  }

  const printCertificate = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Print Helper Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-emerald-600 font-medium">
            <ShieldCheck size={20} />
            Bu sertifikat rəsmi olaraq təsdiqlənmişdir
          </div>
          <button 
            onClick={printCertificate}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
          >
            <Download size={18} /> PDF Kimi Yüklə
          </button>
        </div>

        {/* The Certificate Canvas */}
        <div 
          className="bg-white border-8 md:border-12 border-slate-900 relative p-6 md:p-12 overflow-hidden shadow-2xl print:border-8 print:shadow-none print:m-0 w-full min-h-[650px] md:min-h-auto md:aspect-[1.414/1] flex flex-col justify-between"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-violet-100 rounded-bl-full -z-10 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-amber-50 rounded-tr-full -z-10 opacity-50"></div>
          
          <div className="h-full flex flex-col items-center text-center justify-between z-10 relative gap-8 md:gap-0">
            
            {/* Header */}
            <div className="flex flex-col items-center pt-4 md:pt-8 w-full">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-violet-600 text-white border-4 border-violet-100 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg mb-4 md:mb-6">
                <Award className="w-6 h-6 md:w-9 md:h-9" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-widest mb-1">
                Sertifikat
              </h1>
              <p className="text-slate-500 uppercase tracking-widest text-xs md:text-sm font-semibold">Təhsil Uğuru</p>
            </div>

            {/* Body */}
            <div className="flex flex-col items-center px-2 md:px-0 w-full mt-4 md:mt-0">
              <p className="text-sm md:text-lg text-slate-600 italic mb-3 md:mb-4">Bu sertifikat qürurla təqdim edilir:</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-violet-700 mb-4 md:mb-6 font-serif px-4 md:px-8 border-b-2 border-slate-200 pb-2">
                {cert.student_name}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl px-2 md:px-8 leading-relaxed mb-6">
                Tərəfindən təşkil olunan və <strong className="font-bold text-slate-900">{cert.educator_name}</strong> tərəfindən tədris edilən 
                <br/><strong className="text-lg md:text-xl text-slate-900 mt-2 inline-block">"{cert.course_title}"</strong> 
                <br/>kursunu müvəffəqiyyətlə və tam başa vurduğuna görə bu rəsmi sertifikata layiq görülür.
              </p>
            </div>

            {/* Footer / Signatures */}
            <div className="w-full flex items-end px-0 md:px-12 pb-4 md:pb-8 flex-wrap justify-center sm:justify-between gap-8 sm:gap-4 mt-auto">
              {/* Educator Signature */}
              <div className="flex flex-col items-center w-full sm:w-auto">
                <div className="text-xl md:text-2xl placeholder-signature text-slate-800 font-serif mb-2">{cert.educator_name}</div>
                <div className="w-40 md:w-48 h-px bg-slate-300"></div>
                <div className="text-[10px] md:text-sm font-bold text-slate-500 mt-2 uppercase tracking-wide">Təlimçi / Müəllim</div>
              </div>

              {/* Seal */}
              <div className="flex flex-col items-center order-first sm:order-0 w-full sm:w-auto mb-6 sm:mb-0">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-amber-50 rounded-full border-4 border-amber-200 flex items-center justify-center mb-2 md:mb-4">
                  <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-amber-500" />
                </div>
                <div className="text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-wider">Möhrü</div>
              </div>

              {/* Date */}
              <div className="flex flex-col items-center w-full sm:w-auto">
                <div className="text-lg md:text-xl font-mono text-slate-800 mb-2 md:mb-3">{new Date(cert.issued_at).toLocaleDateString('az-AZ')}</div>
                <div className="w-40 md:w-48 h-px bg-slate-300"></div>
                <div className="text-[10px] md:text-sm font-bold text-slate-500 mt-2 uppercase tracking-wide">Verilmə Tarixi</div>
              </div>
            </div>

            {/* Verification Info */}
            <div className="absolute top-2 left-2 md:bottom-6 md:left-12 md:top-auto text-[8px] md:text-xs text-slate-400 font-mono opacity-70">
              ID: {cert.id}
            </div>
            <div className="absolute top-2 right-2 md:bottom-6 md:right-12 md:top-auto text-[8px] md:text-xs text-slate-400 font-mono opacity-70">
              learnhub.az/certificate/{cert.id.split('-').pop()}
            </div>
          </div>
        </div>
        
        {/* Style block specifically for printing to ensure landscape page size */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page { size: A4 landscape; margin: 0; }
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        `}} />
      </div>
    </div>
  )
}
