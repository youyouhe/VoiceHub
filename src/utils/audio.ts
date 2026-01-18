export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64 || result);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64 || result);
    };
    reader.onerror = () => reject(new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });
}

export function base64ToBlobUrl(base64Data: string): string {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

export function base64ToAudioBuffer(base64Data: string, audioContext: AudioContext): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    
    audioContext.decodeAudioData(byteArray.buffer, resolve, (error) => {
      reject(new Error('Failed to decode audio data'));
    });
  });
}

export function formatAudioDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024;
  const allowedTypes = ['audio/wav', 'audio/wave', 'audio/x-wav', 'audio/mp3', 'audio/mpeg'];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }
  
  const isAudio = allowedTypes.some(type => file.type.includes(type) || file.name.toLowerCase().endsWith('.wav') || file.name.toLowerCase().endsWith('.mp3'));
  if (!isAudio) {
    return { valid: false, error: 'Only WAV and MP3 formats are supported' };
  }
  
  return { valid: true };
}

export async function playAudio(blobUrl: string): Promise<HTMLAudioElement> {
  const audio = new Audio(blobUrl);
  await audio.play();
  return audio;
}

export function stopAudio(audio: HTMLAudioElement): void {
  audio.pause();
  audio.currentTime = 0;
}
