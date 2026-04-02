import * as z from 'zod';
import { FormSchemaConfig } from '@/components/forms/DynamicSchemaForm';

// 1. Fee Structure Item Creator
export const FeeItemConfig: FormSchemaConfig = {
  id: 'fee-item',
  title: 'Create Fee Item',
  description: 'Add a new billable item into the institution directory.',
  endpoint: '/api/v1/finance/fee-items/',
  zodSchema: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    amount: z.number().min(0, "Amount must be a positive number"),
    frequency: z.enum(['one_time', 'per_term', 'annual']),
    description: z.string().optional(),
  }),
  fields: [
    { name: 'name', label: 'Fee Item Name', type: 'text', placeholder: 'e.g. Tuition Fee, UNEB Registration' },
    { name: 'amount', label: 'Amount (UGX)', type: 'number', placeholder: '0' },
    { 
      name: 'frequency', 
      label: 'Billing Frequency', 
      type: 'select', 
      options: [
        { label: 'One-Time', value: 'one_time' },
        { label: 'Per Term', value: 'per_term' },
        { label: 'Annual', value: 'annual' },
      ],
      placeholder: 'Select frequency'
    },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional internal notes' }
  ]
};

// 2. Offline POS Receipt Form
export const OfflinePOSReceiptConfig: FormSchemaConfig = {
  id: 'offline-pos-receipt',
  title: 'Offline POS Receipt',
  description: 'Log a cash, cheque, or bank transfer payment received physically.',
  endpoint: '/api/v1/finance/payments/',
  zodSchema: z.object({
    studentId: z.string().min(1, "Student is required").max(100, "Student ID too long"),
    amount: z.coerce.number().min(1, "Amount must be greater than zero").max(50000000, "Amount exceeds limits (50M max)"),
    paymentMethod: z.enum(['cash', 'mobile_money', 'bank_transfer', 'cheque']),
    reference: z.string().max(255, "Reference too long").optional(),
    paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format"),
  }),
  fields: [
    { name: 'studentId', label: 'Student ID', type: 'text', placeholder: 'Search student name or ID...' },
    { name: 'amount', label: 'Amount Received (UGX)', type: 'number', placeholder: '0' },
    { 
      name: 'paymentMethod', 
      label: 'Payment Medium', 
      type: 'select', 
      options: [
        { label: 'Cash', value: 'cash' },
        { label: 'Mobile Money', value: 'mobile_money' },
        { label: 'Bank Transfer', value: 'bank_transfer' },
        { label: 'Cheque', value: 'cheque' },
      ]
    },
    { name: 'paymentDate', label: 'Payment Date', type: 'date' },
    { name: 'reference', label: 'Slip / Reference Number', type: 'text', placeholder: 'e.g. TXN998244' }
  ]
};

// 3. Outward Expense Logging Form
export const ExpenseRecordConfig: FormSchemaConfig = {
  id: 'expense-record',
  title: 'Log Outward Expense',
  description: 'Record an expense incurred by the institution against the general ledger.',
  endpoint: '/api/v1/finance/expenses/',
  zodSchema: z.object({
    categoryId: z.string().min(1, "Category is required"),
    amount: z.coerce.number().min(1, "Amount must be greater than zero").max(100000000, "Amount exceeds practical limits"),
    payee: z.string().min(2, "Payee name is required").max(100, "Payee name too long"),
    description: z.string().min(5, "Please provide a valid description").max(1000, "Description exceeds 1000 characters"),
    dateIncurred: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format"),
  }),
  fields: [
    { name: 'categoryId', label: 'Expense Category', type: 'select', options: [
      { label: 'Utilities', value: 'cat1' },
      { label: 'Salaries', value: 'cat2' },
      { label: 'Supplies', value: 'cat3' },
      { label: 'Infrastructure', value: 'cat4' },
    ], placeholder: 'Select Expense Category' },
    { name: 'amount', label: 'Amount (UGX)', type: 'number', placeholder: '0' },
    { name: 'payee', label: 'Payee / Vendor Name', type: 'text', placeholder: 'e.g. National Water Corp' },
    { name: 'dateIncurred', label: 'Date', type: 'date' },
    { name: 'description', label: 'Justification / Description', type: 'textarea', placeholder: 'Monthly bore hole maintenance' }
  ]
};
