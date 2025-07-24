import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
  
});
// export const ai = genkit({
//   plugins: [googleAI()],
//   model: {
//     name: 'googleai/gemini-2.5-flash',
//     config: {
//       generationConfig: {
//         temperature: 0.7,   // controls randomness (range: 0.0–2.0)
//         topP: 0.9,          // nucleus sampling (range: 0.0–1.0)
//         topK: 40,           // limits number of highest-probability tokens
//         maxOutputTokens: 1024 // optional: sets response length
//       }
//     }
//   }
// });