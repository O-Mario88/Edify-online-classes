export type PaymentTransactionState = 'idle' | 'pending_callback' | 'confirmed' | 'failed';

export interface PaymentTransactionResult {
  transactionId: string;
  state: PaymentTransactionState;
  amount: number;
  message: string;
}

/**
 * EcosystemIntegrationService
 * Simulates real-world resilience requirements for external integration flows 
 * like payments, where state must be polled, webhooks can drop, and validations are robust.
 */
class EcosystemIntegrationServiceEngine {
  private transactionMocks: Map<string, PaymentTransactionState> = new Map();

  /**
   * Generates a transaction ID representing an active checkout session
   */
  public initiateCheckoutSession(amount: number): string {
    const txnId = `txn-mock-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;
    this.transactionMocks.set(txnId, 'pending_callback');
    return txnId;
  }

  /**
   * For the mock environment - sets the transaction's simulated webhook result
   */
  public simulateWebhookCallback(txnId: string, outcome: 'success' | 'failure') {
    if (!this.transactionMocks.has(txnId)) {
      console.warn(`Simulated Webhook dropped: Unknown transaction ${txnId}`);
      return;
    }
    this.transactionMocks.set(txnId, outcome === 'success' ? 'confirmed' : 'failed');
  }

  /**
   * Used by the UI to poll for payment state changes
   */
  public async pollTransactionState(txnId: string): Promise<PaymentTransactionState> {
    // Artificial network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (!this.transactionMocks.has(txnId)) {
      return 'failed';
    }
    return this.transactionMocks.get(txnId)!;
  }

  /**
   * For test scenarios: fetches all integration logs
   */
  public getIntegrationObservabilityLogs() {
    let pending = 0;
    let confirmed = 0;
    let failed = 0;

    this.transactionMocks.forEach((val) => {
      if (val === 'pending_callback') pending++;
      if (val === 'confirmed') confirmed++;
      if (val === 'failed') failed++;
    });

    return {
      paymentWebhooks: {
        total: this.transactionMocks.size,
        confirmed,
        failed,
        pending
      }
    };
  }
}

export const EcosystemIntegrationService = new EcosystemIntegrationServiceEngine();
