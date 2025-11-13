import { GoogleGenAI, Type } from "@google/genai";
import type { ImagePart, CaptionAndHashtags, HookIdeas } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = ai.models;

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const generateCaptionAndHashtags = async (
  topic: string,
  descriptionText?: string,
  productImage?: { file: File; base64: string },
  descriptionImage?: { file: File; base64: string },
  customRequest?: string
): Promise<CaptionAndHashtags> => {
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
            mimeType: productImage.file.type,
            data: productImage.base64,
        },
    };
    promptParts.push(imagePart);
  }

  if (descriptionImage) {
    promptText += " Sebuah screenshot deskripsi produk juga disediakan sebagai konteks.";
     const imagePart: ImagePart = {
        inlineData: {
            mimeType: descriptionImage.file.type,
            data: descriptionImage.base64,
        },
    };
    promptParts.push(imagePart);
  }
  
  promptText += " Pastikan caption berhubungan langsung dengan gambar dan informasi yang diberikan.";

  promptParts.push({ text: promptText });


  const response = await model.generateContent({
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
};


export const generateHookIdeas = async (
  audience: string,
  topic: string,
  hookDetails?: string,
): Promise<HookIdeas> => {
    let prompt = `Buatkan 10 ide hook pendek yang menarik perhatian untuk postingan media sosial dalam Bahasa Indonesia. Target audiensnya adalah "${audience}" dan topiknya adalah "${topic}". Hook harus membuat penasaran dan mendorong orang untuk ingin tahu lebih lanjut. Hindari kata-kata seperti 'TikTok', 'Shopee', 'harga', dan jangan membuat klaim yang berlebihan.`;

    if (hookDetails) {
        prompt += `\n\nBerikut adalah detail tambahan dari pengguna untuk gaya hook yang diinginkan: "${hookDetails}".`;
    }
  
  const response = await model.generateContent({
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
};