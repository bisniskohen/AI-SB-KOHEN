import React, { useState, useCallback } from 'react';
import { generateCaptionAndHashtags, fileToBase64 } from '../services/geminiService';
import type { CaptionAndHashtags } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Spinner } from './ui/Spinner';
import { SparklesIcon } from './ui/icons/SparklesIcon';

const CaptionGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [productPhoto, setProductPhoto] = useState<{ file: File; base64: string; preview: string } | null>(null);
  const [descriptionPhoto, setDescriptionPhoto] = useState<{ file: File; base64: string; preview: string } | null>(null);
  const [descriptionType, setDescriptionType] = useState<'text' | 'image'>('text');
  const [customRequest, setCustomRequest] = useState('');
  
  const [result, setResult] = useState<CaptionAndHashtags | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'caption' | 'hashtags' | 'all' | null>(null);
  const [copiedTag, setCopiedTag] = useState<number | null>(null);

  const handleProductPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await fileToBase64(file);
        const preview = URL.createObjectURL(file);
        setProductPhoto({ file, base64, preview });
      } catch (err) {
        setError('Gagal memproses file gambar produk.');
        console.error(err);
      }
    }
  };
  
  const handleDescriptionPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await fileToBase64(file);
        const preview = URL.createObjectURL(file);
        setDescriptionPhoto({ file, base64, preview });
        setDescriptionText(''); // Kosongkan deskripsi teks jika gambar diunggah
      } catch (err) {
        setError('Gagal memproses file gambar deskripsi.');
        console.error(err);
      }
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Harap masukkan topik.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const generatedResult = await generateCaptionAndHashtags(
          topic, 
          descriptionType === 'text' ? descriptionText : undefined,
          productPhoto ?? undefined,
          descriptionType === 'image' ? descriptionPhoto ?? undefined : undefined,
          customRequest
      );
      setResult(generatedResult);
    } catch (err) {
      setError('Gagal membuat konten. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [topic, descriptionText, productPhoto, descriptionPhoto, descriptionType, customRequest]);

  const copyToClipboard = (text: string, type: 'caption' | 'hashtags') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setCopiedTag(null);
    setTimeout(() => {
        setCopied(null);
    }, 2000);
  };

  const copyTagToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedTag(index);
    setCopied(null);
    setTimeout(() => {
        setCopiedTag(null);
    }, 2000);
  };

  const handleCopyAll = () => {
    if (!result) return;
    const allContent = `${result.caption}\n\n${result.hashtags.join(' ')}`;
    navigator.clipboard.writeText(allContent);
    setCopied('all');
    setCopiedTag(null);
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };
  
  const tabClasses = (isActive: boolean) => 
    `px-4 py-2 text-sm font-medium transition-colors rounded-t-md focus:outline-none ${
      isActive
        ? 'border-b-2 border-indigo-400 text-white'
        : 'text-gray-400 hover:text-white'
    }`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <SparklesIcon className="w-6 h-6 text-indigo-400" />
          Buat Postingan Anda
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-1">Topik / Kata Kunci *</label>
            <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="contoh: Promo skincare" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label htmlFor="photo" className="block text-sm font-medium text-gray-300 mb-1">Foto Produk (Opsional)</label>
              <Input id="photo" type="file" accept="image/*" onChange={handleProductPhotoChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            </div>
            {productPhoto && (
              <div className="mt-2 sm:mt-0">
                <img src={productPhoto.preview} alt="Pratinjau produk" className="w-24 h-24 rounded-lg object-cover mx-auto" />
              </div>
            )}
          </div>
          
           <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Deskripsi Produk (Opsional)</label>
            <div className="flex border-b border-gray-600 mb-4">
              <button type="button" onClick={() => setDescriptionType('text')} className={tabClasses(descriptionType === 'text')}>Teks</button>
              <button type="button" onClick={() => setDescriptionType('image')} className={tabClasses(descriptionType === 'image')}>Screenshot</button>
            </div>
            {descriptionType === 'text' ? (
              <Textarea id="description" value={descriptionText} onChange={(e) => { setDescriptionText(e.target.value); setDescriptionPhoto(null); }} placeholder="contoh: Facial mist menyegarkan dengan ekstrak lidah buaya..." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <Input id="description_photo" type="file" accept="image/*" onChange={handleDescriptionPhotoChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                </div>
                {descriptionPhoto && (
                  <div className="mt-2 sm:mt-0">
                    <img src={descriptionPhoto.preview} alt="Pratinjau deskripsi" className="w-24 h-24 rounded-lg object-cover mx-auto" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="customRequest" className="block text-sm font-medium text-gray-300 mb-1">Permintaan Khusus (Opsional)</label>
            <Textarea 
              id="customRequest" 
              value={customRequest} 
              onChange={(e) => setCustomRequest(e.target.value)} 
              placeholder="contoh: Gunakan gaya bahasa yang ceria dan jenaka, targetkan untuk Gen Z."
              rows={2}
            />
          </div>
          
          {error && <p className="text-red-400 text-sm">{error}</p>}
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <><Spinner /> Membuat...</> : 'Gass Buatkan'}
          </Button>
        </form>
      </Card>
      
      <Card>
        <h2 className="text-2xl font-bold mb-4">Konten yang Dihasilkan</h2>
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
            <Spinner className="w-8 h-8"/>
            <p className="mt-4 text-gray-400">AI sedang berpikir...</p>
          </div>
        )}
        {result && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-indigo-400 mb-2">Caption</h3>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-300 whitespace-pre-wrap">{result.caption}</p>
                <Button onClick={() => copyToClipboard(result.caption, 'caption')} size="sm" variant="ghost" className="mt-2">
                  {copied === 'caption' ? 'Disalin!' : 'Salin Caption'}
                </Button>
              </div>
            </div>

            <Button onClick={handleCopyAll} variant="primary" className="w-full">
              {copied === 'all' ? 'Disalin!' : 'Salin Caption & Semua Tagar'}
            </Button>
            
            <div>
              <h3 className="text-lg font-semibold text-indigo-400 mb-2">Tagar</h3>
              <div className="flex flex-wrap gap-2">
                {result.hashtags.map((tag, i) => (
                  <span key={i} className="bg-gray-700 text-indigo-300 px-3 py-1 rounded-full text-sm cursor-pointer" onClick={() => copyTagToClipboard(tag, i)}>{copiedTag === i ? 'Disalin!' : tag}</span>
                ))}
              </div>
               <Button onClick={() => copyToClipboard(result.hashtags.join(' '), 'hashtags')} size="sm" variant="ghost" className="mt-4">
                 {copied === 'hashtags' ? 'Disalin!' : 'Salin Semua Tagar'}
               </Button>
            </div>
          </div>
        )}
        {!isLoading && !result && (
          <div className="flex items-center justify-center h-full min-h-[300px] text-gray-500">
            Konten yang Anda hasilkan akan muncul di sini.
          </div>
        )}
      </Card>
    </div>
  );
};

export default CaptionGenerator;