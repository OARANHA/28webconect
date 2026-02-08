'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { Bell, Mail, Smartphone, Check, AlertCircle, Volume2 } from 'lucide-react';
import type { NotificationPreference, NotificationType } from '@/types/notifications';
import { updateNotificationPreferences } from '@/app/actions/notifications';
import {
  getNotificationTypeLabel,
  getNotificationTriggerDescription,
} from '@/lib/notification-helpers';
import {
  isPushSupported,
  requestNotificationPermission,
  subscribeToPush,
  showLocalNotification,
} from '@/lib/push-subscription';
import { cn } from '@/lib/utils';

interface NotificationPreferencesProps {
  initialPreferences: NotificationPreference[];
  userId: string;
}

interface PreferenceState {
  type: NotificationType;
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
}

const SOUND_ENABLED_KEY = 'notification-sound-enabled';

/**
 * Toggle Switch Component
 */
function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <label
      className={cn(
        'relative inline-flex items-center cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
        aria-label={label}
      />
      <div
        className={cn(
          'w-11 h-6 rounded-full transition-colors duration-200',
          'peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent-primary/50',
          checked ? 'bg-accent-primary' : 'bg-neutral-gray/20',
          'after:content-[""] after:absolute after:top-0.5 after:left-[2px]',
          'after:bg-white after:border-gray-300 after:border after:rounded-full',
          'after:h-5 after:w-5 after:transition-all after:duration-200',
          checked && 'after:translate-x-full after:border-white'
        )}
      />
    </label>
  );
}

/**
 * Componente de preferências de notificação
 */
export function NotificationPreferences({
  initialPreferences,
  userId,
}: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<PreferenceState[]>(
    initialPreferences.map((p) => ({
      type: p.type,
      emailEnabled: p.emailEnabled,
      pushEnabled: p.pushEnabled,
      inAppEnabled: p.inAppEnabled,
    }))
  );
  // Ref para armazenar a referência base das preferências salvas (para hasChanges)
  const savedPreferencesRef = useRef<PreferenceState[]>(
    initialPreferences.map((p) => ({
      type: p.type,
      emailEnabled: p.emailEnabled,
      pushEnabled: p.pushEnabled,
      inAppEnabled: p.inAppEnabled,
    }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingPush, setIsTestingPush] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(SOUND_ENABLED_KEY) !== 'false';
  });

  // Verificar se há mudanças comparando com a última referência salva
  const hasChanges = useMemo(() => {
    return preferences.some((p, index) => {
      const saved = savedPreferencesRef.current[index];
      return (
        saved &&
        (p.emailEnabled !== saved.emailEnabled ||
          p.pushEnabled !== saved.pushEnabled ||
          p.inAppEnabled !== saved.inAppEnabled)
      );
    });
  }, [preferences]);

  /**
   * Atualiza uma preferência
   */
  const handleToggle = useCallback(
    (type: NotificationType, channel: keyof PreferenceState, value: boolean) => {
      setPreferences((prev) => prev.map((p) => (p.type === type ? { ...p, [channel]: value } : p)));
    },
    []
  );

  /**
   * Salva as preferências
   */
  const handleSave = useCallback(async () => {
    setIsSaving(true);

    try {
      const result = await updateNotificationPreferences(userId, preferences);

      if (result.success) {
        toast.success('Preferências salvas com sucesso!');
        // Atualizar a referência base para que hasChanges volte a false
        savedPreferencesRef.current = preferences.map((p) => ({ ...p }));
      } else {
        toast.error(result.error || 'Erro ao salvar preferências');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar preferências');
    } finally {
      setIsSaving(false);
    }
  }, [userId, preferences]);

  /**
   * Testa notificação push
   */
  const handleTestPush = useCallback(async () => {
    setIsTestingPush(true);

    try {
      // Verificar suporte
      if (!isPushSupported()) {
        toast.error('Seu navegador não suporta notificações push');
        return;
      }

      // Solicitar permissão
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        toast.error('Permissão de notificação negada');
        return;
      }

      // Subscrever
      const subscription = await subscribeToPush();
      if (!subscription) {
        toast.error('Não foi possível ativar notificações push');
        return;
      }

      // Salvar subscription no servidor
      const { savePushSubscription } = await import('@/app/actions/notifications');
      const saveResult = await savePushSubscription(userId, subscription);

      if (!saveResult.success) {
        toast.error('Erro ao salvar subscription');
        return;
      }

      // Mostrar notificação local de teste
      showLocalNotification('Teste de Notificação 🔔', {
        body: 'Suas notificações push estão funcionando!',
        icon: '/assets/28connect.jpg',
      });

      toast.success('Notificação de teste enviada!');
    } catch (error) {
      console.error('Erro ao testar push:', error);
      toast.error('Erro ao testar notificação push');
    } finally {
      setIsTestingPush(false);
    }
  }, [userId]);

  /**
   * Toggle de som
   */
  const handleSoundToggle = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
    }
    toast.success(enabled ? 'Som de notificação ativado' : 'Som de notificação desativado');
  }, []);

  return (
    <div className="space-y-8">
      {/* Configurações gerais */}
      <div className="bg-dark-bg-secondary border border-neutral-gray/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-white mb-4 flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-accent-primary" />
          Configurações Gerais
        </h3>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-neutral-white font-medium">Som de notificação</p>
            <p className="text-sm text-neutral-gray">
              Tocar som quando novas notificações chegarem
            </p>
          </div>
          <ToggleSwitch
            checked={soundEnabled}
            onChange={handleSoundToggle}
            label="Ativar som de notificação"
          />
        </div>
      </div>

      {/* Tabela de preferências */}
      <div className="bg-dark-bg-secondary border border-neutral-gray/10 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-gray/10">
          <h3 className="text-lg font-semibold text-neutral-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-accent-primary" />
            Preferências por Tipo
          </h3>
          <p className="text-sm text-neutral-gray mt-1">
            Configure como deseja receber notificações para cada tipo de evento
          </p>
        </div>

        {/* Header da tabela */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-dark-bg-primary/50 text-xs font-medium text-neutral-gray uppercase tracking-wider">
          <div className="col-span-5 md:col-span-6">Tipo de Notificação</div>
          <div className="col-span-2 md:col-span-2 text-center flex items-center justify-center gap-1">
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden md:inline">In-App</span>
          </div>
          <div className="col-span-2 md:col-span-2 text-center flex items-center justify-center gap-1">
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Email</span>
          </div>
          <div className="col-span-3 md:col-span-2 text-center flex items-center justify-center gap-1">
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Push</span>
          </div>
        </div>

        {/* Linhas de preferências */}
        <div className="divide-y divide-neutral-gray/10">
          {preferences.map((pref) => (
            <div
              key={pref.type}
              className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-neutral-gray/5 transition-colors"
            >
              {/* Info do tipo */}
              <div className="col-span-5 md:col-span-6">
                <p className="text-sm font-medium text-neutral-white">
                  {getNotificationTypeLabel(pref.type)}
                </p>
                <p className="text-xs text-neutral-gray mt-0.5">
                  {getNotificationTriggerDescription(pref.type)}
                </p>
              </div>

              {/* Toggle In-App */}
              <div className="col-span-2 md:col-span-2 flex justify-center">
                <ToggleSwitch
                  checked={pref.inAppEnabled}
                  onChange={(value) => handleToggle(pref.type, 'inAppEnabled', value)}
                  label="Notificação in-app"
                />
              </div>

              {/* Toggle Email */}
              <div className="col-span-2 md:col-span-2 flex justify-center">
                <ToggleSwitch
                  checked={pref.emailEnabled}
                  onChange={(value) => handleToggle(pref.type, 'emailEnabled', value)}
                  label="Notificação por email"
                />
              </div>

              {/* Toggle Push */}
              <div className="col-span-3 md:col-span-2 flex justify-center">
                <ToggleSwitch
                  checked={pref.pushEnabled}
                  onChange={(value) => handleToggle(pref.type, 'pushEnabled', value)}
                  label="Notificação push"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <button
          onClick={handleTestPush}
          disabled={isTestingPush}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            'border border-neutral-gray/20 text-neutral-white',
            'hover:bg-neutral-gray/10 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isTestingPush ? (
            <>
              <div className="w-4 h-4 border-2 border-neutral-white/30 border-t-neutral-white rounded-full animate-spin" />
              Testando...
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4" />
              Testar Notificação Push
            </>
          )}
        </button>

        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={cn(
            'flex items-center gap-2 px-6 py-2 rounded-lg',
            'bg-accent-primary text-white font-medium',
            'hover:bg-accent-primary/90 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'min-w-[180px] justify-center'
          )}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Salvar Preferências
            </>
          )}
        </button>
      </div>

      {/* Alerta de push não suportado */}
      {!isPushSupported() && (
        <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-500">Notificações push não suportadas</p>
            <p className="text-sm text-neutral-gray mt-1">
              Seu navegador não suporta notificações push. Tente usar um navegador moderno como
              Chrome, Firefox ou Edge.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationPreferences;
