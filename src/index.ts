import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { streamText, tool } from 'ai'
import { z } from 'zod';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createClient } from '@supabase/supabase-js';


type Bindings = {
  SUPABASE_KEY: string,
  OPENAI_API_KEY: string,
  DB_URL: string,
  GEMINI_API_KEY:string,
  SUPABASE_URL: string,
  GATEWAY_URL:string
}


const app = new Hono<{ Bindings: Bindings }>()
app.use('/*', cors())

app.post('/items', async (c) => {
  
  const google = createGoogleGenerativeAI({
    apiKey:c.env.GEMINI_API_KEY,
    baseURL:c.env.GATEWAY_URL,
  });
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
  const { id, messages } = await c.req.json()


  const result = streamText({
    model: google('gemini-2.0-flash-lite'),
    maxSteps:5,
    system:`
     - you help users find products they want to rent!
        - keep your responses limited to a sentence.
        - DO NOT output lists.
        - make use of the tools to search for products.
        - today's date is ${new Date().toLocaleDateString()}.
        - ask for any details you don't know - make sure you have the product category, date range or time period the user is looking to rent the product before searching.
        - ask follow up questions to nudge user into the optimal flow
        - confirm the exact date range if the input is vague like 'next weekend' or 'next two days', always present your assumptions to the user first.
        - make the user select the duration again if the start date is before ${new Date().toLocaleDateString()}.
        - after every tool call, pretend you're showing the result to the user and keep your response limited to a phrase.

        - here's the optimal flow
          - ask for the product category
          - ask for the date range or duration, present your assumptions if the input is vague
          - search for the product
          - assume the same date range for the rental period for subsequent searches unless the user specifies otherwise
    `,

    messages,
    onError: (e) => { console.log(e) },

    tools: {
     searchItems: tool({
        description: "Tool that searches for products based on user input.",
        parameters: z.object({
          query: z.string().describe('Postgres full text search compatible search query, from users natural language input.'),
          start_date: z.string().describe('Start date for the rental period.'),
          end_date: z.string().describe('End date for the rental period.'),
        },
      
      ),
      execute: async ({ query, start_date, end_date }) => {
        const { data, error } = await supabase.rpc('available_items', {
          start_date,
          end_date,
          search_query:query,
        });
        return data;
      }
    
    }),

     
      
    },
  });


  return result.toDataStreamResponse({})

})

export default app


