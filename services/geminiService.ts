
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { ServiceCategory, Message, FileAttachment } from "../types";

const getSystemInstruction = (category: ServiceCategory): string => {
  switch (category) {
    case ServiceCategory.PROGRAMMING:
      return "You are an expert Senior Software Engineer. Provide clean, efficient, and well-documented code.";
    case ServiceCategory.DESIGN:
      return "You are a world-class Creative Director and UI/UX Designer. You can generate images and edit them.";
    case ServiceCategory.VIDEO:
      return "You are a professional Video Editor and Cinematographer. You can generate videos and animate images.";
    case ServiceCategory.ANALYSIS:
      return "You are a Lead Data Analyst. Be precise, analytical, and data-driven. Look for patterns and insights.";
    case ServiceCategory.WEB_DATA:
      return "You are an expert Full-Stack Developer and Data Scientist. You specialize in building responsive websites, interactive dashboards, and insightful data presentations.";
    case ServiceCategory.MODELING_3D:
      return "You are a professional 3D Artist. You specialize in 3D modeling, texturing, rendering, and spatial design concepts.";
    case ServiceCategory.TEXT:
    default:
      return "You are a professional Editor and Content Strategist. Focus on clarity, tone, and engagement.";
  }
};

export const generateSpeech = async (apiKey: string, text: string): Promise<{ audioUrl: string, mimeType: string }> => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: { parts: [{ text }] },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    return {
      audioUrl: `data:audio/mp3;base64,${base64Audio}`, 
      mimeType: 'audio/pcm' 
    };
  }
  throw new Error("No audio generated");
};

const generateImage = async (ai: GoogleGenAI, prompt: string, aspectRatio: string = '1:1'): Promise<{ text: string, media?: { type: 'image', url: string, mimeType: string } }> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio as any,
        outputMimeType: 'image/jpeg'
      }
    });

    const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64Image) {
      return {
        text: `I've generated an image for you with aspect ratio ${aspectRatio}.`,
        media: {
          type: 'image',
          url: `data:image/jpeg;base64,${base64Image}`,
          mimeType: 'image/jpeg'
        }
      };
    }
    throw new Error("No image data returned");
  } catch (error: any) {
    return { text: `Image generation failed: ${error.message}` };
  }
};

const editImage = async (ai: GoogleGenAI, prompt: string, base64Image: string, mimeType: string): Promise<{ text: string, media?: { type: 'image', url: string, mimeType: string } }> => {
  try {
    const cleanData = base64Image.split(',')[1] || base64Image;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanData,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates![0].content.parts) {
      if (part.inlineData) {
        return {
          text: "Here is the edited version of your image.",
          media: {
            type: 'image',
            url: `data:image/png;base64,${part.inlineData.data}`,
            mimeType: 'image/png'
          }
        };
      }
    }
    throw new Error("No edited image returned");
  } catch (error: any) {
    return { text: `Image editing failed: ${error.message}` };
  }
};

const generateVideo = async (ai: GoogleGenAI, apiKey: string, prompt: string, image?: FileAttachment): Promise<{ text: string, media?: { type: 'video', url: string, mimeType: string } }> => {
  try {
    const model = 'veo-3.1-fast-generate-preview';
    let operation;
    
    if (image) {
      const cleanData = image.data.split(',')[1] || image.data;
      operation = await ai.models.generateVideos({
        model,
        prompt: prompt || "Animate this image", 
        image: {
          imageBytes: cleanData,
          mimeType: image.type
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });
    } else {
      operation = await ai.models.generateVideos({
        model,
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });
    }

    let attempts = 0;
    while (!operation.done && attempts < 60) { 
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
      attempts++;
    }

    if (!operation.done) return { text: "Video generation timed out." };

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (videoUri) {
      const videoResponse = await fetch(`${videoUri}&key=${apiKey}`);
      const videoBlob = await videoResponse.blob();
      return {
        text: image ? "I've animated your image." : "I've generated a video.",
        media: {
          type: 'video',
          url: URL.createObjectURL(videoBlob),
          mimeType: 'video/mp4'
        }
      };
    }
    throw new Error("No video URI");
  } catch (error: any) {
    return { text: `Video generation failed: ${error.message}` };
  }
};

export const generateAIResponse = async (
  apiKey: string,
  history: Message[],
  newMessage: string,
  category: ServiceCategory,
  attachments: FileAttachment[] = [],
  options: { thinkingMode?: boolean, aspectRatio?: string } = {},
  onStreamUpdate?: (text: string) => void
): Promise<{ text: string, media?: { type: 'image' | 'video', url: string, mimeType: string }, groundingMetadata?: any }> => {
  try {
    if (!apiKey) throw new Error("API Key is required");
    const ai = new GoogleGenAI({ apiKey });
    const lowerMsg = newMessage.toLowerCase();

    // --- Special Handlers (Images/Videos) do NOT stream ---
    if (category === ServiceCategory.DESIGN) {
      const isImageGen = lowerMsg.match(/\b(draw|generate|create)\b.*\b(image|logo|icon|picture)\b/);
      const isEdit = lowerMsg.match(/\b(edit|change|remove|add)\b/);
      const hasImage = attachments.find(a => a.type.startsWith('image/'));

      if (hasImage && isEdit) return await editImage(ai, newMessage, hasImage.data, hasImage.type);
      if (isImageGen && !hasImage) return await generateImage(ai, newMessage, options.aspectRatio || '1:1');
    }

    if (category === ServiceCategory.VIDEO) {
      const isVideoGen = lowerMsg.match(/\b(animate|generate|create)\b.*\b(video|animation)\b/);
      const hasImage = attachments.find(a => a.type.startsWith('image/'));
      if (isVideoGen) return await generateVideo(ai, apiKey, newMessage, hasImage);
    }

    // --- Standard Text/Chat Generation (WITH STREAMING) ---
    
    let modelId = 'gemini-2.5-flash';
    const config: any = {
      systemInstruction: getSystemInstruction(category),
    };

    if (options.thinkingMode) {
      modelId = 'gemini-3-pro-preview';
      config.thinkingConfig = { thinkingBudget: 1024 };
    } else if (category === ServiceCategory.ANALYSIS || category === ServiceCategory.WEB_DATA || lowerMsg.includes('search') || lowerMsg.includes('map')) {
      const tools: any[] = [];
      if (lowerMsg.includes('map') || lowerMsg.includes('location')) tools.push({ googleMaps: {} });
      else tools.push({ googleSearch: {} });
      config.tools = tools;
      modelId = 'gemini-2.5-flash';
    } else if (category === ServiceCategory.TEXT && lowerMsg.length < 20) {
      modelId = 'gemini-2.5-flash-lite-latest';
    } else if (attachments.some(a => a.type.startsWith('video/'))) {
        modelId = 'gemini-3-pro-preview';
    }

    const parts: any[] = [{ text: newMessage }];
    attachments.forEach(att => {
      const cleanBase64 = att.data.split(',')[1] || att.data;
      parts.push({
        inlineData: {
          mimeType: att.type,
          data: cleanBase64
        }
      });
    });

    // History construction
    const contentPayload: any[] = [];
    const recentHistory = history.slice(-6); 
    // Note: Real chat apps pass proper history array. Simplifying here for direct content passing due to complex type alignment in this snippet
    let contextPrompt = "";
    if (recentHistory.length > 0) {
       contextPrompt = "History:\n" + recentHistory.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n') + "\n---\nRequest:\n";
    }
    const finalParts = contextPrompt ? [{ text: contextPrompt }, ...parts] : parts;

    // STREAMING EXECUTION
    if (onStreamUpdate) {
        const resultStream = await ai.models.generateContentStream({
            model: modelId,
            contents: { role: 'user', parts: finalParts as any },
            config: config
        });

        let fullText = '';
        let finalGrounding = null;

        for await (const chunk of resultStream) {
            const c = chunk as GenerateContentResponse;
            const text = c.text;
            if (text) {
                fullText += text;
                onStreamUpdate(fullText);
            }
            if (c.candidates?.[0]?.groundingMetadata) {
                finalGrounding = c.candidates[0].groundingMetadata;
            }
        }
        return { text: fullText, groundingMetadata: finalGrounding };

    } else {
        // Fallback non-streaming
        const result = await ai.models.generateContent({
            model: modelId,
            contents: { role: 'user', parts: finalParts as any },
            config: config
        });
        return { 
            text: result.text || "No response generated.",
            groundingMetadata: result.candidates?.[0]?.groundingMetadata
        };
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error; 
  }
};

export const getPoolEstimate = async (
  apiKey: string,
  title: string,
  description: string,
  category: ServiceCategory
): Promise<string> => {
    if (!apiKey) throw new Error("API Key required");
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Estimate price and scope for: ${category} Task. Title: ${title}. Desc: ${description}. Format: "Estimate: $X-$Y. Scope: ..."`
    });
    return result.text || "Estimate unavailable.";
};
