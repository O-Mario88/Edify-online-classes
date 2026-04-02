import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

export type FieldConfig = {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';
  options?: { label: string; value: string }[];
  placeholder?: string;
  description?: string;
};

export type FormSchemaConfig = {
  id: string;
  title: string;
  description: string;
  fields: FieldConfig[];
  zodSchema: z.ZodObject<any>;
  endpoint: string;
};

interface DynamicSchemaFormProps {
  config: FormSchemaConfig;
  onSubmitSuccess?: (data: any) => void;
}

export function DynamicSchemaForm({ config, onSubmitSuccess }: DynamicSchemaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(config.zodSchema),
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Stub submission for MVP - this would use the apiClient
      console.log('Would dispatch to:', config.endpoint, 'Payload:', data);
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 600));
      
      reset();
      if (onSubmitSuccess) {
        onSubmitSuccess(data);
      }
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-slate-50/50 border-b">
        <CardTitle>{config.title}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.fields.map((field) => (
              <div key={field.name} className={`space-y-2 ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                <label className="text-sm font-medium text-slate-700">{field.label}</label>
                
                {field.type === 'text' || field.type === 'number' || field.type === 'date' ? (
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    {...register(field.name, { valueAsNumber: field.type === 'number' })}
                    className={errors[field.name] ? 'border-red-500' : ''}
                  />
                ) : field.type === 'select' ? (
                  <Controller
                    control={control}
                    name={field.name}
                    render={({ field: { onChange, value } }) => (
                      <Select onValueChange={onChange} defaultValue={value}>
                        <SelectTrigger className={errors[field.name] ? 'border-red-500' : ''}>
                          <SelectValue placeholder={field.placeholder || "Select an option"} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : field.type === 'checkbox' ? (
                  <div className="flex items-center space-x-2 pt-2">
                    <Controller
                      control={control}
                      name={field.name}
                      render={({ field: { onChange, value } }) => (
                        <Checkbox checked={value} onCheckedChange={onChange} />
                      )}
                    />
                    <span className="text-sm text-slate-500">{field.description}</span>
                  </div>
                ) : field.type === 'textarea' ? (
                  <textarea
                    placeholder={field.placeholder}
                    {...register(field.name)}
                    className={`flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${errors[field.name] ? 'border-red-500' : ''}`}
                  />
                ) : null}
                
                {errors[field.name] && (
                  <p className="text-xs text-red-500 mt-1">{errors[field.name]?.message as string}</p>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t flex justify-end">
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Record'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
