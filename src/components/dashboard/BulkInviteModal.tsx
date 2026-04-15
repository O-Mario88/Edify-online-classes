import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { AlertCircle, CheckCircle2, Loader2, Users } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';

interface BulkInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionId: number | string;
  onSuccess: () => void;
}

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'class_teacher', label: 'Class Teacher' },
  { value: 'subject_teacher', label: 'Subject Teacher' },
  { value: 'dos', label: 'Director of Studies' },
  { value: 'registrar', label: 'Registrar' },
  { value: 'parent', label: 'Parent' },
];

export const BulkInviteModal: React.FC<BulkInviteModalProps> = ({ isOpen, onClose, institutionId, onSuccess }) => {
  const [emailsRaw, setEmailsRaw] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [conflictErrors, setConflictErrors] = useState<string[]>([]);

  const handleInvite = async () => {
    setError('');
    setSuccessMsg('');
    setConflictErrors([]);
    
    // Parse emails from comma or newline separation
    const rawLines = emailsRaw.split(/[\n,]+/).map(e => e.trim().toLowerCase()).filter(e => e.length > 0);
    const validEmails: string[] = [];
    const invalidLines: string[] = [];
    
    rawLines.forEach(line => {
       if (line.includes('@') && line.includes('.')) {
          validEmails.push(line);
       } else {
          invalidLines.push(line);
       }
    });

    if (invalidLines.length > 0) {
      setError(`Found ${invalidLines.length} invalid email(s) in your batch.`);
      setConflictErrors(invalidLines);
      return;
    }

    if (validEmails.length === 0) {
      setError('Please paste at least one valid email address.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await apiClient.post(`/institutions/${institutionId}/bulk_invite/`, {
        emails: validEmails,
        role
      });
      setSuccessMsg(`Success! Invited ${validEmails.length} users.`);
      setTimeout(() => {
        onSuccess();
        onClose();
        setEmailsRaw('');
        setSuccessMsg('');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred while inviting users.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-800" />
            Invite Users to Institution
          </DialogTitle>
          <DialogDescription>
            Paste a list of email addresses (comma or line separated), select their roles, and hit invite.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="role">Platform Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="emails">Email Addresses ({emailsRaw.split(/[\n,]+/).filter(e => e.trim().includes('@')).length} valid)</Label>
            <Textarea
              id="emails"
              placeholder="e.g. moses@school.com, grace.nakato@email.com&#10;Or paste a column straight from Excel..."
              className="h-32 resize-none"
              value={emailsRaw}
              onChange={(e) => setEmailsRaw(e.target.value)}
            />
          </div>

          {error && (
            <div className="flex flex-col gap-2 text-sm text-red-800 bg-red-50 p-3 rounded border border-red-200">
               <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4" /> {error}
               </div>
               {conflictErrors.length > 0 && (
                  <div className="mt-2 bg-white rounded border border-red-100 p-2 text-xs font-mono max-h-24 overflow-y-auto">
                     {conflictErrors.map((conflict, i) => (
                        <div key={i} className="text-red-600 line-clamp-1">{conflict}</div>
                     ))}
                  </div>
               )}
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 text-sm text-emerald-800 bg-green-50 p-2 rounded">
              <CheckCircle2 className="w-4 h-4" /> {successMsg}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={loading || emailsRaw.length === 0}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Dispatching...</> : 'Send Invitations'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
