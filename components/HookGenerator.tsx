import React, { useState, useCallback } from 'react';
import { generateHookIdeas } from '../services/geminiService';
import type { HookIdeas } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Spinner } from './ui/Spinner';
import { LightbulbIcon } from './ui/icons/LightbulbIcon';
import { Textarea } from './ui/Textarea';

const HookGenerator: React.FC = () => {
  const [audience, setAudience] = useState('');
  const [topic, setTopic] = useState('');
  const [hookDetails, setHookDetails] = useState('');
  const [result, setResult] = useState<HookIdeas | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedHook, setCopiedHook] = useState<number | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Harap isi kolom produk / topik.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const generatedResult = await generateHookIdeas(audience, topic, hookDetails);
      setResult(generatedResult);
    } catch (err) {
      setError('Gagal membuat hook. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [audience, topic, hookDetails]);
  
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedHook(index);
    setTimeout(() => {
        setCopiedHook(null);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <LightbulbIcon className="w-6 h-6 text-indigo-400" />
          Buat Ide Hook
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="audience" className="block text-sm font-medium text-gray-300 mb-1">Target Audiens (Opsional)</label>
            <Input id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="contoh: Profesional muda, ibu rumah tangga" />
          </div>
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-1">Produk / Topik *</label>
            <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="contoh: Aplikasi produktivitas hemat waktu" required />
          </div>
           <div>
            <label htmlFor="hookDetails" className="block text-sm font-medium text-gray-300 mb-1">Detail Hook (Opsional)</label>
            <Textarea 
              id="hookDetails" 
              value={hookDetails} 
              onChange={(e) => setHookDetails(e.target.value)} 
              placeholder="contoh: Hook harus dimulai dengan pertanyaan, gunakan emoji, gaya bahasa santai."
              rows={2}
            />
          </div>
          
          {error && <p className="text-red-400 text-sm">{error}</p>}
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <><Spinner /> Mencari ide...</> : 'Gass Cari Ide'}
          </Button>
        </form>
      </Card>
      
      <Card>
        <h2 className="text-2xl font-bold mb-4">10 Ide Hook yang Dihasilkan</h2>
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
            <Spinner className="w-8 h-8"/>
            <p className="mt-4 text-gray-400">Mencari inspirasi...</p>
          </div>
        )}
        {result && (
          <ul className="space-y-3">
            {result.hooks.map((hook, i) => (
              <li key={i} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center group">
                <p className="text-gray-300"><span className="font-semibold text-indigo-400 mr-2">{i + 1}.</span>"{hook}"</p>
                <Button onClick={() => copyToClipboard(hook, i)} size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity min-w-[65px]">
                  {copiedHook === i ? 'Disalin!' : 'Salin'}
                </Button>
              </li>
            ))}
          </ul>
        )}
        {!isLoading && !result && (
          <div className="flex items-center justify-center h-full min-h-[300px] text-gray-500">
            Ide hook yang Anda hasilkan akan muncul di sini.
          </div>
        )}
      </Card>
    </div>
  );
};

export default HookGenerator;