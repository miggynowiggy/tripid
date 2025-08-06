'use server';

/**
 * @fileOverview Provides fuel consumption insights based on trip history.
 *
 * - `getFuelConsumptionInsights` - Analyzes trip data to estimate fuel consumption.
 * - `FuelConsumptionInsightsInput` - The input type for the `getFuelConsumptionInsights` function.
 * - `FuelConsumptionInsightsOutput` - The return type for the `getFuelConsumptionInsights` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TripDataSchema = z.object({
  distance: z.number().describe('The distance traveled in kilometers.'),
  idleTime: z.number().describe('The idle time in minutes.'),
  averageSpeed: z.number().describe('The average speed in kilometers per hour.'),
});

const FuelConsumptionInsightsInputSchema = z.object({
  tripHistory: z.array(TripDataSchema).describe('An array of trip data objects.'),
  fuelEfficiency: z.number().describe('The fuel efficiency of the car in kilometers per liter.'),
});
export type FuelConsumptionInsightsInput = z.infer<typeof FuelConsumptionInsightsInputSchema>;

const FuelConsumptionInsightsOutputSchema = z.object({
  estimatedFuelConsumption: z
    .number()
    .describe('The estimated total fuel consumption for all trips in liters.'),
  drivingStyleInsights: z
    .string()
    .describe('Insights into the user driving style and its impact on fuel consumption.'),
});
export type FuelConsumptionInsightsOutput = z.infer<typeof FuelConsumptionInsightsOutputSchema>;

export async function getFuelConsumptionInsights(
  input: FuelConsumptionInsightsInput
): Promise<FuelConsumptionInsightsOutput> {
  return fuelConsumptionInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fuelConsumptionInsightsPrompt',
  input: {schema: FuelConsumptionInsightsInputSchema},
  output: {schema: FuelConsumptionInsightsOutputSchema},
  prompt: `You are an expert in analyzing car trip data and providing fuel consumption insights.

  Analyze the following trip history and estimate the total fuel consumption.
  Also, provide insights into the user's driving style and its impact on fuel consumption, 
  considering factors like idle time and average speed.  The fuel efficiency of the car is {{fuelEfficiency}} kilometers per liter.

  Trip History:
  {{#each tripHistory}}
  - Distance: {{distance}} km, Idle Time: {{idleTime}} minutes, Average Speed: {{averageSpeed}} km/h
  {{/each}}

  Based on this data, provide the estimated total fuel consumption in liters and driving style insights.
  Ensure the output is concise and easy to understand.
  `,
});

const fuelConsumptionInsightsFlow = ai.defineFlow(
  {
    name: 'fuelConsumptionInsightsFlow',
    inputSchema: FuelConsumptionInsightsInputSchema,
    outputSchema: FuelConsumptionInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
