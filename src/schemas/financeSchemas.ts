import * as z from 'zod';
import { FormSchemaConfig } from '@/components/forms/DynamicSchemaForm';

/**
 * Finance Schema Configurations
 * 
 * All endpoints are institution-scoped:
 *   /api/v1/institutions/{institution_id}/finance/...
 * 
 * The DynamicSchemaForm will interpolate `institutionId` into the endpoint
 * at submission time via the `buildEndpoint` helper.
 */

// Helper: build institution-scoped endpoint
export function buildFinanceEndpoint(institutionId: string | number, path: string): string {
  return `/api/v1/institutions/${institutionId}/finance/${path}`;
}

// 1. Fee Structure Item Creator
export const FeeItemConfig: FormSchemaConfig = {
  id: 'fee-item',
  title: 'Create Fee Item',
  description: 'Add a new billable item into the institution directory.',
  endpoint: '/api/v1/institutions/{institutionId}/finance/fee-categories/',
  zodSchema: z.object({
    code: z.string().min(2, "Code must be at least 2 characters").max(50, "Code too long"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    category_type: z.enum(['tuition', 'boarding', 'transport', 'examination', 'uniform', 'books', 'activity', 'ict', 'medical', 'other']),
    is_mandatory: z.boolean().optional(),
    description: z.string().optional(),
  }),
  fields: [
    { name: 'code', label: 'Fee Code', type: 'text', placeholder: 'e.g. TUI-001, UNEB-REG' },
    { name: 'name', label: 'Fee Item Name', type: 'text', placeholder: 'e.g. Tuition Fee, UNEB Registration' },
    { 
      name: 'category_type', 
      label: 'Category Type', 
      type: 'select', 
      options: [
        { label: 'Tuition', value: 'tuition' },
        { label: 'Boarding', value: 'boarding' },
        { label: 'Transport', value: 'transport' },
        { label: 'Examination', value: 'examination' },
        { label: 'Uniform & Kit', value: 'uniform' },
        { label: 'Books & Stationery', value: 'books' },
        { label: 'Co-curricular Activity', value: 'activity' },
        { label: 'ICT & Lab', value: 'ict' },
        { label: 'Medical', value: 'medical' },
        { label: 'Other', value: 'other' },
      ],
      placeholder: 'Select category type'
    },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional internal notes' }
  ]
};

// 2. Offline POS Receipt Form
export const OfflinePOSReceiptConfig: FormSchemaConfig = {
  id: 'offline-pos-receipt',
  title: 'Offline POS Receipt',
  description: 'Log a cash, cheque, or bank transfer payment received physically.',
  endpoint: '/api/v1/institutions/{institutionId}/finance/payments/',
  zodSchema: z.object({
    student: z.coerce.number().min(1, "Student is required"),
    amount: z.coerce.number().min(1, "Amount must be greater than zero").max(50000000, "Amount exceeds limits (50M max)"),
    payment_method: z.enum(['cash', 'mobile_money', 'bank_transfer', 'cheque']),
    reference: z.string().max(255, "Reference too long").optional(),
    payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format"),
  }),
  fields: [
    { name: 'student', label: 'Student Profile ID', type: 'number', placeholder: 'Enter student financial profile ID' },
    { name: 'amount', label: 'Amount Received (UGX)', type: 'number', placeholder: '0' },
    { 
      name: 'payment_method', 
      label: 'Payment Medium', 
      type: 'select', 
      options: [
        { label: 'Cash', value: 'cash' },
        { label: 'Mobile Money', value: 'mobile_money' },
        { label: 'Bank Transfer', value: 'bank_transfer' },
        { label: 'Cheque', value: 'cheque' },
      ]
    },
    { name: 'payment_date', label: 'Payment Date', type: 'date' },
    { name: 'reference', label: 'Slip / Reference Number', type: 'text', placeholder: 'e.g. TXN998244' }
  ]
};

// 3. Outward Expense Logging Form
export const ExpenseRecordConfig: FormSchemaConfig = {
  id: 'expense-record',
  title: 'Log Outward Expense',
  description: 'Record a journal entry for an expense incurred by the institution.',
  endpoint: '/api/v1/institutions/{institutionId}/finance/journal-entries/',
  zodSchema: z.object({
    description: z.string().min(5, "Please provide a valid description").max(1000, "Description exceeds 1000 characters"),
    entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format"),
    narration: z.string().min(2, "Payee name is required").max(255, "Narration too long"),
  }),
  fields: [
    { name: 'description', label: 'Expense Description', type: 'text', placeholder: 'e.g. Monthly water bill' },
    { name: 'narration', label: 'Payee / Vendor Name', type: 'text', placeholder: 'e.g. National Water Corp' },
    { name: 'entry_date', label: 'Date Incurred', type: 'date' },
  ]
};
