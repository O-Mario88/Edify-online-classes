import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Share2, Download, ShieldCheck } from 'lucide-react';

export interface Certificate {
  id: string;
  title: string;
  issuedTo: string;
  issuedDate: string;
  issuerLogo: string;
  verificationHash: string;
}

interface CertificateCardProps {
  certificate: Certificate;
  isPublicView?: boolean;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ certificate, isPublicView = false }) => {
  return (
    <Card className="overflow-hidden border-2 shadow-lg relative group">
      {/* Decorative top border */}
      <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
      
      <CardContent className="p-8">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 mb-6">
            <img src={certificate.issuerLogo} alt="Issuer" className="h-full w-full object-contain grayscale opacity-50 block dark:hidden" />
            {/* Fallback icon if image doesn't exist */}
            <div className="bg-primary/10 h-full w-full rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
               <ShieldCheck size={32} />
            </div>
          </div>
          
          <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-2">Certificate of Completion</h2>
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6 px-4">{certificate.title}</h3>
          
          <p className="text-gray-700 mb-1">This is to certify that</p>
          <p className="text-xl font-bold text-primary mb-6 border-b pb-2 px-8 inline-block">{certificate.issuedTo}</p>
          
          <p className="text-sm text-gray-700 max-w-sm mb-8">
            has successfully completed all requirements and passed the final assessments for this module.
          </p>

          <div className="flex justify-between w-full items-end mt-4 pt-6 border-t border-dashed">
             <div className="text-left">
               <p className="text-xs text-muted-foreground uppercase tracking-widest">Date</p>
               <p className="text-sm font-medium">{new Date(certificate.issuedDate).toLocaleDateString()}</p>
             </div>
             <div className="text-right">
               <p className="text-xs text-muted-foreground uppercase tracking-widest">Verify ID</p>
               <p className="text-xs font-mono text-gray-800">{certificate.verificationHash.substring(0, 12)}</p>
             </div>
          </div>
        </div>

        {/* Action overlay - only visible on hover if not in public view */}
        {!isPublicView && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <Button variant="secondary" className="gap-2">
              <Download size={16} /> Download PDF
            </Button>
            <Button className="gap-2">
              <Share2 size={16} /> Share Profile
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
