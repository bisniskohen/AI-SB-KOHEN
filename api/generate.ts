import { GoogleGenAI, Type } from "@google/genai";
import type { ImagePart, CaptionAndHashtags, HookIdeas } from '../types';

// This is a Vercel Edge Function
export const config = {
  runtime: 'edge',
};

// Ensure the API key is available
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const handleCaptionRequest = async (body: any): Promise<CaptionAndHashtags> => {
    const { topic, descriptionText, productImage, descriptionImage, customRequest } = body;
    const promptParts: ({ text: string } | ImagePart)[] = [];

    let promptText = `Buatkan sebuah caption media sosial yang menarik dan 10 tagar yang relevan untuk postingan tentang "${topic}". Caption harus menggunakan Bahasa Indonesia yang natural dan menyertakan emoji yang relevan (seperti ✅, ✨, 🚀, dll) untuk membuatnya lebih menarik secara visual.
  
PENTING:
- JANGAN sebutkan kata-kata seperti 'TikTok', 'Shopee', atau platform e-commerce/media sosial spesifik lainnya.
- JANGAN sebutkan 'harga' atau informasi sensitif terkait biaya.
- JANGAN membuat klaim yang berlebihan atau tidak terbukti (hindari over-claim). Fokus pada manfaat dan keunikan produk.
  `;

  if (descriptionText) {
    promptText += ` Deskripsi produknya adalah: "${descriptionText}".`;
  }
  
  if (customRequest) {
    promptText += `\n\nBerikut adalah permintaan khusus dari pengguna yang harus kamu ikuti: "${customRequest}".`;
  }

  if (productImage) {
    promptText += " Sebuah gambar produk juga disediakan sebagai konteks.";
    const imagePart: ImagePart = {
        inlineData: {
            mimeType: productImage.mimeType,
            data: productImage.data,
        },
    };
    promptParts.push(imagePart);
  }

  if (descriptionImage) {
    promptText += " Sebuah screenshot deskripsi produk juga disediakan sebagai konteks.";
     const imagePart: ImagePart = {
        inlineData: {
            mimeType: descriptionImage.mimeType,
            data: descriptionImage.data,
        },
    };
    promptParts.push(imagePart);
  }
  
  promptText += " Pastikan caption berhubungan langsung dengan gambar dan informasi yang diberikan.";
  promptParts.push({ text: promptText });
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: promptParts },
    config: {
        systemInstruction: "Anda adalah seorang ahli pemasaran media sosial yang kreatif dan profesional berbahasa Indonesia. Respons Anda harus dalam format JSON.",
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                caption: {
                    type: Type.STRING,
                    description: "Caption media sosial yang dihasilkan."
                },
                hashtags: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING
                    },
                    description: "Sebuah array berisi 10 tagar yang relevan."
                }
            },
            required: ["caption", "hashtags"]
        }
    }
  });

  const jsonString = response.text.trim();
  return JSON.parse(jsonString) as CaptionAndHashtags;
}

const handleHookRequest = async (body: any): Promise<HookIdeas> => {
    const { audience, topic, hookDetails } = body;

    let prompt = `Buatkan 10 ide hook pendek yang menarik perhatian untuk postingan media sosial dalam Bahasa Indonesia. Topiknya adalah "${topic}".`;

    if (audience && audience.trim()) {
      prompt += ` Target audiensnya adalah "${audience}".`;
    }

    prompt += ` Hook harus membuat penasaran dan mendorong orang untuk ingin tahu lebih lanjut. Hindari kata-kata seperti 'TikTok', 'Shopee', 'harga', dan jangan membuat klaim yang berlebihan.`;

    if (hookDetails) {
        prompt += `\n\nBerikut adalah detail tambahan dari pengguna untuk gaya hook yang diinginkan: "${hookDetails}".`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: "Anda adalah seorang ahli strategi pemasaran viral berbahasa Indonesia. Respons Anda harus dalam format JSON.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    hooks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING
                        },
                        description: "Sebuah array berisi 10 ide hook."
                    }
                },
                required: ["hooks"]
            }
        }
    });
    
    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as HookIdeas;
}


export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    let result;

    if (body.type === 'caption') {
      result = await handleCaptionRequest(body);
    } else if (body.type === 'hook') {
      result = await handleHookRequest(body);
    } else {
      return new Response(JSON.stringify({ error: 'Invalid request type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: 'Failed to generate content', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
