import { useState } from 'react';
import { HappinessCreate } from './create';
import { HappinessList } from './list';
import { Button } from '../ui/button';

export function HappinessPage() {
  const [view, setView] = useState<'create' | 'list'>('create');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-4 mb-8 justify-center">
        <Button
          onClick={() => setView('create')}
          variant={view === 'create' ? 'default' : 'outline'}
        >
          ➕ Yeni Kayıt
        </Button>
        <Button
          onClick={() => setView('list')}
          variant={view === 'list' ? 'default' : 'outline'}
        >
          📋 Tüm Kayıtlar
        </Button>
      </div>

      {view === 'create' ? <HappinessCreate /> : <HappinessList />}
    </div>
  );
}
