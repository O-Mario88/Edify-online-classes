import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Upload, X, FileText, Video, Image, File, Loader2, Plus } from 'lucide-react';
import { getPrimarySubjectsForClass, getPrimaryTopics } from '../../lib/curriculum/ugandaPrimaryContent';
import type { ContentUploadData, ContentType, VisibilityScope, PublicationStatus } from '../../lib/contentApi';

interface ContentUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ContentUploadData) => Promise<void>;
  role: 'teacher' | 'institution' | 'admin';
  /** Pre-fill academic scope */
  defaults?: Partial<ContentUploadData>;
}

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'notes', label: 'Notes' },
  { value: 'textbook', label: 'Textbook' },
  { value: 'pdf', label: 'PDF Document' },
  { value: 'document', label: 'Word Document' },
  { value: 'video', label: 'Video' },
  { value: 'slides', label: 'Slides / Presentation' },
  { value: 'worksheet', label: 'Worksheet' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'project', label: 'Project' },
  { value: 'activity', label: 'Activity' },
  { value: 'revision', label: 'Revision Resource' },
  { value: 'teacher_guide', label: 'Teacher Guide' },
  { value: 'lesson_attachment', label: 'Lesson Attachment' },
  { value: 'topic_resource', label: 'Topic Resource' },
  { value: 'class_resource', label: 'Class Resource' },
  { value: 'library_resource', label: 'Library Resource' },
  { value: 'mock_exam', label: 'Mock Exam Resource' },
  { value: 'intervention', label: 'Intervention Resource' },
  { value: 'other', label: 'Other' },
];

const VISIBILITY_OPTIONS: { value: VisibilityScope; label: string }[] = [
  { value: 'private', label: 'Private / Draft' },
  { value: 'class', label: 'Class Only' },
  { value: 'institution', label: 'Institution-wide' },
  { value: 'country', label: 'Country-wide' },
  { value: 'global', label: 'Global / Platform-wide' },
];

const FILE_TYPE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-8 h-8 text-red-500" />,
  video: <Video className="w-8 h-8 text-blue-500" />,
  image: <Image className="w-8 h-8 text-green-500" />,
  default: <File className="w-8 h-8 text-gray-500" />,
};

function getFileIcon(file: File | null): React.ReactNode {
  if (!file) return FILE_TYPE_ICONS.default;
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return FILE_TYPE_ICONS.pdf;
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return FILE_TYPE_ICONS.video;
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return FILE_TYPE_ICONS.image;
  return FILE_TYPE_ICONS.default;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const ContentUploadModal: React.FC<ContentUploadModalProps> = (props) => {
  // ...existing code...

  const { open, onClose, onSubmit, role, defaults = {} } = props;
  // State and logic
  const classLevels = ['P4', 'P5', 'P6', 'P7'];
  const terms = ['Term 1', 'Term 2', 'Term 3'];
  const [title, setTitle] = useState(defaults.title || '');
  const [description, setDescription] = useState(defaults.description || '');
  const [contentType, setContentType] = useState<ContentType>(defaults.content_type || 'notes');
  const [visibility, setVisibility] = useState<VisibilityScope>(defaults.visibility_scope || 'private');
  const [status, setStatus] = useState<PublicationStatus>(defaults.publication_status || 'draft');
  const [schoolLevel, setSchoolLevel] = useState(defaults.school_level || 'primary');
  const [externalUrl, setExternalUrl] = useState(defaults.external_url || '');
  const [language, setLanguage] = useState(defaults.language || 'en');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(defaults.tags || []);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedClass, setSelectedClass] = useState(classLevels[0]);
  const [selectedTerm, setSelectedTerm] = useState(terms[0]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const subjects = getPrimarySubjectsForClass(selectedClass);
  const topics = selectedSubject ? getPrimaryTopics(selectedSubject, selectedClass) : [];
  const lessons = topics.find(t => t.id === selectedTopic)?.subtopics || [];
  useEffect(() => {
    if (subjects.length > 0) setSelectedSubject(subjects[0].id);
  }, [selectedClass]);
  useEffect(() => {
    if (topics.length > 0) setSelectedTopic(topics[0].id);
  }, [selectedSubject, selectedClass]);
  useEffect(() => {
    if (lessons.length > 0) setSelectedLesson(lessons[0].id);
  }, [selectedTopic]);
  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };
  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };
  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));
  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!file && !externalUrl.trim()) {
      setError('Please upload a file or provide an external URL');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const data: ContentUploadData = {
        title: title.trim(),
        description: description.trim(),
        content_type: contentType,
        visibility_scope: visibility,
        publication_status: status,
        school_level: schoolLevel,
        language,
        tags,
        ...defaults,
        class_level: Number(selectedClass),
        subject: Number(selectedSubject),
        topic: Number(selectedTopic),
        lesson: Number(selectedLesson),
      };
      if (file) data.file = file;
      if (externalUrl.trim()) data.external_url = externalUrl.trim();
      await onSubmit(data);
      setTitle('');
      setDescription('');
      setFile(null);
      setExternalUrl('');
      setTags([]);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Content
          </DialogTitle>
          <DialogDescription>
            {role === 'teacher' && 'Upload learning resources for your classes'}
            {role === 'institution' && 'Upload institution-wide resources'}
            {role === 'admin' && 'Upload platform-wide resources'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}
          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-1 block">Title *</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Resource title" />
          </div>
          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of this resource"
              rows={3}
            />
          </div>
          {/* Content Type + School Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Content Type *</label>
              <Select value={contentType} onValueChange={v => setContentType(v as ContentType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map(ct => (
                    <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">School Level</label>
              <Select value={schoolLevel} onValueChange={setSchoolLevel}>
                <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Academic Scope: Class, Term, Subject, Topic, Lesson */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Class Level</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {classLevels.map(cl => (
                    <SelectItem key={cl} value={cl}>{cl}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Term</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {terms.map(term => (
                    <SelectItem key={term} value={term}>{term}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {subjects.map(subj => (
                    <SelectItem key={subj.id} value={subj.id}>{subj.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Topic</label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {topics.map(topic => (
                    <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Lesson</label>
              <Select value={selectedLesson} onValueChange={setSelectedLesson}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {lessons.map(lesson => (
                    <SelectItem key={lesson.id} value={lesson.id}>{lesson.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* File Upload */}
          <div>
            <label className="text-sm font-medium mb-1 block">File</label>
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={handleFileDrop}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  {getFileIcon(file)}
                  <div className="text-left">
                    <p className="text-sm font-medium truncate max-w-[300px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <Button
                    variant="ghost" size="sm"
                    onClick={e => { e.stopPropagation(); setFile(null); }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to browse or drag & drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOCX, PPTX, MP4, images, and more (max 500MB)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.mp4,.mov,.avi,.mkv,.webm,.m4v,.jpg,.jpeg,.png,.gif,.webp,.svg,.zip,.txt,.csv"
              />
            </div>
          </div>
          {/* External URL */}
          <div>
            <label className="text-sm font-medium mb-1 block">Or External URL</label>
            <Input
              value={externalUrl}
              onChange={e => setExternalUrl(e.target.value)}
              placeholder="https://example.com/resource"
              type="url"
            />
          </div>
          {/* Tags */}
          <div>
            <label className="text-sm font-medium mb-1 block">Tags</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="Add tag"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={addTag} type="button">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {/* Language */}
          <div>
            <label className="text-sm font-medium mb-1 block">Language</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="sw">Swahili</SelectItem>
                <SelectItem value="rw">Kinyarwanda</SelectItem>
                <SelectItem value="lg">Luganda</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={uploading}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={uploading}>
              {uploading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" /> Upload</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentUploadModal;
