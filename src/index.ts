import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { streamText, tool } from 'ai'
import { z } from 'zod';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';


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
type IntentMeta={
  data:{
    intent:'RESERVE'|`GENERATE_PAYMENT_LINK`,
    id:string,
  }
}
app.post('/items', async (c) => {
  
  const google = createGoogleGenerativeAI({
    apiKey:c.env.GEMINI_API_KEY,
    baseURL:c.env.GATEWAY_URL,
  });
  const supabase = createClient<Database>(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
  const { id, messages,data }:{id:string,messages:any[],data?:IntentMeta} = await c.req.json()


  const result = streamText({
    model: google('gemini-2.0-flash-lite'),
    maxSteps:5,
    system:`
     - you help users find products they want to rent and reserve for a specific time period!
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
          - Once the user has selected a product to reserve, generate the payment link.

    `,

    messages,
    onError: (e) => { console.log(e) },

    tools: {
      generatePaymentLink: tool({
        description: "Tool that generates a payment link for the user to pay for the reservation.",
        parameters: z.object({
          id: z.string().describe('ID of the item to be reserved.'),
          startDate: z.string().describe('Start date for the rental period as provided by the user previously.'),
          endDate: z.string().describe('End date for the rental period, provided by the user previously.'),
          duration: z.number().describe('Duration of the rental period in days, based on duration or dates provided by th user previously.'),
        
        }),
        execute:async({ startDate,endDate,id ,duration}) => {
          const { data, error } = await supabase
            .from('items')
            .select()
            .eq('id', id);

          if (error) {
            console.error(error);
            throw new Error('Error generating payment link');
          }
          let resp={
            link:`https://example.com/payment/${id}?amount=${data[0].price_per_day * duration}`,
            startDate,endDate,
            item:data[0]
          };
          console.log(resp);
          return resp
        }
      }),
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


