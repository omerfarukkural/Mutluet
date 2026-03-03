import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Card } from '../ui/card';

interface HappinessEvent {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

export function HappinessList() {
  const [events, setEvents] = useState<HappinessEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('happiness_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Kayıtlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Mutluluk Kayıtları 📝</h2>
      
      {events.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600">Henüz kayıt yok. İlk kaydı sen ekle! 😊</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="p-6">
              <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
              {event.description && (
                <p className="text-gray-700 mb-3">{event.description}</p>
              )}
              <p className="text-sm text-gray-500">
                {new Date(event.created_at).toLocaleString('tr-TR')}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
