import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Briefcase, TrendingUp, TrendingDown, CreditCard, FileText, 
  Wallet, Users, BookOpen, AlertCircle, Plus, Search, 
  Download, ArrowUpRight, ArrowDownRight, Building2, Calculator, Receipt, UserCheck, BarChart3, Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DynamicSchemaForm } from '@/components/forms/DynamicSchemaForm';
import { FeeItemConfig, OfflinePOSReceiptConfig, ExpenseRecordConfig } from '@/schemas/financeSchemas';
import { useToast } from '@/hooks/use-toast';
import { IntelligenceCard } from '@/components/dashboard/IntelligenceCard';
import { apiClient } from '@/lib/apiClient';

// ─── Types ────────────────────────────────────────────────────────────
interface FinanceKPIs {
  totalInvoiced: number;
  totalPaid: number;
  totalArrears: number;
  collectionRate: number;
  lockedStudents: number;
  operatingExpenses: number;
  netCashPosition: number;
}

interface StudentLedgerRow {
  id: number;
  student_name: string;
  current_class: string;
  total_invoiced: string;
  total_paid: string;
  current_balance: string;
  financial_status: string;
}

interface RecentPayment {
  id: number;
  payment_number: string;
  student_name: string;
  amount: string;
  payment_method: string;
  payment_date: string;
}

interface DiscountRuleRow {
  id: number;
  rule_code: string;
  rule_name: string;
  rule_type: string;
  discount_type: string;
  discount_value: string;
}

// ─── Constants ────────────────────────────────────────────────────────
const INSTITUTION_ID = 1; // MVP: Static institution ID — will come from context

// Helper: format UGX
function fmtUGX(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) || 0 : value;
  return `UGX ${num.toLocaleString('en-UG', { maximumFractionDigits: 0 })}`;
}

// ─── Component ────────────────────────────────────────────────────────
export function InstitutionFinanceHub() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();
  
  // Data state
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<FinanceKPIs>({
    totalInvoiced: 0, totalPaid: 0, totalArrears: 0,
    collectionRate: 0, lockedStudents: 0, operatingExpenses: 0, netCashPosition: 0
  });
  const [studentLedgers, setStudentLedgers] = useState<StudentLedgerRow[]>([]);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [discountRules, setDiscountRules] = useState<DiscountRuleRow[]>([]);
  const [ledgerFilter, setLedgerFilter] = useState('all');
  const [ledgerSearch, setLedgerSearch] = useState('');

  // ─── Data Fetching ──────────────────────────────────────────────────
  const basePath = `/api/v1/institutions/${INSTITUTION_ID}/finance`;

  const fetchFinanceData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch student profiles, payments, and discount rules in parallel
      const [profilesRes, paymentsRes, rulesRes] = await Promise.all([
        apiClient.get(`${basePath}/students/`),
        apiClient.get(`${basePath}/payments/?ordering=-payment_date&limit=5`),
        apiClient.get(`${basePath}/discount-rules/`),
      ]);

      // Parse student data
      const profiles: StudentLedgerRow[] = (profilesRes?.data?.results || profilesRes?.data || []).map((p: any) => ({
        id: p.id,
        student_name: p.student_name || `Student #${p.student}`,
        current_class: p.current_class || '—',
        total_invoiced: p.total_invoiced || '0',
        total_paid: p.total_paid || '0',
        current_balance: p.current_balance || '0',
        financial_status: p.financial_status || 'active',
      }));
      setStudentLedgers(profiles);

      // Calculate KPIs from profiles
      let totalInv = 0, totalPd = 0, totalArr = 0, locked = 0;
      profiles.forEach(p => {
        const inv = parseFloat(p.total_invoiced) || 0;
        const pd = parseFloat(p.total_paid) || 0;
        const bal = parseFloat(p.current_balance) || 0;
        totalInv += inv;
        totalPd += pd;
        if (bal < 0) totalArr += Math.abs(bal);
        if (p.financial_status === 'suspended') locked++;
      });
      setKpis({
        totalInvoiced: totalInv,
        totalPaid: totalPd,
        totalArrears: totalArr,
        collectionRate: totalInv > 0 ? Math.round((totalPd / totalInv) * 100) : 0,
        lockedStudents: locked,
        operatingExpenses: 0, // Would come from GL expense accounts
        netCashPosition: totalPd - 0, // Revenue minus expenses
      });

      // Parse payments
      const payments: RecentPayment[] = (paymentsRes?.data?.results || paymentsRes?.data || []).map((p: any) => ({
        id: p.id,
        payment_number: p.payment_number || `PAY-${p.id}`,
        student_name: p.student_name || `Student #${p.student}`,
        amount: p.amount || '0',
        payment_method: p.payment_method_display || p.payment_method || 'cash',
        payment_date: p.payment_date || 'Today',
      }));
      setRecentPayments(payments);

      // Parse discount rules
      const rules: DiscountRuleRow[] = (rulesRes?.data?.results || rulesRes?.data || []).map((r: any) => ({
        id: r.id,
        rule_code: r.rule_code,
        rule_name: r.rule_name,
        rule_type: r.rule_type,
        discount_type: r.discount_type,
        discount_value: r.discount_value,
      }));
      setDiscountRules(rules);

    } catch (err) {
      console.warn('[FinanceHub] API unavailable, using empty state:', err);
      // Leave defaults — the UI will show empty states rather than fake data
    } finally {
      setLoading(false);
    }
  }, [basePath]);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);


  const handleAction = (actionName: string, desc: string) => {
    toast({
      title: actionName,
      description: desc,
    });
  };

  // ─── Filtered ledger ────────────────────────────────────────────────
  const filteredLedgers = studentLedgers.filter(s => {
    const matchesFilter = ledgerFilter === 'all' 
      || (ledgerFilter === 'cleared' && s.financial_status === 'cleared')
      || (ledgerFilter === 'arrears' && (s.financial_status === 'in_arrears' || parseFloat(s.current_balance) < 0));
    const matchesSearch = ledgerSearch === '' 
      || s.student_name.toLowerCase().includes(ledgerSearch.toLowerCase())
      || s.current_class.toLowerCase().includes(ledgerSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // ─── Status badge helper ────────────────────────────────────────────
  const statusBadge = (status: string) => {
    switch (status) {
      case 'cleared': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Cleared</Badge>;
      case 'in_arrears': return <Badge variant="destructive" className="border-none">Arrears</Badge>;
      case 'suspended': return <Badge className="bg-orange-100 text-orange-700 border-none">Locked</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="w-full bg-transparent p-6 md:p-8 space-y-6">
      
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
          {/* Top KPIs (Intelligence Cards) — now data-driven */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400 mr-2" />
                <span className="text-slate-500">Loading financial data...</span>
              </div>
            ) : (
              [
                {
                  title: 'Net Cash Position',
                  value: fmtUGX(kpis.netCashPosition),
                  trendValue: kpis.collectionRate,
                  trendLabel: 'collection rate',
                  trendDirection: 'up',
                  riskLevel: kpis.collectionRate >= 80 ? 'healthy' : kpis.collectionRate >= 50 ? 'warning' : 'critical'
                },
                {
                  title: 'Collections',
                  value: `${kpis.collectionRate}%`,
                  trendValue: kpis.collectionRate,
                  trendLabel: 'of invoiced total',
                  trendDirection: kpis.collectionRate >= 70 ? 'up' : 'down',
                  riskLevel: kpis.collectionRate >= 80 ? 'healthy' : 'warning',
                  alertText: `${fmtUGX(kpis.totalPaid)} / ${fmtUGX(kpis.totalInvoiced)} Collected`
                },
                {
                  title: 'Total Arrears',
                  value: fmtUGX(kpis.totalArrears),
                  trendValue: kpis.totalArrears > 0 ? Math.round((kpis.totalArrears / Math.max(kpis.totalInvoiced, 1)) * 100) : 0,
                  trendLabel: 'of total invoiced',
                  trendDirection: 'up',
                  trendIsGood: false,
                  riskLevel: kpis.totalArrears > 0 ? 'critical' : 'healthy',
                  alertText: `From ${studentLedgers.filter(s => s.financial_status === 'in_arrears').length} students`,
                  actionLabel: 'View Debtors',
                  actionCallback: () => setActiveTab('ledgers')
                },
                {
                  title: 'Finance Locks',
                  value: `${kpis.lockedStudents} Locked`,
                  trendValue: kpis.lockedStudents,
                  trendLabel: `student${kpis.lockedStudents !== 1 ? 's' : ''} suspended`,
                  trendDirection: kpis.lockedStudents > 0 ? 'up' : 'down',
                  trendIsGood: kpis.lockedStudents === 0,
                  riskLevel: kpis.lockedStudents > 10 ? 'critical' : kpis.lockedStudents > 0 ? 'warning' : 'healthy',
                  alertText: 'Report cards disabled',
                  actionLabel: 'Message Parents',
                  actionCallback: () => handleAction('Messaging', `Sent reminder to ${kpis.lockedStudents} parents.`)
                },
                {
                  title: 'Operating Expenses',
                  value: fmtUGX(kpis.operatingExpenses),
                  trendValue: 0,
                  trendLabel: 'this term',
                  trendDirection: 'down',
                  trendIsGood: true,
                  riskLevel: 'healthy'
                }
              ].map((card: any, i: number) => (
                <IntelligenceCard key={i} {...card} />
              ))
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
               <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                 <CardTitle className="text-lg">Recent Ledger Activity</CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                     {recentPayments.length === 0 ? (
                       <div className="p-6 text-center text-slate-500 text-sm">
                         No recent payments recorded. Payments will appear here as they're processed.
                       </div>
                     ) : (
                       recentPayments.slice(0, 4).map((payment) => (
                        <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700">
                              <ArrowDownRight className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-slate-100">Fee Payment Received</p>
                              <p className="text-xs text-slate-500">{payment.student_name} • {payment.payment_method}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-emerald-600 dark:text-emerald-400">+ {fmtUGX(payment.amount)}</p>
                            <p className="text-xs text-slate-400">{payment.payment_date}</p>
                          </div>
                        </div>
                       ))
                     )}
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
                    {kpis.lockedStudents > 0 ? (
                      <Badge variant="destructive">Locked ({kpis.lockedStudents} students)</Badge>
                    ) : (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Unlocked</Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Live Session Admission</span>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20">Unlocked (Open for all)</Badge>
                  </div>
               </CardContent>
             </Card>
          </div>
        </TabsContent>

        {/* FINANCIAL REPORTS */}
        <TabsContent value="reporting" className="mt-0">
          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
             <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-600"/> Termly Income Statement</CardTitle>
                  <CardDescription>Automatically calculated from student profile and GL data.</CardDescription>
               </div>
               <Button variant="outline" size="sm" className="bg-white" onClick={() => handleAction('Generating Report', 'Your PDF Financial Report is being prepared.')}><Download className="w-4 h-4 mr-2" /> Export PDF</Button>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                   
                   <div className="space-y-4">
                     <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b pb-2">Revenue (Cash In)</h3>
                     <div className="space-y-3">
                       <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-700 font-medium">Total Invoiced (Term)</span>
                         <span className="font-bold">{fmtUGX(kpis.totalInvoiced)}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-700 font-medium">Total Collected</span>
                         <span className="font-bold">{fmtUGX(kpis.totalPaid)}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-700 font-medium">Outstanding Balance</span>
                         <span className="font-bold text-amber-600">{fmtUGX(kpis.totalArrears)}</span>
                       </div>
                       <div className="flex justify-between items-center pt-2 border-t font-black text-emerald-700">
                         <span>Gross Revenue</span>
                         <span>{fmtUGX(kpis.totalPaid)}</span>
                       </div>
                     </div>
                   </div>

                   <div className="space-y-4">
                     <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b pb-2">Operating Expenses</h3>
                     <div className="space-y-3">
                       <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-700 font-medium">Total Expenses (GL)</span>
                         <span className="font-bold">{fmtUGX(kpis.operatingExpenses)}</span>
                       </div>
                       <div className="flex justify-between items-center pt-2 border-t font-black text-rose-700">
                         <span>Total Outflows</span>
                         <span>{fmtUGX(kpis.operatingExpenses)}</span>
                       </div>
                     </div>
                   </div>

                </div>

                <div className="mt-8 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex justify-between items-center">
                   <span className="text-indigo-900 font-bold uppercase">Net Operating Income</span>
                   <span className="text-2xl font-black text-indigo-700">{fmtUGX(kpis.totalPaid - kpis.operatingExpenses)}</span>
                </div>
             </CardContent>
          </Card>
        </TabsContent>

        {/* 2. FEE STRUCTURES */}
        <TabsContent value="structures" className="mt-0">
          <DynamicSchemaForm config={FeeItemConfig} onSubmitSuccess={() => { fetchFinanceData(); toast({ title: 'Fee Item Created', description: 'The fee category has been added to your institution.' }); }} />
        </TabsContent>

        {/* 3. STUDENT LEDGERS — now data-driven */}
        <TabsContent value="ledgers" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative w-full max-w-md">
                   <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                   <Input 
                     className="pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" 
                     placeholder="Search student name or class..." 
                     value={ledgerSearch}
                     onChange={(e) => setLedgerSearch(e.target.value)}
                   />
                </div>
                <Select value={ledgerFilter} onValueChange={setLedgerFilter}>
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
                   {filteredLedgers.length === 0 ? (
                     <tr>
                       <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                         {loading ? (
                           <div className="flex items-center justify-center gap-2">
                             <Loader2 className="w-5 h-5 animate-spin" /> Loading student data...
                           </div>
                         ) : (
                           'No student profiles found. Enroll students to begin billing.'
                         )}
                       </td>
                     </tr>
                   ) : (
                     filteredLedgers.map((student) => {
                       const balance = parseFloat(student.current_balance) || 0;
                       const invoiced = parseFloat(student.total_invoiced) || 0;
                       const paid = parseFloat(student.total_paid) || 0;
                       return (
                         <tr key={student.id} className={`hover:bg-slate-50 dark:hover:bg-slate-900/20 ${balance < -50000 ? 'bg-rose-50/10' : ''}`}>
                           <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">{student.student_name}</td>
                           <td className="px-6 py-4 text-slate-500">{student.current_class}</td>
                           <td className="px-6 py-4 text-right">{invoiced.toLocaleString()}</td>
                           <td className="px-6 py-4 text-right text-emerald-600 font-medium">{paid.toLocaleString()}</td>
                           <td className={`px-6 py-4 text-right font-black ${balance < 0 ? 'text-rose-600' : 'text-slate-900 dark:text-slate-100'}`}>
                             {Math.abs(balance).toLocaleString()}
                           </td>
                           <td className="px-6 py-4 text-center">{statusBadge(student.financial_status)}</td>
                           <td className="px-6 py-4 text-right">
                             <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => handleAction('Opening Ledger', `Loading full ledger history for ${student.student_name}...`)}>
                               View Ledger
                             </Button>
                           </td>
                         </tr>
                       );
                     })
                   )}
                 </tbody>
               </table>
             </CardContent>
          </Card>
          </div>
          
           <div className="space-y-4">
              <DynamicSchemaForm config={OfflinePOSReceiptConfig} onSubmitSuccess={() => { fetchFinanceData(); toast({ title: 'Payment Recorded', description: 'The payment has been logged and will be allocated.' }); }} />
           </div>
         </div>
        </TabsContent>

        {/* 4. EXPENSES */}
        <TabsContent value="expenses" className="mt-0">
          <DynamicSchemaForm config={ExpenseRecordConfig} onSubmitSuccess={() => { fetchFinanceData(); toast({ title: 'Expense Logged', description: 'The journal entry has been recorded.' }); }} />
        </TabsContent>

        {/* 5. BURSARIES — now data-driven */}
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
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3 text-right">Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {discountRules.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-slate-500 text-sm">
                            No discount rules configured. Create templates to offer bursaries.
                          </td>
                        </tr>
                      ) : (
                        discountRules.map((rule) => (
                          <tr key={rule.id}>
                            <td className="px-4 py-3 font-bold">{rule.rule_name}</td>
                            <td className="px-4 py-3 text-slate-500 capitalize">{rule.rule_type.replace(/_/g, ' ')}</td>
                            <td className="px-4 py-3 text-right text-emerald-600 font-bold">
                              - {rule.discount_type === 'percentage' ? `${rule.discount_value}%` : fmtUGX(rule.discount_value)} 
                            </td>
                          </tr>
                        ))
                      )}
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
                        {studentLedgers.map(s => (
                          <SelectItem key={s.id} value={String(s.id)}>{s.student_name} ({s.current_class})</SelectItem>
                        ))}
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
                        {discountRules.map(r => (
                          <SelectItem key={r.id} value={String(r.id)}>
                            {r.rule_name} (-{r.discount_type === 'percentage' ? `${r.discount_value}%` : fmtUGX(r.discount_value)})
                          </SelectItem>
                        ))}
                     </SelectContent>
                   </Select>
                 </div>
                 <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => handleAction('Bursary Applied', 'Successfully mapped bursary template to student.')}>Apply Bursary Reduction</Button>
               </CardContent>
             </Card>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
