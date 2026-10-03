import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, Award, CheckCircle, BookOpen } from 'lucide-react'; // Added BookOpen for logo
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext'; 

const Certificate = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificateData = async () => {
      try {
        const [courseRes, enrollRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/enrollments/check/${courseId}`)
        ]);

        if (!enrollRes.data.enrollment?.isCompleted) {
          toast.error("You have not completed this course yet.");
          return;
        }

        const actualName = user?.name || 'Student';

        setData({
          course: courseRes.data,
          enrollment: enrollRes.data.enrollment,
          studentName: actualName, 
        });
      } catch (error) {
        toast.error("Failed to load certificate data");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
        fetchCertificateData();
    }
  }, [courseId, user]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="xl" /></div>;
  if (!data) return <div className="text-center mt-20 text-red-500 font-bold">Certificate unavailable.</div>;

  const completionDate = new Date(data.enrollment.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 font-sans print:bg-white print:py-0 print:px-0">
      
      {/* --- PRINTER & CUSTOM FONT STYLES --- */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');

          @media print {
            @page {
              size: landscape; 
              margin: 0; 
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background-color: white !important;
            }
            header, footer, nav {
              display: none !important;
            }
            ::-webkit-scrollbar {
              display: none;
            }
          }
        `}
      </style>

      {/* Non-Printable Header Navigation */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Link to={`/student/course/${courseId}`} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Course
        </Link>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-blue-700 shadow-sm transition-colors"
        >
          <Printer className="h-5 w-5" /> Download / Print PDF
        </button>
      </div>

      {/* Printable Certificate Canvas */}
      <div className="max-w-5xl mx-auto bg-white p-4 shadow-xl print:shadow-none print:p-8 print:max-w-none print:w-full">
        <div className="border-[12px] border-double border-gray-200 p-8 md:p-12 relative overflow-hidden bg-white min-h-[600px] flex flex-col items-center justify-center text-center print:min-h-[85vh] print:m-0 box-border">
          
          {/* Top Right Logo & Name */}
          <div className="absolute top-8 right-10 flex items-center gap-2 text-blue-900 opacity-90">
            <BookOpen className="h-8 w-8" />
            <span className="font-bold text-2xl tracking-wider uppercase font-serif">MERN LMS</span>
          </div>

          {/* Decorative Corner Elements */}
          <div className="absolute top-0 left-0 w-24 h-24 border-t-8 border-l-8 border-blue-900 rounded-tl-3xl opacity-20"></div>
          <div className="absolute top-0 right-0 w-24 h-24 border-t-8 border-r-8 border-blue-900 rounded-tr-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 border-b-8 border-l-8 border-blue-900 rounded-bl-3xl opacity-20"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-8 border-r-8 border-blue-900 rounded-br-3xl opacity-20"></div>

          <Award className="h-16 w-16 text-yellow-500 mb-4" />
          
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2 tracking-wide">
            CERTIFICATE
          </h1>
          <h2 className="text-lg md:text-xl font-serif text-gray-500 tracking-widest mb-6 uppercase">
            Of Completion
          </h2>

          <p className="text-base text-gray-600 mb-2 italic">This is to proudly certify that</p>
          
          {/* CURSIVE SYSTEM-PROVIDED NAME */}
          <h3 
            className="text-5xl md:text-6xl text-blue-900 mb-4 border-b-2 border-gray-300 pb-2 px-12 inline-block"
            style={{ fontFamily: "'Great Vibes', cursive", lineHeight: '1.2' }}
          >
            {data.studentName}
          </h3>

          <p className="text-base text-gray-600 mb-2 italic">has successfully completed the course curriculum for</p>
          
          <h4 className="text-xl md:text-2xl font-bold text-gray-800 mb-8 max-w-3xl leading-tight">
            {data.course.title}
          </h4>

          <div className="flex justify-between items-end w-full max-w-3xl mt-4">
            <div className="text-center border-t border-gray-400 pt-2 w-48">
              <p className="font-bold text-gray-800">{completionDate}</p>
              <p className="text-sm text-gray-500">Date of Completion</p>
            </div>
            
            <div className="flex flex-col items-center">
              <CheckCircle className="h-10 w-10 text-green-600 mb-1 opacity-80" />
              <p className="text-[10px] text-gray-400 font-mono tracking-wider">VERIFIED CREDENTIAL</p>
            </div>

            <div className="text-center border-t border-gray-400 pt-2 w-48">
              <p className="font-bold text-gray-800 font-serif text-sm">MERN LMS Platform</p>
              <p className="text-sm text-gray-500">Issuing Authority</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;