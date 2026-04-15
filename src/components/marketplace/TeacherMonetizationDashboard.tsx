import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Progress } from '../ui/progress';
import { AlertCircle, CheckCircle, Clock, Smartphone, Info } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface MonetizationOverview {
  total_obligation: string | number;
  recovered_amount: string | number;
  remaining_balance: string | number;
  is_recovered: boolean;
  last_net_payout: string | number;
}

interface QualificationRecord {
  id: string;
  lesson_title: string;
  scheduled_at: string;
  status: string;
  rejection_reason: string | null;
  calculated_payout: string | number;
}

interface Profile {
  id: string;
  mobile_number: string;
  network: string;
}

interface EligibilityStatus {
  eligible: boolean;
  reason: string;
  gross_available: number;
  deduction_due: number;
  net_payable: number;
  remaining_fee_balance: number;
}

export const TeacherMonetizationDashboard: React.FC = () => {
    const [overview, setOverview] = useState<MonetizationOverview | null>(null);
    const [records, setRecords] = useState<QualificationRecord[]>([]);
    
    // Payout Profile & Eligibility state
    const [profile, setProfile] = useState<Profile | null>(null);
    const [eligibility, setEligibility] = useState<EligibilityStatus | null>(null);
    const [loadingPayout, setLoadingPayout] = useState(false);
    
    // Form state
    const [mobileNumber, setMobileNumber] = useState('');
    const [network, setNetwork] = useState('mtn');
    const [savingProfile, setSavingProfile] = useState(false);
    const [payoutMessage, setPayoutMessage] = useState<string | null>(null);

    const load = async () => {
        try {
            const [overviewRes, recordsRes, profileRes, eligRes] = await Promise.all([
                apiClient.get('/marketplace/monetization-overview/').catch(() => ({ data: null })),
                apiClient.get('/marketplace/lesson-qualifications/').catch(() => ({ data: [] })),
                apiClient.get('/marketplace/payout-profile/').catch(() => ({ data: [] })),
                apiClient.get('/marketplace/payouts/eligibility/').catch(() => ({ data: null }))
            ]);
            if (overviewRes.data) setOverview(overviewRes.data);
            if (recordsRes.data) setRecords(recordsRes.data);
            if (profileRes.data && profileRes.data.length > 0) {
                setProfile(profileRes.data[0]);
                setMobileNumber(profileRes.data[0].mobile_number);
                setNetwork(profileRes.data[0].network);
            }
            if (eligRes.data) setEligibility(eligRes.data);
        } catch (err) {
            console.error("Failed to load monetization data", err);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        try {
            if (profile) {
                await apiClient.put(`/marketplace/payout-profile/${profile.id}/`, {
                    mobile_number: mobileNumber,
                    network: network
                });
            } else {
                await apiClient.post('/marketplace/payout-profile/', {
                    mobile_number: mobileNumber,
                    network: network
                });
            }
            await load(); // Reload eligibility
        } catch (err) {
            console.error(err);
        } finally {
            setSavingProfile(false);
        }
    };

    const handleRequestPayout = async () => {
        setLoadingPayout(true);
        setPayoutMessage(null);
        try {
            await apiClient.post('/marketplace/payouts/');
            setPayoutMessage("Payout successfully queued via MoMo!");
            await load(); // Refresh eligibility & status
        } catch (err: any) {
            setPayoutMessage(err.response?.data?.detail || "Failed to trigger payout.");
        } finally {
            setLoadingPayout(false);
        }
    };

    if (!overview) return <div className="p-8 text-center text-gray-700">Loading payment dashboard...</div>;

    const progressPercentage = (Number(overview.recovered_amount) / Number(overview.total_obligation)) * 100;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Command Center: Balances & Payouts</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700">Access Fee Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            UGX {Number(overview.recovered_amount).toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-700 mb-2">of UGX {Number(overview.total_obligation).toLocaleString()} total</p>
                        <Progress value={progressPercentage} className="h-2" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700">Remaining Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            UGX {Number(overview.remaining_balance).toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-700">Auto-deducted in chunks of 60k</p>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2 border-green-500 bg-green-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                            <Clock className="w-4 h-4"/> Next Allowed Payout
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {eligibility ? (
                             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div>
                                    <div className="text-3xl font-bold text-green-700">
                                        UGX {Number(eligibility.net_payable || 0).toLocaleString()}
                                    </div>
                                    <p className="text-sm text-emerald-800 mt-1">
                                        {eligibility.eligible 
                                            ? "Available for immediate Mobile Money disbursement"
                                            : eligibility.reason}
                                    </p>
                                    {eligibility.deduction_due > 0 && (
                                        <p className="text-xs text-orange-600 mt-1">
                                            *(Gross available was UGX {eligibility.gross_available.toLocaleString()}; UGX {eligibility.deduction_due.toLocaleString()} applied to fee recovery)*
                                        </p>
                                    )}
                                </div>
                                <div className="mt-4 sm:mt-0 flex flex-col gap-2 relative">
                                    <Button 
                                        onClick={handleRequestPayout}
                                        disabled={!eligibility.eligible || loadingPayout || !profile}
                                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6"
                                    >
                                        {loadingPayout ? "Processing..." : "Request Payout Now"}
                                    </Button>
                                    {!profile && <span className="text-xs text-red-700 text-center">Missing Profile</span>}
                                </div>
                             </div>
                        ) : (
                            <div className="text-sm text-gray-700">Loading payout rules...</div>
                        )}
                        {payoutMessage && (
                            <div className="mt-3 text-sm font-medium p-2 bg-white rounded border border-green-200">
                                {payoutMessage}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* SETTINGS / PROFILE SIDEBAR */}
                <div className="space-y-6 lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Smartphone className="h-5 w-5"/>
                                Payout Profile
                            </CardTitle>
                            <CardDescription>Configure your backend Mobile Money source.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Mobile Network</label>
                                    <select 
                                        className="w-full border rounded-md px-3 py-2 text-sm"
                                        value={network}
                                        onChange={e => setNetwork(e.target.value)}
                                    >
                                        <option value="mtn">MTN Mobile Money</option>
                                        <option value="airtel">Airtel Money</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Mobile Number</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 0777123456" 
                                        className="w-full border rounded-md px-3 py-2 text-sm"
                                        value={mobileNumber}
                                        onChange={e => setMobileNumber(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-700 mt-1">Transactions will be sent from platform source: 0777078032</p>
                                </div>
                                <Button 
                                    className="w-full" 
                                    variant="outline" 
                                    onClick={handleSaveProfile}
                                    disabled={savingProfile}
                                >
                                    {savingProfile ? "Saving..." : (profile ? "Update Payout Source" : "Save Payout Source")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                            <div className="flex gap-3">
                                <Info className="h-5 w-5 text-blue-800 flex-shrink-0" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-semibold mb-1">How it works</p>
                                    <p>Upon requesting a payout, the Maple command engine immediately assesses your fee recovery. Any available chunk is deducted safely before your net total is routed to your mobile money account using <strong>automatic disbursement.</strong></p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* EARNINGS LEDGER */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Lesson Qualification Ledger</CardTitle>
                        <CardDescription>Track which lessons qualified for the UGX 20,000 payout vs which were rejected.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {records.length === 0 ? (
                                <div className="bg-gray-50 p-6 text-center text-gray-700 rounded-lg border border-dashed">No lessons evaluated yet. Ensure your lessons belong to a public class and have active attendees!</div>
                            ) : records.map(r => (
                                <div key={r.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{r.lesson_title}</h4>
                                        <p className="text-sm text-gray-700">Scheduled: {new Date(r.scheduled_at).toLocaleDateString()}</p>
                                        {r.status === 'rejected_for_payout' && (
                                            <p className="text-sm text-red-800 mt-1 flex items-center gap-1 bg-red-50 p-1 px-2 rounded">
                                                <AlertCircle className="h-4 w-4" />
                                                {r.rejection_reason}
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-4 sm:mt-0 flex items-center gap-4">
                                        <Badge variant={r.status === 'qualified_for_payout' || r.status === 'paid_out' ? 'default' : (r.status === 'rejected_for_payout' ? 'destructive' : 'secondary')}>
                                            {r.status.replace(/_/g, ' ').toUpperCase()}
                                        </Badge>
                                        <span className="font-bold whitespace-nowrap text-green-700">
                                            UGX {Number(r.calculated_payout).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

            </main>
        </div>
    );
};
