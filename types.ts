
export interface CaptionAndHashtags {
  caption: string;
  hashtags: string[];
}

export interface HookIdeas {
  hooks: string[];
}

export interface ImagePart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}
