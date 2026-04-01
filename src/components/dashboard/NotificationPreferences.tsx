import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { WhatsAppMockService } from '../../lib/whatsappService.mock';
import { MessageCircle, Bell, Mail, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

export const NotificationPreferences: React.FC = () => {
  const [waOptIn, setWaOptIn] = useState(true);
  const [sendingTest, setSendingTest] = useState(false);

  const handleTestWhatsApp = async () => {
    setSendingTest(true);
    try {
      await WhatsAppMockService.sendTemplateMessage({
        to: '+256700000000',
        templateName: 'weekly_summary',
        variables: { studentName: 'Grace Nakato', score: 92, missing_homework: 2 }
      });
      toast.success('Test WhatsApp message sent!');
    } catch (e) {
      toast.error('Failed to send test message.');
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="text-gray-600" size={20} /> Parent Communication Preferences
        </CardTitle>
        <CardDescription>Control how you receive alerts and weekly summaries</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* WhatsApp Channel */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg bg-green-50/30 border-green-100">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
             <div className="bg-green-100 p-2 rounded-full text-green-600">
                <MessageCircle size={24} />
             </div>
             <div>
                <h4 className="font-semibold text-gray-900">WhatsApp Summaries</h4>
                <p className="text-sm text-gray-600">Receive instant alerts and AI weekly summaries directly to your phone.</p>
             </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
             <Button 
                variant={waOptIn ? "default" : "outline"}
                className={waOptIn ? "bg-green-600 hover:bg-green-700 w-full md:w-auto" : "w-full md:w-auto"}
                onClick={() => setWaOptIn(!waOptIn)}
             >
                {waOptIn ? "Enabled" : "Enable"}
             </Button>
             {waOptIn && (
               <Button 
                 variant="secondary" 
                 size="sm" 
                 onClick={handleTestWhatsApp}
                 disabled={sendingTest}
                 title="Send Test Message"
               >
                 {sendingTest ? "..." : "Test"}
               </Button>
             )}
          </div>
        </div>

        {/* SMS Channel */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
             <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                <Smartphone size={24} />
             </div>
             <div>
                <h4 className="font-semibold text-gray-900">SMS Alerts</h4>
                <p className="text-sm text-gray-600">Critical alerts only (Missed exams, low balances).</p>
             </div>
          </div>
          <Button variant="outline" className="w-full md:w-auto">Disabled</Button>
        </div>

        {/* Email Channel */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
             <div className="bg-gray-100 p-2 rounded-full text-gray-600">
                <Mail size={24} />
             </div>
             <div>
                <h4 className="font-semibold text-gray-900">Email Reports</h4>
                <p className="text-sm text-gray-600">Detailed monthly pdf transcripts and receipts.</p>
             </div>
          </div>
          <Button variant="outline" className="w-full md:w-auto">Enabled</Button>
        </div>

      </CardContent>
    </Card>
  );
};
