'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getFuelConsumptionInsights, type FuelConsumptionInsightsOutput } from '@/ai/flows/fuel-consumption-insights';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from './ui/skeleton';

import type { Trip } from '@/lib/types';

const formSchema = z.object({
  fuelEfficiency: z.coerce.number().min(1, 'Must be greater than 0').max(100, 'Must be 100 or less'),
});

type FuelInsightsFormProps = {
  tripHistory: Trip[];
};

export function FuelInsightsForm({ tripHistory }: FuelInsightsFormProps) {
  const [insights, setInsights] = useState<FuelConsumptionInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fuelEfficiency: 12,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setInsights(null);

    const tripDataForAI = tripHistory.map(trip => ({
        distance: trip.distance,
        idleTime: trip.idleTime / 60, // convert seconds to minutes
        averageSpeed: trip.points.length > 0 ? (trip.points.reduce((acc, p) => acc + (p.speed || 0), 0) / trip.points.length) : 0,
    }));

    try {
      const result = await getFuelConsumptionInsights({
        tripHistory: tripDataForAI,
        fuelEfficiency: values.fuelEfficiency,
      });
      setInsights(result);
    } catch (e: any) {
      setError('Failed to get insights. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  if (tripHistory.length === 0) {
    return (
        <Alert>
            <AlertTitle>No Trip Data</AlertTitle>
            <AlertDescription>You need at least one completed trip to get fuel insights.</AlertDescription>
        </Alert>
    );
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Fuel Consumption Insights</CardTitle>
            <CardDescription>
              Enter your car's fuel efficiency to get personalized insights on your driving habits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="fuelEfficiency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuel Efficiency (km/L)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Analyzing...' : 'Get Insights'}
            </Button>
          </CardFooter>
        </form>
      </Form>
      
      {isLoading && (
        <div className="p-6 pt-0 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
        </div>
      )}

      {error && (
        <div className="p-6 pt-0">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {insights && (
        <div className="p-6 pt-0">
          <Card className="bg-primary/5">
            <CardHeader>
                <CardTitle>Your Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-semibold">Estimated Fuel Consumption</h3>
                    <p className="text-2xl font-bold text-primary">{insights.estimatedFuelConsumption.toFixed(2)} Liters</p>
                </div>
                 <div>
                    <h3 className="font-semibold">Driving Style Insights</h3>
                    <p className="text-muted-foreground">{insights.drivingStyleInsights}</p>
                </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
}
