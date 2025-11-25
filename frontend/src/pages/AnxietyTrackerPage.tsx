import { useState, useEffect } from 'react';
import * as Slider from '@radix-ui/react-slider';
import api from '../services/api';
import { DailyEmotionalState } from '../types';

const ANXIETY_DESCRIPTIONS: Record<number, string> = {
  0: 'Calmo / Corpo estável',
  1: 'Muito tranquilo',
  2: 'Tranquilo',
  3: 'Tensão leve',
  4: 'Um pouco ansioso',
  5: 'Mente muito ligada',
  6: 'Ansiedade moderada',
  7: 'Sobrecarga começando',
  8: 'Muito ansioso',
  9: 'Difícil funcionar',
  10: 'Urgência / Crise',
};

const getAnxietyColor = (score: number): string => {
  if (score <= 2) return 'text-success-600';
  if (score <= 4) return 'text-primary-600';
  if (score <= 6) return 'text-warning-500';
  return 'text-red-600';
};

const getAnxietyBgColor = (score: number): string => {
  if (score <= 2) return 'bg-success-100 border-success-300';
  if (score <= 4) return 'bg-primary-100 border-primary-300';
  if (score <= 6) return 'bg-warning-100 border-warning-300';
  return 'bg-red-100 border-red-300';
};

export default function AnxietyTrackerPage() {
  const [anxietyScore, setAnxietyScore] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [todayState, setTodayState] = useState<DailyEmotionalState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadTodayState();
  }, []);

  const loadTodayState = async () => {
    try {
      const state = await api.getTodayEmotionalState();
      if (state) {
        setTodayState(state);
        setAnxietyScore(state.anxietyScore);
        setNotes(state.notes || '');
      }
    } catch (error) {
      console.error('Erro ao carregar estado emocional:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const savedState = await api.saveEmotionalState({
        date: new Date().toISOString(),
        anxietyScore,
        notes: notes.trim() || undefined,
      });

      setTodayState(savedState);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar estado emocional:', error);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card space-y-8 animate-slide-up">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Como você está se sentindo hoje?
          </h1>
          <p className="text-gray-600">
            Registre seu nível de ansiedade de 0 a 10
          </p>
        </div>

        {/* Slider */}
        <div className="space-y-6 py-8">
          {/* Score Display */}
          <div className={`text-center p-6 rounded-xl border-2 ${getAnxietyBgColor(anxietyScore)}`}>
            <div className={`text-7xl font-bold ${getAnxietyColor(anxietyScore)} mb-2`}>
              {anxietyScore}
            </div>
            <p className="text-lg font-medium text-gray-800">
              {ANXIETY_DESCRIPTIONS[anxietyScore]}
            </p>
          </div>

          {/* Slider Component */}
          <div className="px-4">
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={[anxietyScore]}
              onValueChange={(value) => setAnxietyScore(value[0])}
              max={10}
              min={0}
              step={1}
            >
              <Slider.Track className="bg-gray-300 relative grow rounded-full h-3">
                <Slider.Range className="absolute bg-primary-500 rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-8 h-8 bg-white border-4 border-primary-500 rounded-full shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-grab active:cursor-grabbing"
                aria-label="Nível de ansiedade"
              />
            </Slider.Root>

            {/* Labels */}
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>0 - Calmo</span>
              <span>5 - Moderado</span>
              <span>10 - Urgência</span>
            </div>
          </div>
        </div>

        {/* Notas opcionais */}
        <div className="space-y-3">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notas (opcional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="O que você está sentindo? O que pode ter influenciado?"
            rows={4}
            className="input resize-none"
          />
        </div>

        {/* Botão Salvar */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary w-full"
        >
          {isSaving ? 'Salvando...' : todayState ? 'Atualizar Registro' : 'Salvar Registro'}
        </button>

        {/* Mensagem de Sucesso */}
        {showSuccess && (
          <div className="p-4 bg-success-100 border border-success-300 rounded-lg animate-slide-up">
            <p className="text-success-800 font-medium text-center">
              ✓ Registro salvo com sucesso!
            </p>
          </div>
        )}

        {/* Info */}
        <div className="pt-6 border-t border-gray-200">
          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-medium text-gray-800">Escala de Ansiedade:</p>
            <ul className="space-y-1 pl-4">
              <li><span className="text-success-600 font-bold">0-2:</span> Calmo, corpo estável</li>
              <li><span className="text-primary-600 font-bold">3-4:</span> Tensão leve</li>
              <li><span className="text-warning-600 font-bold">5-6:</span> Mente ligada, ansiedade moderada</li>
              <li><span className="text-red-600 font-bold">7-10:</span> Sobrecarga, difícil funcionar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
