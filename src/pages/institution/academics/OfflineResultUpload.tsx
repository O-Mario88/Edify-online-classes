import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Download, ArrowRight } from 'lucide-react';

export default function OfflineResultUpload() {
  const [fileState, setFileState] = useState<'idle' | 'analyzing' | 'ready'>('idle');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 bg-white min-h-screen border-x border-slate-100 shadow-sm">
      <header>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-blue-600" />
          Offline Academic Results Upload
        </h1>
        <p className="text-slate-500 mt-2">
          Upload physical exam results (BOT, MOT, EOT or National Exams) to correlate offline academic performance against Maple online engagement data.
        </p>
      </header>

      <section className="bg-blue-50 border border-blue-100 rounded-xl p-6">
        <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <Download className="w-4 h-4" /> Download Standard Mapping Template
        </h3>
        <p className="text-sm text-blue-700 mb-4">
          To ensure accurate matching, please use our standardized CSV template. It automatically maps Learner ID, Subject Code, and the specific Term.
        </p>
        <button className="bg-white border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors shadow-sm">
          Download CSV Template
        </button>
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Upload Result Spreadsheets</h2>
        
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 transition-colors cursor-pointer relative overflow-hidden group">
           
          {fileState === 'idle' && (
            <>
               <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 <Upload className="w-8 h-8 text-slate-400" />
               </div>
               <span className="text-lg font-medium text-slate-700">Drag & Drop your CSV file here</span>
               <span className="text-sm text-slate-500 mt-1">or click to browse from computer</span>
               <div className="mt-8">
                 <button 
                  onClick={() => setFileState('analyzing')}
                  className="bg-slate-800 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-md hover:bg-slate-700"
                 >
                   Simulate File Upload
                 </button>
               </div>
            </>
          )}

          {fileState === 'analyzing' && (
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-bold text-slate-800">Processing "S4_BOT1_Results.csv"</h3>
              <p className="text-slate-500 mt-2 text-sm z-10 relative">Mapping 420 learner records to intelligence engine...</p>
              
              {/* Fake progress advancement */}
              <div className="w-full max-w-sm bg-slate-200 rounded-full h-2 mt-6 mx-auto overflow-hidden">
                <div className="bg-blue-600 h-2 rounded-full w-2/3 animate-pulse"></div>
              </div>

              <button 
                  onClick={() => setFileState('ready')}
                  className="mt-6 opacity-0 hover:opacity-100 focus:opacity-100 text-xs text-slate-400"
              >
                  Push to ready
              </button>
            </div>
          )}

          {fileState === 'ready' && (
            <div className="text-center bg-emerald-50 absolute inset-0 flex flex-col items-center justify-center p-6">
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-emerald-500">
                 <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-emerald-800">Validation Successful</h3>
              <p className="text-emerald-700 mt-2 max-w-md">Successfully parsed 420 learner records mapping to 8 subjects. Zero mapping errors detected.</p>
              
              <div className="mt-8 flex gap-4">
                 <button 
                  onClick={() => setFileState('idle')}
                  className="bg-white text-slate-700 px-6 py-2 rounded-lg text-sm font-semibold shadow-sm border border-slate-200"
                 >
                   Upload Another
                 </button>
                 <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-md flex items-center gap-2">
                   Commit to Analytics Engine <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {fileState === 'ready' && (
        <section className="bg-white rounded-xl border border-rose-200 p-6 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="font-bold text-rose-800 flex items-center gap-2 mb-4">
               <AlertTriangle className="w-5 h-5" /> 2 Translation Warnings Detected
            </h3>
            <ul className="space-y-3 text-sm text-slate-700">
               <li className="flex items-start gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                 <span><strong className="text-slate-800">Learner ID mismatch:</strong> Student "ID-0092" does not exist in the active institutional roster. This exam score will be orphaned.</span>
               </li>
               <li className="flex items-start gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                 <span><strong className="text-slate-800">Abnormal Score Drop:</strong> 14 students in 'Mathematics S4' show a massive variance (&gt;40%) between their online platform mastery and this physical recorded score.</span>
               </li>
            </ul>
        </section>
      )}

    </div>
  );
}
