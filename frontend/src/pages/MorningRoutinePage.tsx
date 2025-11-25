import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import Confetti from 'react-confetti';
import api from '../services/api';
import { MorningRoutineSession } from '../types';

type RoutineState = 'initial' | 'running' | 'checklist' | 'victory';

export default function MorningRoutinePage() {
  const { user } = useUser();
  const [state, setState] = useState<RoutineState>('initial');
  const [session, setSession] = useState<MorningRoutineSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [bestTimeThisWeek, setBestTimeThisWeek] = useState<MorningRoutineSession | null>(null);

  // Checklist state
  const [checklist, setChecklist] = useState({
    tookShower: false,
    gotDressed: false,
    hadBreakfast: false,
    tookMeds: false,
  });

  // Buscar sessão ativa ao carregar
  useEffect(() => {
    loadActiveSession();
    loadBestTime();
  }, []);

  // Cronômetro
  useEffect(() => {
    if (state === 'running' && session) {
      const interval = setInterval(() => {
        const now = new Date();
        const start = new Date(session.startedAt);
        const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
        setElapsedSeconds(diff);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [state, session]);

  const loadActiveSession = async () => {
    try {
      const activeSession = await api.getActiveSession();
      if (activeSession) {
        setSession(activeSession);
        setState('running');

        // Calcular tempo decorrido
        const now = new Date();
        const start = new Date(activeSession.startedAt);
        const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
        setElapsedSeconds(diff);
      }
    } catch (error) {
      console.error('Erro ao carregar sessão ativa:', error);
    }
  };

  const loadBestTime = async () => {
    try {
      const bestTime = await api.getBestTimeThisWeek();
      setBestTimeThisWeek(bestTime);
    } catch (error) {
      console.error('Erro ao carregar melhor tempo:', error);
    }
  };

  const handleStartRoutine = async () => {
    try {
      const newSession = await api.startMorningRoutine();
      setSession(newSession);
      setState('running');
      setElapsedSeconds(0);
    } catch (error) {
      console.error('Erro ao iniciar rotina:', error);
      alert('Erro ao iniciar rotina. Tente novamente.');
    }
  };

  const handleOpenChecklist = () => {
    setState('checklist');
  };

  const handleToggleChecklistItem = (item: keyof typeof checklist) => {
    setChecklist(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const allChecklistCompleted = () => {
    return Object.values(checklist).every(val => val === true);
  };

  const handleFinishRoutine = async () => {
    if (!session) return;

    if (!allChecklistCompleted()) {
      alert('Por favor, marque todos os itens do checklist antes de finalizar.');
      return;
    }

    try {
      const finishedSession = await api.finishMorningRoutine({
        sessionId: session.id,
        endedAt: new Date().toISOString(),
        ...checklist
      });

      setSession(finishedSession);
      setState('victory');

      // Recarregar melhor tempo
      await loadBestTime();
    } catch (error) {
      console.error('Erro ao finalizar rotina:', error);
      alert('Erro ao finalizar rotina. Tente novamente.');
    }
  };

  const handleNewRoutine = () => {
    setState('initial');
    setSession(null);
    setElapsedSeconds(0);
    setChecklist({
      tookShower: false,
      gotDressed: false,
      hadBreakfast: false,
      tookMeds: false,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}min ${secs}s` : `${mins}min`;
  };

  // ===== RENDERIZAÇÃO CONDICIONAL POR ESTADO =====

  if (state === 'initial') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center space-y-8 animate-slide-up">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Bom dia, {user?.firstName || 'amigo'}! 👋
            </h1>
            <p className="text-xl text-gray-600">
              Respire. Vamos começar bem simples.
            </p>
          </div>

          <div className="py-8">
            <button
              onClick={handleStartRoutine}
              className="btn-primary text-xl px-12 py-6 text-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Iniciar Manhã
            </button>
          </div>

          {bestTimeThisWeek && (
            <div className="mt-8 p-4 bg-success-50 border border-success-200 rounded-lg">
              <p className="text-sm text-success-800 font-medium">
                🏆 Seu melhor tempo da semana: {formatDuration(bestTimeThisWeek.durationSeconds || 0)}
              </p>
            </div>
          )}

          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Lembre-se: não há pressa. Cada dia é uma vitória.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'running') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center space-y-8 animate-slide-up">
          <h2 className="text-2xl font-semibold text-gray-800">
            Vamos no seu ritmo
          </h2>

          <div className="py-12">
            <div className="text-8xl font-mono font-bold text-primary-600 animate-tick">
              {formatTime(elapsedSeconds)}
            </div>
            <p className="mt-4 text-gray-600">
              Você pode finalizar quando terminar sua rotina
            </p>
          </div>

          <button
            onClick={handleOpenChecklist}
            className="btn-success text-lg px-8 py-4 shadow-lg"
          >
            Finalizar Rotina
          </button>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              ⏱️ Cronômetro rodando... Sem pressa!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'checklist') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card space-y-6 animate-slide-up">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Antes de finalizar...
            </h2>
            <p className="text-gray-600">
              Marque todos os itens que você completou
            </p>
          </div>

          <div className="space-y-4 py-6">
            {/* Banho */}
            <label className="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 hover:border-primary-300">
              <input
                type="checkbox"
                checked={checklist.tookShower}
                onChange={() => handleToggleChecklistItem('tookShower')}
                className="w-6 h-6 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
              />
              <span className="text-lg font-medium text-gray-800">
                🚿 Tomei banho
              </span>
            </label>

            {/* Vestir */}
            <label className="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 hover:border-primary-300">
              <input
                type="checkbox"
                checked={checklist.gotDressed}
                onChange={() => handleToggleChecklistItem('gotDressed')}
                className="w-6 h-6 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
              />
              <span className="text-lg font-medium text-gray-800">
                👕 Me vesti
              </span>
            </label>

            {/* Café */}
            <label className="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 hover:border-primary-300">
              <input
                type="checkbox"
                checked={checklist.hadBreakfast}
                onChange={() => handleToggleChecklistItem('hadBreakfast')}
                className="w-6 h-6 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
              />
              <span className="text-lg font-medium text-gray-800">
                ☕ Tomei café da manhã
              </span>
            </label>

            {/* Remédios */}
            <label className="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 hover:border-primary-300">
              <input
                type="checkbox"
                checked={checklist.tookMeds}
                onChange={() => handleToggleChecklistItem('tookMeds')}
                className="w-6 h-6 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
              />
              <span className="text-lg font-medium text-gray-800">
                💊 Tomei meus remédios
              </span>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setState('running')}
              className="btn-secondary flex-1"
            >
              Voltar
            </button>

            <button
              onClick={handleFinishRoutine}
              disabled={!allChecklistCompleted()}
              className="btn-success flex-1"
            >
              Confirmar e Finalizar
            </button>
          </div>

          {!allChecklistCompleted() && (
            <p className="text-center text-sm text-warning-600">
              ⚠️ Marque todos os itens para finalizar
            </p>
          )}
        </div>
      </div>
    );
  }

  if (state === 'victory') {
    const isNewRecord = bestTimeThisWeek && session?.durationSeconds
      ? session.durationSeconds < bestTimeThisWeek.durationSeconds
      : false;

    return (
      <>
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />

        <div className="max-w-2xl mx-auto">
          <div className="card text-center space-y-8 animate-slide-up">
            <div>
              <h1 className="text-5xl font-bold text-gradient mb-4">
                Você venceu a manhã! 🚀
              </h1>
              <p className="text-xl text-gray-600">
                Parabéns por completar sua rotina!
              </p>
            </div>

            <div className="py-8 space-y-4">
              <div className="text-6xl font-bold text-primary-600">
                {formatDuration(session?.durationSeconds || 0)}
              </div>
              <p className="text-lg text-gray-700">
                Seu tempo de hoje
              </p>

              {isNewRecord && (
                <div className="inline-block px-6 py-3 bg-warning-100 border-2 border-warning-400 rounded-full">
                  <p className="text-warning-800 font-bold text-lg">
                    🔥 Novo recorde da semana!
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <button
                onClick={handleNewRoutine}
                className="btn-primary w-full"
              >
                Concluir
              </button>

              <p className="text-sm text-gray-500">
                Continue assim! Cada pequena vitória conta.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}
