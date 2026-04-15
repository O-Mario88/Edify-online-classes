import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  CreditCard, 
  Smartphone, 
  Building2,
  CheckCircle,
  ArrowLeft,
  Shield,
  Clock,
  MapPin,
  AlertCircle,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { EcosystemIntegrationService } from '../lib/integrations/EcosystemIntegrationService';
import { apiClient } from '../lib/apiClient';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'mobile_money' | 'bank_transfer' | 'credit_card';
  icon: React.ReactNode;
  description: string;
  processingTime: string;
  fees: string;
  popular?: boolean;
}

export const PaymentPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bankDetails, setBankDetails] = useState({ accountNumber: '', bankName: '' });
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [processing, setProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [transactionState, setTransactionState] = useState<'idle' | 'pending_callback' | 'failed' | 'confirmed'>('idle');
  const [txnId, setTxnId] = useState<string | null>(null);
  const [pricingData, setPricingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const planType = searchParams.get('plan') || 'student';
  const planId = searchParams.get('planId') || '';
  const classId = searchParams.get('classId') || '';

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        const response = await fetch('/data/pricing.json');
        const data = await response.json();
        setPricingData(data);
      } catch (error) {
        console.error('Error fetching pricing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPricingData();
  }, []);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'mtn_momo',
      name: 'MTN Mobile Money',
      type: 'mobile_money',
      icon: <Smartphone className="h-6 w-6 text-yellow-600" />,
      description: 'Pay using your MTN Mobile Money account',
      processingTime: 'Instant',
      fees: 'UGX 1,000 + 1%',
      popular: true
    },
    {
      id: 'airtel_money',
      name: 'Airtel Money',
      type: 'mobile_money',
      icon: <Smartphone className="h-6 w-6 text-red-600" />,
      description: 'Pay using your Airtel Money account',
      processingTime: 'Instant',
      fees: 'UGX 1,000 + 1%'
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      type: 'bank_transfer',
      icon: <Building2 className="h-6 w-6 text-blue-600" />,
      description: 'Direct bank transfer (Stanbic, Centenary, etc.)',
      processingTime: '1-2 business days',
      fees: 'Bank charges apply'
    },
    {
      id: 'credit_card',
      name: 'Credit/Debit Card',
      type: 'credit_card',
      icon: <CreditCard className="h-6 w-6 text-purple-600" />,
      description: 'Visa, Mastercard, American Express',
      processingTime: 'Instant',
      fees: '3.5% processing fee'
    }
  ];

  const getSelectedPlan = () => {
    if (!pricingData) return null;

    if (planType === 'student') {
      if (planId === 'all_access') {
        return pricingData.studentPricing.specialOffers?.allAccess;
      }
      
      const levelPricing = pricingData.studentPricing.byLevel.find((level: any) => 
        level.classes.some((cls: any) => cls.id === classId || cls.id === planId)
      );
      
      if (levelPricing) {
        return levelPricing.classes.find((cls: any) => cls.id === classId || cls.id === planId);
      }
    }
    
    if (planType === 'teacher') {
      return pricingData.teacherMembership.plans.find((plan: any) => plan.id === planId);
    }

    return null;
  };

  const selectedPlan = getSelectedPlan();

  const handlePayment = async () => {
    if (!selectedMethod || !selectedPlan) return;

    setProcessing(true);
    setTransactionState('pending_callback');

    const amount = getTotalAmount().ugx;
    
    try {
      const { data, error } = await apiClient.post('/marketplace/pesapal-checkout/', {
        amount,
        description: `Payment for ${selectedPlan.name || 'Maple Plan'}`,
      });

      if (error) {
        throw new Error(error.message || 'Payment initiation failed');
      }

      if (data?.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        throw new Error('Invalid redirect URL from payment provider');
      }
    } catch (err) {
      console.error(err);
      setTransactionState('failed');
      setProcessing(false);
    }
  };

  const pollPayment = async (txn: string) => {
    const st = await EcosystemIntegrationService.pollTransactionState(txn);
    if (st === 'confirmed') {
       try {
          const rawUser = localStorage.getItem('maple-auth-user');
          if (rawUser) {
            const parsed = JSON.parse(rawUser);
            parsed.activation_status = 'active';
            localStorage.setItem('maple-auth-user', JSON.stringify(parsed));
          }
       } catch (e) {}
       setTransactionState('confirmed');
       setPaymentComplete(true);
       setProcessing(false);
    } else if (st === 'failed') {
       setTransactionState('failed');
       setProcessing(false);
    } else {
       // Keep polling
       setTimeout(() => pollPayment(txn), 1500);
    }
  };

  const simulateWebhook = (outcome: 'success' | 'failure') => {
    if (txnId) EcosystemIntegrationService.simulateWebhookCallback(txnId, outcome);
  };

  const getTotalAmount = () => {
    if (!selectedPlan) return { ugx: 0, usd: 0 };
    
    const baseUGX = selectedPlan.priceUGX || selectedPlan.monthlyPriceUGX || 0;
    const baseUSD = selectedPlan.priceUSD || selectedPlan.monthlyPriceUSD || 0;
    
    let feeMultiplier = 1;
    if (selectedMethod === 'mtn_momo' || selectedMethod === 'airtel_money') {
      feeMultiplier = 1.01;
    } else if (selectedMethod === 'credit_card') {
      feeMultiplier = 1.035;
    }
    
    return {
      ugx: Math.round(baseUGX * feeMultiplier),
      usd: Math.round(baseUSD * feeMultiplier * 100) / 100
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment options...</p>
        </div>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your payment has been processed successfully. You now have access to your selected plan.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate(user?.role === 'independent_teacher' ? '/dashboard/teacher' : '/dashboard/student')}
                className="w-full"
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/classes')}
                className="w-full"
              >
                Browse Classes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Plan Not Found</h2>
            <p className="text-gray-600 mb-6">
              The selected plan could not be found. Please select a plan first.
            </p>
            <Button onClick={() => navigate('/classes')} className="w-full">
              Browse Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalAmount = getTotalAmount();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span className="text-blue-600 font-medium">Uganda Payment Gateway</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
          <p className="text-gray-600 mt-2">
            Secure payment processing for Maple Online School Uganda
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Payment Method</CardTitle>
                <p className="text-gray-600">Choose your preferred payment method</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {method.icon}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">{method.name}</h4>
                              {method.popular && (
                                <Badge variant="default" className="text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{method.description}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {method.processingTime}
                              </span>
                              <span>Fees: {method.fees}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          selectedMethod === method.id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedMethod === method.id && (
                            <CheckCircle className="h-3 w-3 text-white m-0.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedMethod && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium text-gray-900 mb-4">
                      {paymentMethods.find(m => m.id === selectedMethod)?.name} Details
                    </h4>
                    
                    {(selectedMethod === 'mtn_momo' || selectedMethod === 'airtel_money') && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <Input
                            type="tel"
                            placeholder="0750 123 456"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            You will receive a prompt on your phone to complete the payment
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedMethod === 'bank_transfer' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bank Name
                          </label>
                          <select 
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            value={bankDetails.bankName}
                            onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                          >
                            <option value="">Select your bank</option>
                            <option value="stanbic">Stanbic Bank Uganda</option>
                            <option value="centenary">Centenary Bank</option>
                            <option value="dfcu">DFCU Bank</option>
                            <option value="kcb">KCB Bank Uganda</option>
                            <option value="absa">Absa Bank Uganda</option>
                            <option value="equity">Equity Bank Uganda</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account Number
                          </label>
                          <Input
                            type="text"
                            placeholder="Your account number"
                            value={bankDetails.accountNumber}
                            onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                          />
                        </div>
                      </div>
                    )}

                    {selectedMethod === 'credit_card' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cardholder Name
                          </label>
                          <Input
                            type="text"
                            placeholder="John Doe"
                            value={cardDetails.name}
                            onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Card Number
                          </label>
                          <Input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={cardDetails.number}
                            onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Expiry Date
                            </label>
                            <Input
                              type="text"
                              placeholder="MM/YY"
                              value={cardDetails.expiry}
                              onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CVV
                            </label>
                            <Input
                              type="text"
                              placeholder="123"
                              value={cardDetails.cvv}
                              onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedPlan.name}</h4>
                    <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                    {selectedPlan.level && (
                      <Badge variant="outline" className="mt-1">{selectedPlan.level}</Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Base Price</span>
                      <span>UGX {(selectedPlan.priceUGX || selectedPlan.monthlyPriceUGX)?.toLocaleString()}</span>
                    </div>
                    {selectedMethod && selectedMethod !== 'bank_transfer' && (
                      <div className="flex justify-between text-gray-600">
                        <span>Processing Fee</span>
                        <span>UGX {(totalAmount.ugx - (selectedPlan.priceUGX || selectedPlan.monthlyPriceUGX)).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>UGX {totalAmount.ugx.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      ≈ USD {totalAmount.usd}
                    </div>
                  </div>

                  {selectedPlan.features && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">What's included:</h5>
                      <ul className="text-sm space-y-1">
                        {selectedPlan.features.slice(0, 4).map((feature: string, index: number) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {transactionState === 'idle' ? (
                    <Button 
                      onClick={handlePayment}
                      disabled={!selectedMethod || processing}
                      className="w-full"
                    >
                      Pay UGX {totalAmount.ugx.toLocaleString()}
                    </Button>
                  ) : (
                    <div className="space-y-3 bg-slate-50 border p-4 rounded-xl">
                       {transactionState === 'pending_callback' ? (
                          <>
                            <div className="flex items-center gap-2 text-amber-600 font-bold justify-center mb-2">
                               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                               Awaiting External Callback...
                            </div>
                            <Button size="sm" onClick={() => simulateWebhook('success')} className="w-full bg-emerald-600">Simulate Network Success</Button>
                            <Button size="sm" variant="destructive" onClick={() => simulateWebhook('failure')} className="w-full">Simulate Delivery Failure</Button>
                          </>
                       ) : transactionState === 'failed' ? (
                          <>
                            <div className="flex items-center gap-2 text-red-600 font-bold justify-center mb-2">
                               <AlertCircle className="w-5 h-5"/>
                               Payment Callback Failed!
                            </div>
                            <Button size="sm" onClick={() => setTransactionState('idle')} className="w-full">Retry Payment Flow</Button>
                          </>
                       ) : null}
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
                    <Shield className="h-4 w-4" />
                    <span>Secured by 256-bit SSL encryption</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
