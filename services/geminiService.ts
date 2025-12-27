
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Chat } from "@google/genai";
import type { MutableRefObject } from 'react';
import type { MealPlan, MamaMatch } from '../types';

const systemInstruction = `You are 'Bloom,' an AI companion and expert guide for pregnant women and new mothers. Your knowledge covers all aspects of pregnancy, childbirth, and early motherhood, with a strong emphasis on medical accuracy and safety. Always provide empathetic, clear, and supportive information. **Crucially, for any medical question, you must strongly advise the user to consult with a healthcare professional and state that your advice is not a substitute for professional medical care.** Your tone should be warm, reassuring, and knowledgeable.`;

const getChat = (chatRef: MutableRefObject<Chat | null>) => {
  if (!chatRef.current) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatRef.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstruction,
      },
    });
  }
  return chatRef.current;
};

export const getAIChatResponseStream = async (
  prompt: string,
  chatRef: MutableRefObject<Chat | null>
) => {
  const chat = getChat(chatRef);
  const result = await chat.sendMessageStream({ message: prompt });
  return result;
};

export interface PregnancyUpdate {
  babySize: string;
  babyDevelopment: string;
  momSymptoms: string;
}

export const getPregnancyUpdate = async (week: number): Promise<PregnancyUpdate> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide summary for week ${week} of pregnancy. Include a fruit size comparison.`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    babySize: { type: Type.STRING },
                    babyDevelopment: { type: Type.STRING },
                    momSymptoms: { type: Type.STRING }
                },
                required: ["babySize", "babyDevelopment", "momSymptoms"]
            }
        }
    });
    const jsonText = response.text?.trim() || '{}';
    return JSON.parse(jsonText);
};

export const findMamaMatches = async (userWeek: number, interests: string[]): Promise<MamaMatch[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `I am at week ${userWeek} of pregnancy and my interests are ${interests.join(', ')}. Create 2 fictional "Mama-Matches" for me. For each, give a username, a compatibility percentage, and a 1-sentence reason why we match.`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        username: { type: Type.STRING },
                        compatibility: { type: Type.NUMBER },
                        reason: { type: Type.STRING },
                        avatarUrl: { type: Type.STRING }
                    },
                    required: ["username", "compatibility", "reason"]
                }
            }
        }
    });
    const matches = JSON.parse(response.text || '[]');
    return matches.map((m: any, i: number) => ({
      ...m,
      avatarUrl: `https://picsum.photos/seed/match${i}/64/64`
    }));
};

export const getCommunityPulse = async (posts: string[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Summarize the current sentiment and top 2 advice points from these community posts in exactly 2 short sentences: ${posts.join(' | ')}`,
    });
    return response.text || "The community is quiet today, but full of support!";
};

export const generateBabyArt = async (sizeDescription: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `A magical, high-quality watercolor digital art piece showing a baby that is the size of a ${sizeDescription}. Soft lighting, whimsical atmosphere, cinematic.` }]
    },
    config: {
      imageConfig: { aspectRatio: "1:1" }
    }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part?.inlineData ? `data:image/png;base64,${part.inlineData.data}` : null;
};

export const generateMealPlan = async (trimester: number): Promise<MealPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a healthy, delicious 3-day meal plan for the ${trimester} trimester. Focus on essential nutrients.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          day1: { type: Type.ARRAY, items: { type: Type.STRING } },
          day2: { type: Type.ARRAY, items: { type: Type.STRING } },
          day3: { type: Type.ARRAY, items: { type: Type.STRING } },
          tips: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateMeditationAudio = async (mood: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text: `Speak in a calm, soothing voice: Take a deep breath. Focus on your baby. You are doing a wonderful job. This meditation is specifically for your ${mood} mood today. Relax your shoulders...` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
      }
    }
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
};

export const findNearbyHealthcare = async (query: string, lat: number, lng: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Find high-rated ${query} near my location.`,
    config: { tools: [{ googleMaps: {} }], toolConfig: { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } } }
  });
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return {
    text: response.text,
    providers: chunks.filter((c: any) => c.maps).map((c: any) => ({ title: c.maps.title, uri: c.maps.uri }))
  };
};

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
