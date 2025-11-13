import type { ImagePart, CaptionAndHashtags, HookIdeas } from '../types';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

const callGenerateApi = async (body: object) => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("API Error Response:", errorBody);
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export const generateCaptionAndHashtags = async (
  topic: string,
  descriptionText?: string,
  productImage?: { file: File; base64: string },
  descriptionImage?: { file: File; base64: string },
  customRequest?: string
): Promise<CaptionAndHashtags> => {
  
  const productImagePart = productImage ? {
    mimeType: productImage.file.type,
    data: productImage.base64,
  } : undefined;

  const descriptionImagePart = descriptionImage ? {
    mimeType: descriptionImage.file.type,
    data: descriptionImage.base64,
  } : undefined;

  return callGenerateApi({
    type: 'caption',
    topic,
    descriptionText,
    productImage: productImagePart,
    descriptionImage: descriptionImagePart,
    customRequest,
  });
};


export const generateHookIdeas = async (
  audience: string,
  topic: string,
  hookDetails?: string,
): Promise<HookIdeas> => {
  return callGenerateApi({
    type: 'hook',
    audience,
    topic,
    hookDetails,
  });
};
