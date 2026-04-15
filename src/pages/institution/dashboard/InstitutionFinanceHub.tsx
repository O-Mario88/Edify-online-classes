import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, TrendingUp, Search, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export const InstitutionFinanceHub = () => {
  const [exporting, setExporting] = useState(false);
  const [viewState, setViewState] = useState<'overview' | 'ledger'>('overview');

  const transactions = [
    { date: '2026-04-10', ref: 'Fee Payment: S.Kato', type: 'Credit', amount: 500000 },
    { date: '2026-04-09', ref: 'Maple Software License', type: 'Debit', amount: -150000 }
  ];

  const handleExportCashbook = async () => {
    setExporting(true);
    toast.info('Requesting ledger synthesis from financial gateway...');
    
    try {
      // Simulate API fetch delay
      await new Promise(res => setTimeout(res, 800));

      if (transactions.length === 0) {
        throw new Error("No transactions available to export.");
      }

      const headers = "Date,Reference,Type,Amount\n";
      const rows = transactions.map(t => `${t.date},"${t.ref}",${t.type},${t.amount}`);
      const csvContent = "data:text/csv;charset=utf-8," + headers + rows.join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `institution_ledger_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Cashbook exported successfully.');
    } catch (err: any) {
      toast.error(err.message || 'Export failed.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Finance Hub</h1>
            <p className="text-gray-500">Manage institution finances, cashbook, and transactions.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setViewState('ledger')} className="bg-white">
              <FileText className="w-4 h-4 mr-2" /> View Ledger
            </Button>
            <Button onClick={handleExportCashbook} disabled={exporting}>
              <Download className="w-4 h-4 mr-2" /> {exporting ? 'Processing...' : 'Export Cashbook'}
            </Button>
          </div>
        </div>

        {viewState === 'overview' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">UGX 45M</div>
                <p className="text-sm text-green-600 flex items-center mt-1"><TrendingUp className="w-3 h-3 mr-1"/> +12% this term</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Outstanding Dues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">UGX 12M</div>
                <p className="text-sm text-gray-500 mt-1">From 45 students</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="bg-green-100 text-green-800 border bg-transparent mb-2">Active</Badge>
                <div className="text-xl font-bold text-gray-900">Paid through Oct 2026</div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
             <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Detailed Ledger</CardTitle>
                  <CardDescription>All incoming and outgoing transactions</CardDescription>
                </div>
                <Button variant="ghost" onClick={() => setViewState('overview')}>Back to Overview</Button>
             </CardHeader>
             <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input className="w-full border rounded-md pl-10 pr-4 py-2 text-sm" placeholder="Search transactions..." />
                  </div>
                  <Button variant="outline"><Calendar className="w-4 h-4 mr-2"/> Filters</Button>
                </div>
                <div className="border rounded-xl bg-white overflow-hidden">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b">
                         <tr>
                            <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
                            <th className="px-4 py-3 font-semibold text-gray-600">Reference</th>
                            <th className="px-4 py-3 font-semibold text-gray-600">Type</th>
                            <th className="px-4 py-3 font-semibold text-gray-600 text-right">Amount</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y">
                         {transactions.map((t, idx) => (
                           <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-500">{t.date}</td>
                              <td className="px-4 py-3 font-medium">{t.ref}</td>
                              <td className="px-4 py-3">
                                <Badge variant="outline" className={t.type === 'Credit' ? "text-green-600 border-green-200 bg-green-50" : "text-gray-600 border-gray-200 bg-gray-50"}>{t.type}</Badge>
                              </td>
                              <td className={t.type === 'Credit' ? "px-4 py-3 text-right font-bold text-green-600" : "px-4 py-3 text-right font-bold text-gray-900"}>
                                {t.type === 'Debit' ? '- ' : ''}UGX {Math.abs(t.amount).toLocaleString()}
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
export default InstitutionFinanceHub;
