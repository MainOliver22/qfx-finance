'use server';
/**
 * @fileOverview AI Financial Advisor Flow for QFX Finance.
 * Generates personalized investment advice based on user portfolio.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdvisorInputSchema = z.object({
  fiatBalance: z.number(),
  cryptoValue: z.number(),
  activeBots: z.number(),
  riskProfile: z.string(),
});

const AdvisorOutputSchema = z.object({
  summary: z.string().describe('A brief executive summary of the portfolio health.'),
  recommendations: z.array(z.string()).describe('List of 3 specific actionable steps.'),
  riskAssessment: z.string().describe('Analysis of the current risk exposure.'),
});

export type AdvisorInput = z.infer<typeof AdvisorInputSchema>;
export type AdvisorOutput = z.infer<typeof AdvisorOutputSchema>;

const advisorPrompt = ai.definePrompt({
  name: 'financialAdvisorPrompt',
  input: { schema: AdvisorInputSchema },
  output: { schema: AdvisorOutputSchema },
  prompt: `You are a high-end institutional financial advisor for QFX Finance.
Analyze the following portfolio data and provide professional, conservative, and high-yield strategic advice.

Portfolio Data:
- Total Fiat Liquidity: \${{{fiatBalance}}}
- Total Digital Asset Value: \${{{cryptoValue}}}
- Active Trading Bots: {{{activeBots}}}
- Stated Risk Profile: {{{riskProfile}}}

Provide an executive summary, exactly 3 actionable recommendations, and a risk assessment. 
Maintain a tone that is confident, professional, and institutional.`,
});

export async function getFinancialAdvice(input: AdvisorInput): Promise<AdvisorOutput> {
  const { output } = await advisorPrompt(input);
  if (!output) throw new Error('Failed to generate advice');
  return output;
}
