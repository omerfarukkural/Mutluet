import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export function HappinessCreate() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('happiness_events')
        .insert({ title, description });

      if (error) throw error;

      setTitle('');
      setDescription('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Hata:', error);
      alert('Kayıt eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Mutluluk Kaydı Ekle 😊</h2>
      
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
          ✅ Mutluluk kaydınız başarıyla eklendi!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Başlık *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Bugün ne oldu?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Açıklama
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Detayları paylaşmak ister misin?"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </form>
    </Card>
  );
}
