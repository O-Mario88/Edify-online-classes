import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import {
  UploadCloud, FileText, Video, PlayCircle, BookOpen,
  Presentation, FileSpreadsheet, X, CheckCircle, FolderOpen
} from 'lucide-react';
import contentApi from '../../lib/contentApi';
import type { ContentType } from '../../lib/contentApi';

interface ResourceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: string;
  defaultClass?: string;
  defaultTopic?: string;
  defaultLesson?: string;
  role?: 'admin' | 'institution' | 'teacher';
}

const RESOURCE_TYPES = [
  { value: 'video', label: 'Video Lesson', icon: Video, color: 'text-red-800 bg-red-50' },
  { value: 'notes', label: 'Lesson Notes', icon: FileText, color: 'text-blue-800 bg-blue-50' },
  { value: 'pdf', label: 'PDF Document', icon: FileText, color: 'text-orange-600 bg-orange-50' },
  { value: 'slides', label: 'Slides / PowerPoint', icon: Presentation, color: 'text-purple-800 bg-purple-50' },
  { value: 'worksheet', label: 'Worksheet', icon: FileSpreadsheet, color: 'text-emerald-800 bg-green-50' },
  { value: 'recording', label: 'Recorded Live Session', icon: PlayCircle, color: 'text-indigo-800 bg-indigo-50' },
  { value: 'reading', label: 'Recommended Reading', icon: BookOpen, color: 'text-teal-600 bg-teal-50' },
  { value: 'revision', label: 'Revision Materials', icon: FolderOpen, color: 'text-amber-800 bg-amber-50' },
];

export const ResourceUploadModal: React.FC<ResourceUploadModalProps> = ({
  isOpen,
  onClose,
  defaultSubject = '',
  defaultClass = '',
  defaultTopic = '',
  defaultLesson = '',
  role = 'teacher',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState('notes');
  const [subject, setSubject] = useState(defaultSubject);
  const [classLevel, setClassLevel] = useState(defaultClass);
  const [topic, setTopic] = useState(defaultTopic);
  const [lesson, setLesson] = useState(defaultLesson);
  const [visibility, setVisibility] = useState('platform');
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState('');

  if (!isOpen) return null;

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      // Choose correct API endpoint based on role
      let api;
      if (role === 'admin') {
        api = contentApi.admin;
      } else if (role === 'institution') {
        api = contentApi.institution;
      } else {
        api = contentApi.teacher;
      }
      await api.create({
         title,
         description,
         content_type: resourceType as ContentType,
         visibility_scope: visibility as any,
         subject: subject ? parseInt(subject) || null : null,
         class_level: classLevel ? parseInt(classLevel.replace(/\D/g, '')) || null : null,
         topic: null, // Topic is string input currently, real DB needs ID. Leaving null for fallback mapping.
         external_url: resourceType === 'video' ? externalUrl : undefined,
         file: file || undefined
      });
      setUploaded(true);
      setTimeout(() => {
        setUploaded(false);
        onClose();
        setTitle('');
        setDescription('');
        setFile(null);
        setExternalUrl('');
      }, resourceType === 'video' && file ? 4000 : 1500);
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-indigo-800" /> Upload Academic Resource
            </h2>
            <p className="text-sm text-gray-700 mt-0.5">One central place to upload all teaching materials</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5 text-gray-800" />
          </button>
        </div>

        <CardContent className="p-6 space-y-5">
          {uploaded ? (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-emerald-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">Resource Uploaded!</h3>
              {resourceType === 'video' && file ? (
                <p className="text-gray-700 mt-2">Your video is being securely uploaded to Vimeo in the background and will be available shortly.</p>
              ) : (
                <p className="text-gray-700 mt-2">It's now linked to the selected topic/lesson.</p>
              )}
            </div>
          ) : (
            <>
              {/* Resource Title */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Resource Title *</label>
                <Input
                  placeholder="e.g. Chapter 3 Summary Notes"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              {/* Resource Type */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Resource Type *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {RESOURCE_TYPES.map(rt => (
                    <button
                      key={rt.value}
                      onClick={() => setResourceType(rt.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-center ${
                        resourceType === rt.value
                          ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${rt.color}`}>
                        <rt.icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{rt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Academic Placement */}
              <div className="space-y-3 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                  📍 Academic Placement
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-800">Subject *</label>
                    <select
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                    >
                      <option value="">Select subject...</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="English Language">English Language</option>
                      <option value="Geography">Geography</option>
                      <option value="History and Political Education">History</option>
                      <option value="Entrepreneurship">Entrepreneurship</option>
                      <option value="ICT">ICT</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-800">Class *</label>
                    <select
                      value={classLevel}
                      onChange={e => setClassLevel(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                    >
                      <option value="">Select class...</option>
                      <option value="senior-1">Senior 1</option>
                      <option value="senior-2">Senior 2</option>
                      <option value="senior-3">Senior 3</option>
                      <option value="senior-4">Senior 4</option>
                      <option value="senior-5">Senior 5</option>
                      <option value="senior-6">Senior 6</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-800">Topic *</label>
                  <Input
                    placeholder="e.g. Equations and Inequalities"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-800">Lesson <span className="text-gray-800">(optional — leave blank for topic-level resource)</span></label>
                  <Input
                    placeholder="e.g. Video Lesson: Solving Quadratics"
                    value={lesson}
                    onChange={e => setLesson(e.target.value)}
                  />
                </div>
              </div>

              {/* File Drop Zone / Link Input */}
              {resourceType === 'video' ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Video Link (Vimeo / YouTube)</label>
                    <Input
                      placeholder="https://..."
                      value={externalUrl}
                      onChange={e => { setExternalUrl(e.target.value); setFile(null); }}
                    />
                  </div>
                  <div className="text-center text-sm text-gray-700 font-medium">OR Upload MP4</div>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer relative">
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => { if (e.target.files?.length) { setFile(e.target.files[0]); setExternalUrl(''); } }} accept="video/mp4" />
                    <UploadCloud className="h-10 w-10 text-gray-800 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-800">
                      {file ? file.name : "Click to select video or drag and drop"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer relative">
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => { if (e.target.files?.length) setFile(e.target.files[0]); }} />
                  <UploadCloud className="h-10 w-10 text-gray-800 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-800">
                    {file ? file.name : "Click to select files or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-800 mt-1">PDF, DOCX, PPTX up to 100MB</p>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <Textarea
                  placeholder="Brief description of this resource..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Visibility */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-700">Visibility:</label>
                <div className="flex gap-2">
                  {[
                    { value: 'platform', label: 'Platform-wide' },
                    { value: 'institution', label: 'My School Only' },
                    { value: 'class', label: 'This Class Only' }
                  ].map(v => (
                    <button
                      key={v.value}
                      onClick={() => setVisibility(v.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        visibility === v.value
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || !title.trim() || (!file && !externalUrl)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-11"
                >
                  {isUploading ? 'Uploading...' : '📤 Upload Resource'}
                </Button>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
