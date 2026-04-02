import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Briefcase, TrendingUp, TrendingDown, CreditCard, FileText, 
  Wallet, Users, BookOpen, AlertCircle, Plus, Search, 
  Download, ArrowUpRight, ArrowDownRight, Building2, Calculator, Receipt, UserCheck, BarChart3
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DynamicSchemaForm } from '@/components/forms/DynamicSchemaForm';
import { FeeItemConfig, OfflinePOSReceiptConfig, ExpenseRecordConfig } from '@/schemas/financeSchemas';
import { useToast } from '@/hooks/use-toast';

export function InstitutionFinanceHub() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();

  const handleAction = (actionName: string, desc: string) => {
    toast({
      title: actionName,
      description: desc,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
             <Briefcase className="w-8 h-8 text-emerald-600" /> Financial & Bursary Hub
          </h1>
          <p className="text-slate-500 mt-1">Manage school fee structures, collections, ledgers, and operational expenses natively.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-white dark:bg-slate-900 border-slate-200 shadow-sm" onClick={() => handleAction('Exporting Cashbook', 'Preparing your CSV download. This might take a moment...')}>
            <Download className="w-4 h-4" /> Export Cashbook
          </Button>
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" onClick={() => setActiveTab('ledgers')}>
            <Plus className="w-4 h-4" /> New Invoice
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto pb-2">
          <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 min-w-max">
            <TabsTrigger value="dashboard">Executive Dashboard</TabsTrigger>
            <TabsTrigger value="structures">Fee Structures</TabsTrigger>
            <TabsTrigger value="ledgers">Ledgers & Receipts</TabsTrigger>
            <TabsTrigger value="expenses">Cashbook</TabsTrigger>
            <TabsTrigger value="bursaries">Bursaries Matrix</TabsTrigger>
            <TabsTrigger value="reporting">Financial Reports</TabsTrigger>
          </TabsList>
        </div>

        {/* 1. EXECUTIVE DASHBOARD */}
        <TabsContent value="dashboard" className="mt-0 space-y-6">
          {/* Top KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Net Cash Position</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">UGX 42.5M</h3>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                    <Wallet className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm font-medium text-emerald-600">
                  <TrendingUp className="w-4 h-4 mr-1" /> +12% from last term
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Collections (Term 1)</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">84%</h3>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
                  <div className="bg-blue-600 h-2 rounded-full w-[84%]"></div>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">UGX 120M expected / 100M collected</p>
              </CardContent>
            </Card>

            <Card className="border border-rose-200 dark:border-rose-900/30 shadow-sm bg-rose-50/30 dark:bg-rose-900/10">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-rose-800 dark:text-rose-400 uppercase tracking-wide">Total Arrears</p>
                    <h3 className="text-3xl font-bold text-rose-700 dark:text-rose-300 mt-1">UGX 18.2M</h3>
                  </div>
                  <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-rose-600" />
                  </div>
                </div>
                <div className="mt-4 text-xs font-medium text-rose-600 flex justify-between">
                  <span>From 34 students</span>
                  <span className="underline cursor-pointer hover:text-rose-800" onClick={() => setActiveTab('ledgers')}>View Debtors</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Operating Expenses</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">UGX 32M</h3>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                    <CreditCard className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm font-medium text-slate-500">
                  <TrendingDown className="w-4 h-4 mr-1 text-emerald-500" /> Under budget by 5%
                </div>
              </CardContent>
            </Card>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
               <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                 <CardTitle className="text-lg">Recent Ledger Activity</CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                     {[1, 2, 3].map((i) => (
                       <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700">
                             <ArrowDownRight className="w-5 h-5" />
                           </div>
                           <div>
                             <p className="font-bold text-slate-900 dark:text-slate-100">Fee Payment Received</p>
                             <p className="text-xs text-slate-500">Student: John Doe (S3-A) • Mobile Money</p>
                           </div>
                         </div>
                         <div className="text-right">
                           <p className="font-black text-emerald-600 dark:text-emerald-400">+ UGX 400,000</p>
                           <p className="text-xs text-slate-400">10 mins ago</p>
                         </div>
                       </div>
                     ))}
                  </div>
               </CardContent>
             </Card>

             <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
               <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                 <CardTitle className="text-lg flex justify-between items-center">
                   <span>Access Control Automations</span>
                   <Badge className="bg-slate-900 dark:bg-white text-white dark:text-slate-900">Active</Badge>
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-6 space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">The following soft-locks are automatically applied to student accounts mapped with overdue balances exceeding UGX 50,000.</p>
                  
                  <div className="flex justify-between items-center p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="font-medium text-slate-700 dark:text-slate-300">End-of-Term Report Card Access</span>
                    <Badge variant="destructive">Locked (34 students)</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Live Session Admission</span>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20">Unlocked (Open for all)</Badge>
                  </div>
               </CardContent>
             </Card>
          </div>
        </TabsContent>

        {/* 1.5. FINANCIAL REPORTS */}
        <TabsContent value="reporting" className="mt-0">
          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
             <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-600"/> Termly Income Statement</CardTitle>
                  <CardDescription>Automatically calculated statement based on manual ledger entries.</CardDescription>
               </div>
               <Button variant="outline" size="sm" className="bg-white" onClick={() => handleAction('Generating Report', 'Your PDF Financial Report is being prepared.')}><Download className="w-4 h-4 mr-2" /> Export PDF</Button>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                   
                   <div className="space-y-4">
                     <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b pb-2">Revenue (Cash In)</h3>
                     <div className="space-y-3">
                       <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-700 font-medium">Tuition Fees Collected</span>
                         <span className="font-bold">UGX 84,000,000</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-700 font-medium">UNEB Exam Registrations</span>
                         <span className="font-bold">UGX 12,500,000</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-700 font-medium">Uniform & Material Sales</span>
                         <span className="font-bold">UGX 3,500,000</span>
                       </div>
                       <div className="flex justify-between items-center pt-2 border-t font-black text-emerald-700">
                         <span>Gross Revenue</span>
                         <span>UGX 100,000,000</span>
                       </div>
                     </div>
                   </div>

                   <div className="space-y-4">
                     <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b pb-2">Operating Expenses</h3>
                     <div className="space-y-3">
                       <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-700 font-medium">Payroll & Teacher Salaries</span>
                         <span className="font-bold">UGX 22,000,000</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-700 font-medium">Stationery & Admin Costs</span>
                         <span className="font-bold">UGX 4,500,000</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-700 font-medium">Utilities & Maintenance</span>
                         <span className="font-bold">UGX 5,500,000</span>
                       </div>
                       <div className="flex justify-between items-center pt-2 border-t font-black text-rose-700">
                         <span>Total Expenses</span>
                         <span>UGX 32,000,000</span>
                       </div>
                     </div>
                   </div>

                </div>

                <div className="mt-8 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex justify-between items-center">
                   <span className="text-indigo-900 font-bold uppercase">Net Operating Income</span>
                   <span className="text-2xl font-black text-indigo-700">UGX 68,000,000</span>
                </div>
             </CardContent>
          </Card>
        </TabsContent>

        {/* 2. FEE STRUCTURES */}
        <TabsContent value="structures" className="mt-0">
          <DynamicSchemaForm config={FeeItemConfig} />
        </TabsContent>

        {/* 3. STUDENT LEDGERS */}
        <TabsContent value="ledgers" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative w-full max-w-md">
                   <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                   <Input className="pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" placeholder="Search student name or admission number..." />
                </div>
                <Select>
                   <SelectTrigger className="w-[180px] h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                     <SelectValue placeholder="Filter by Status" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All Students</SelectItem>
                     <SelectItem value="cleared">Fully Cleared</SelectItem>
                     <SelectItem value="arrears">In Arrears</SelectItem>
                   </SelectContent>
                 </Select>
              </div>

          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
             <CardContent className="p-0">
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                   <tr>
                     <th className="px-6 py-4">Student</th>
                     <th className="px-6 py-4">Class</th>
                     <th className="px-6 py-4 text-right">Invoiced (UGX)</th>
                     <th className="px-6 py-4 text-right">Paid (UGX)</th>
                     <th className="px-6 py-4 text-right">Balance Due</th>
                     <th className="px-6 py-4 text-center">Status</th>
                     <th className="px-6 py-4"></th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/20">
                     <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">Alice Mukasa</td>
                     <td className="px-6 py-4 text-slate-500">S2-B</td>
                     <td className="px-6 py-4 text-right">800,000</td>
                     <td className="px-6 py-4 text-right text-emerald-600 font-medium">800,000</td>
                     <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-slate-100 mt-1">0</td>
                     <td className="px-6 py-4 text-center"><Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Cleared</Badge></td>
                     <td className="px-6 py-4 text-right"><Button variant="ghost" size="sm" className="text-blue-600" onClick={() => handleAction('Opening Ledger', 'Loading full ledger history for Alice Mukasa...')}>View Ledger</Button></td>
                   </tr>
                   <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/20 bg-rose-50/10">
                     <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">David Ochieng</td>
                     <td className="px-6 py-4 text-slate-500">S4-A</td>
                     <td className="px-6 py-4 text-right">960,000</td>
                     <td className="px-6 py-4 text-right text-emerald-600 font-medium">500,000</td>
                     <td className="px-6 py-4 text-right font-black text-rose-600 mt-1">460,000</td>
                     <td className="px-6 py-4 text-center"><Badge variant="destructive" className="border-none">Arrears</Badge></td>
                     <td className="px-6 py-4 text-right"><Button variant="ghost" size="sm" className="text-blue-600" onClick={() => handleAction('Opening Ledger', 'Loading full ledger history for David Ochieng...')}>View Ledger</Button></td>
                   </tr>
                 </tbody>
               </table>
             </CardContent>
          </Card>
          </div>
          
           <div className="space-y-4">
              <DynamicSchemaForm config={OfflinePOSReceiptConfig} />
           </div>
         </div>
        </TabsContent>

        {/* 4. EXPENSES */}
        <TabsContent value="expenses" className="mt-0">
          <DynamicSchemaForm config={ExpenseRecordConfig} />
        </TabsContent>

        {/* 5. BURSARIES */}
        <TabsContent value="bursaries" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <Card className="border border-slate-200 shadow-sm">
               <CardHeader className="border-b bg-slate-50/50">
                 <CardTitle className="text-lg flex justify-between">
                   <span>Bursary & Waiver Engine</span>
                   <Button size="sm" variant="outline" onClick={() => setActiveTab('structures')}><Plus className="w-4 h-4 mr-2" /> Create Template</Button>
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-600">
                      <tr>
                        <th className="px-4 py-3">Waiver Name</th>
                        <th className="px-4 py-3 text-right">Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="px-4 py-3 font-bold">Sibling Discount</td>
                        <td className="px-4 py-3 text-right text-emerald-600 font-bold">- 15% Base</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold">Academic Scholarship (Full)</td>
                        <td className="px-4 py-3 text-right text-emerald-600 font-bold">- 100% Tuition</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold">Staff Child Override</td>
                        <td className="px-4 py-3 text-right text-emerald-600 font-bold">- UGX 500,000</td>
                      </tr>
                    </tbody>
                  </table>
               </CardContent>
             </Card>

             <Card className="border border-indigo-200 bg-indigo-50/30 shadow-sm">
               <CardHeader className="pb-3 border-b border-indigo-100">
                 <CardTitle className="text-indigo-900 flex items-center gap-2"><UserCheck className="w-5 h-5"/> Attach Student to Bursary</CardTitle>
                 <CardDescription>Mapping a student to a waiver automatically adjusts their net invoice and ledger arrears.</CardDescription>
               </CardHeader>
               <CardContent className="pt-4 space-y-4">
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase text-slate-500">Student Account</label>
                   <Select>
                     <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Search student..." />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="david">David Ochieng (S4-A)</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase text-slate-500">Select Template</label>
                   <Select>
                     <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select Bursary Waiver..." />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="sibling">Sibling Discount (-15%)</SelectItem>
                        <SelectItem value="staff">Staff Child (-UGX 500k)</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => handleAction('Bursary Applied', 'Successfully mapped Bursary Template to David Ochieng.')}>Apply Bursary Reduction</Button>
               </CardContent>
             </Card>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
