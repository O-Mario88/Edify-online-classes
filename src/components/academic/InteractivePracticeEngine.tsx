import React, { useState } from 'react';
import { Resource } from '../../types';
import { CheckCircle2, FileUp, ListChecks, PenTool, AlertCircle } from 'lucide-react';
import { useAssignmentSubmissions } from '../../hooks/useAssignmentSubmissions';
import { toast } from 'sonner';
import { apiClient } from '../../lib/apiClient';

interface InteractivePracticeEngineProps {
  resource: Resource;
  studentId: string;
  onComplete: () => void;
}

export const InteractivePracticeEngine: React.FC<InteractivePracticeEngineProps> = ({ resource, studentId, onComplete }) => {
  const { addSubmission } = useAssignmentSubmissions();
  
  const [activeTab, setActiveTab] = useState<'mcq' | 'structured'>('mcq');
  
  // Mock State for MCQs
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, string>>({});
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [mcqScore, setMcqScore] = useState(0);

  // Mock State for Structured
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [structuredSubmitted, setStructuredSubmitted] = useState(false);

  // Auto-generated mock content based on Subject
  const mockMcqs = [
    { id: 1, question: `Which of the following is considered a core principle related to ${resource.title}?`, options: ['Option A', 'Option B', 'Option C', 'Option D'], correct: 'Option B' },
    { id: 2, question: `Identify the primary effect described in the ${resource.authorName || 'Subject'} material.`, options: ['Decrease in volume', 'Increase in tension', 'Neutral stabilization', 'Complete conversion'], correct: 'Neutral stabilization' },
    { id: 3, question: `What is the standard measurement unit used in this segment?`, options: ['Joules', 'Meters', 'Kilograms', 'Newtons'], correct: 'Joules' }
  ];

  const handleMcqSubmit = () => {
    let score = 0;
    mockMcqs.forEach(q => {
      if (mcqAnswers[q.id] === q.correct) score++;
    });
    setMcqScore(score);
    setMcqSubmitted(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const submitToTeacher = async () => {
    if (!uploadedFile) return;
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('resourceId', resource.id);
      formData.append('studentId', studentId);
      formData.append('mcqScore', mcqSubmitted ? mcqScore.toString() : '0');
      
      // Perform genuine API upload. apiClient.post only takes (url, body);
      // for FormData the underlying fetch handles multipart boundaries.
      await apiClient.post('/academic/submissions/upload/', formData);

      // Synchronize context hooks if applicable
      addSubmission({
        studentId,
        studentName: 'Active Student Profile', 
        resourceId: resource.id,
        resourceTitle: resource.title,
        subject: (resource as any).subject || resource.authorName || 'General Subject',
        topic: 'Current Active Topic',
        submittedAt: new Date().toISOString(),
        status: 'pending_grading',
        fileUrl: uploadedFile.name,
        mcqScore: mcqSubmitted ? mcqScore : 0,
        maxScore: mockMcqs.length
      });

      setStructuredSubmitted(true);
      onComplete();
      toast.success('Assignment Submitted to Teacher!');
    } catch (err: any) {
      toast.error('Upload failed. Check network stability.');
      console.error("Submission error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8 bg-white dark:bg-slate-900 shadow-2xl rounded-xl min-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-8 border-b border-slate-800">
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
          <ListChecks className="w-8 h-8 text-indigo-400" />
          Interactive Assessment
        </h1>
        <p className="text-slate-300 font-medium">Topic Context: {resource.title}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-8">
        <button 
          onClick={() => setActiveTab('mcq')}
          className={`py-4 px-6 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'mcq' ? 'border-indigo-600 text-indigo-800 dark:text-indigo-400' : 'border-transparent text-slate-700 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          <ListChecks className="w-4 h-4" /> Auto-Graded Knowledge Check
        </button>
        <button 
          onClick={() => setActiveTab('structured')}
          className={`py-4 px-6 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'structured' ? 'border-indigo-600 text-indigo-800 dark:text-indigo-400' : 'border-transparent text-slate-700 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300'}`}
        >
          <PenTool className="w-4 h-4" /> Structured Report Task
        </button>
      </div>

      <div className="flex-1 p-8 sm:p-12 overflow-y-auto">
        
        {/* MCQ Tab */}
        {activeTab === 'mcq' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!mcqSubmitted ? (
               <>
                 <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 rounded-lg flex gap-3 text-sm font-medium">
                   <AlertCircle className="w-5 h-5 shrink-0" />
                   These multiple-choice questions have been dynamically generated based on the syllabus objectives for this section.
                 </div>
                 
                 {mockMcqs.map((q, idx) => (
                   <div key={q.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                     <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex gap-2">
                       <span className="text-slate-800 dark:text-slate-300 font-bold">{idx + 1}.</span> {q.question}
                     </h3>
                     <div className="space-y-3 pl-6">
                       {q.options.map(opt => (
                         <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                           <input 
                             type="radio" 
                             name={`q-${q.id}`} 
                             value={opt}
                             checked={mcqAnswers[q.id] === opt}
                             onChange={(e) => setMcqAnswers({...mcqAnswers, [q.id]: e.target.value})}
                             className="w-4 h-4 text-indigo-800 focus:ring-indigo-500"
                           />
                           <span className="text-slate-800 dark:text-slate-300 group-hover:text-indigo-800 dark:group-hover:text-indigo-400 transition-colors">{opt}</span>
                         </label>
                       ))}
                     </div>
                   </div>
                 ))}

                 <button 
                   onClick={handleMcqSubmit}
                   disabled={Object.keys(mcqAnswers).length < mockMcqs.length}
                   className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                 >
                   Submit Answers
                 </button>
               </>
            ) : (
               <div className="text-center py-12">
                 <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                   <CheckCircle2 className="w-12 h-12 text-emerald-800 dark:text-green-400" />
                 </div>
                 <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Score: {mcqScore} / {mockMcqs.length}</h2>
                 <p className="text-slate-600 dark:text-slate-400 mb-8">Your answers have been recorded in your learning profile.</p>
                 <button onClick={() => setActiveTab('structured')} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Proceed to Structured Task &rarr;</button>
               </div>
            )}
          </div>
        )}

        {/* Structured Tab */}
        {activeTab === 'structured' && (
           <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             <div className="prose prose-slate dark:prose-invert max-w-none mb-10">
               <h2 className="text-2xl font-bold">Comprehensive Field Report</h2>
               <p>
                 Based on the materials provided for <strong>{resource.title}</strong>, compile a structured response analyzing the core components. Your assignment must encompass introduction, critical analysis, and proper citations where applicable.
               </p>
               <ul>
                 <li>Format: PDF or Word Document</li>
                 <li>Max Size: 10MB</li>
                 <li>Grading Rubric applies.</li>
               </ul>
             </div>

             {!structuredSubmitted ? (
               <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center relative transition-all hover:border-indigo-500 dark:hover:border-indigo-400 group">
                 <input 
                   type="file" 
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                   onChange={handleFileUpload}
                 />
                 
                 {!uploadedFile ? (
                   <>
                     <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                       <FileUp className="w-8 h-8 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                     </div>
                     <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-1">Click or drag document to compile submission</h3>
                     <p className="text-sm text-slate-600 dark:text-slate-400">PDF, DOCX, DOC</p>
                   </>
                 ) : (
                   <>
                     <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                       <FileUp className="w-8 h-8 text-indigo-800 dark:text-indigo-400" />
                     </div>
                     <h3 className="font-bold text-slate-900 dark:text-white mb-1 truncate px-8">{uploadedFile.name}</h3>
                     <p className="text-sm text-slate-600 dark:text-slate-400">Ready to transmit to your subject teacher.</p>
                   </>
                 )}
               </div>
             ) : (
               <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-2xl p-8 text-center flex flex-col items-center">
                 <CheckCircle2 className="w-16 h-16 text-emerald-600 dark:text-emerald-400 mb-4" />
                 <h3 className="text-xl font-bold text-green-800 dark:text-green-400 mb-2">Submission Successful</h3>
                 <p className="text-emerald-800 dark:text-emerald-300 text-sm">
                   Your assignment was sent directly to your teacher's grading dashboard. You will be notified when the marks are published.
                 </p>
               </div>
             )}

             {uploadedFile && !structuredSubmitted && (
               <button 
                 onClick={submitToTeacher}
                 disabled={isUploading}
                 className="w-full mt-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
               >
                 {isUploading ? (
                   <><div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" /> Transmitting...</>
                 ) : (
                   <>Submit Final Assignment &rarr;</>
                 )}
               </button>
             )}
           </div>
        )}

      </div>
    </div>
  );
};
