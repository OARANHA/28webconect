'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
  import Button from '@/components/ui/Button';
  import Input from '@/components/ui/InputComponent';
  import Textarea from '@/components/ui/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { lgpdRequestSchema, LGPDRequestData } from '@/lib/validations/settings';
import {
  downloadUserData,
  deleteAccount,
  revokeMarketingConsent,
  sendLGPDRequest,
} from '@/app/actions/settings';
import { signOut } from 'next-auth/react';
import {
  Loader2,
  Download,
  Trash2,
  Mail,
  FileText,
  AlertTriangle,
  Check,
  Shield,
  Eye,
  UserX,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LEGAL } from '@/lib/constants';

interface PrivacySettingsProps {
  userId: string;
  marketingConsent: boolean;
}

const lgpdFormSchema = lgpdRequestSchema;

export function PrivacySettings({ userId, marketingConsent }: PrivacySettingsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(marketingConsent);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<LGPDRequestData>({
    resolver: zodResolver(lgpdFormSchema),
    mode: 'onChange',
  });

  // Download de dados
  const handleDownloadData = async () => {
    setIsDownloading(true);
    try {
      const result = await downloadUserData(userId);

      if (result.success && result.data) {
        // Criar blob e fazer download
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: 'application/json',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `meus-dados-28web-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success('Dados baixados com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao baixar dados');
      }
    } catch (error) {
      toast.error('Erro ao baixar dados. Tente novamente.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Revogar consentimento
  const handleRevokeConsent = async () => {
    if (!marketingOptIn) {
      toast.info('Você já não possui consentimento de marketing ativo.');
      return;
    }

    setIsRevoking(true);
    try {
      const result = await revokeMarketingConsent(userId);

      if (result.success) {
        toast.success(result.message || 'Consentimento revogado com sucesso!');
        setMarketingOptIn(false);
      } else {
        toast.error(result.error || 'Erro ao revogar consentimento');
      }
    } catch (error) {
      toast.error('Erro ao revogar consentimento. Tente novamente.');
    } finally {
      setIsRevoking(false);
    }
  };

  // Enviar solicitação LGPD
  const onSubmitLGPDRequest = async (data: LGPDRequestData) => {
    setIsSubmittingRequest(true);
    try {
      const result = await sendLGPDRequest(userId, data);

      if (result.success) {
        toast.success(result.message || 'Solicitação enviada com sucesso!');
        reset();
      } else {
        toast.error(result.error || 'Erro ao enviar solicitação');
      }
    } catch (error) {
      toast.error('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Excluir conta
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'EXCLUIR CONTA') {
      toast.error('Digite EXCLUIR CONTA para confirmar');
      return;
    }

    if (!deletePassword) {
      toast.error('Digite sua senha atual');
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteAccount(userId, deletePassword, deleteConfirmation);

      if (result.success) {
        toast.success(result.message || 'Conta excluída com sucesso');
        setShowDeleteModal(false);
        // Fazer logout
        await signOut({ callbackUrl: '/' });
      } else {
        toast.error(result.error || 'Erro ao excluir conta');
      }
    } catch (error) {
      toast.error('Erro ao excluir conta. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Seção 1: Consentimento de Marketing */}
      <section>
        <h2 className="text-xl font-semibold text-neutral-white mb-2 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Consentimento de Marketing
        </h2>
        <p className="text-neutral-gray text-sm mb-4">
          Gerencie suas preferências de comunicação promocional
        </p>

        <div className="bg-dark-bg-secondary border border-neutral-gray/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-white font-medium">Receber emails promocionais</p>
              <p className="text-neutral-gray text-sm">Newsletters, ofertas e novidades</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={cn('text-sm', marketingOptIn ? 'text-green-500' : 'text-neutral-gray')}
              >
                {marketingOptIn ? 'Ativo' : 'Inativo'}
              </span>
              {marketingOptIn && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRevokeConsent}
                  disabled={isRevoking}
                >
                  {isRevoking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Revogar'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Seção 2: Download de Dados */}
      <section>
        <h2 className="text-xl font-semibold text-neutral-white mb-2 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Download de Dados
        </h2>
        <p className="text-neutral-gray text-sm mb-4">
          Exercer direito de portabilidade conforme LGPD (Art. 18, V)
        </p>

        <div className="bg-dark-bg-secondary border border-neutral-gray/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-white font-medium">Baixar Meus Dados (JSON)</p>
              <p className="text-neutral-gray text-sm">
                Arquivo completo com todos os seus dados armazenados
              </p>
            </div>
            <Button variant="outline" onClick={handleDownloadData} disabled={isDownloading}>
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Seção 3: Solicitações LGPD */}
      <section>
        <h2 className="text-xl font-semibold text-neutral-white mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Solicitações LGPD
        </h2>
        <p className="text-neutral-gray text-sm mb-4">
          Para exercer outros direitos (acesso, retificação, oposição), envie uma solicitação ao
          nosso DPO.
          <span className="text-accent-primary"> Responderemos em até 15 dias úteis.</span>
        </p>

        <form
          onSubmit={handleSubmit(onSubmitLGPDRequest)}
          className="space-y-4 bg-dark-bg-secondary border border-neutral-gray/10 rounded-lg p-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-white">Tipo de Solicitação</label>
            <Select
              onValueChange={(value) =>
                setValue('requestType', value as LGPDRequestData['requestType'], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="bg-dark-bg-primary border-neutral-gray/20">
                <SelectValue placeholder="Selecione o tipo de solicitação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACESSO">Acesso aos Dados (Art. 18, II)</SelectItem>
                <SelectItem value="RETIFICACAO">Retificação de Dados (Art. 18, III)</SelectItem>
                <SelectItem value="OPOSICAO">Oposição ao Tratamento (Art. 18, IX)</SelectItem>
                <SelectItem value="PORTABILIDADE">Portabilidade Adicional</SelectItem>
                <SelectItem value="OUTRO">Outra Solicitação</SelectItem>
              </SelectContent>
            </Select>
            {errors.requestType && (
              <p className="text-red-500 text-xs">{errors.requestType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-white">
              Descrição da Solicitação
            </label>
            <Textarea
              {...register('description')}
              placeholder="Descreva detalhadamente sua solicitação..."
              rows={4}
              className={cn(
                'bg-dark-bg-primary border-neutral-gray/20 resize-none',
                errors.description && 'border-red-500 focus:border-red-500'
              )}
            />
            {errors.description && (
              <p className="text-red-500 text-xs">{errors.description.message}</p>
            )}
            <p className="text-neutral-gray text-xs">
              Mínimo 10 caracteres, máximo 1000 caracteres
            </p>
          </div>

          <Button type="submit" disabled={!isValid || isSubmittingRequest}>
            {isSubmittingRequest ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Solicitação ao DPO'
            )}
          </Button>
        </form>
      </section>

      {/* Seção 4: Exclusão de Conta */}
      <section>
        <h2 className="text-xl font-semibold text-neutral-white mb-2 flex items-center gap-2">
          <UserX className="w-5 h-5" />
          Exclusão de Conta
        </h2>
        <p className="text-neutral-gray text-sm mb-4">
          Exercer direito de eliminação dos dados (Art. 18, VI da LGPD)
        </p>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-500 font-medium">Atenção: Ação Irreversível</p>
              <p className="text-neutral-gray text-sm mt-1">
                A exclusão da conta removerá permanentemente todos os seus dados, incluindo
                briefings, projetos, arquivos e histórico. Esta ação não pode ser desfeita.
              </p>
              <Button
                variant="outline"
                className="mt-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Minha Conta
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-dark-bg-secondary border-red-500/30 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Confirmar Exclusão da Conta
            </DialogTitle>
            <DialogDescription className="text-neutral-gray">
              Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded p-3 text-sm text-neutral-gray">
              <p className="mb-2">
                <strong className="text-red-500">Você perderá:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Todos os briefings enviados</li>
                <li>Todos os projetos e arquivos</li>
                <li>Histórico de comunicações</li>
                <li>Acesso irreversível à plataforma</li>
              </ul>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-white">
                Digite sua senha atual
              </label>
              <Input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Sua senha atual"
                className="bg-dark-bg-primary border-neutral-gray/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-white">
                Para confirmar, digite <span className="text-red-500 font-bold">EXCLUIR CONTA</span>
              </label>
              <Input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="EXCLUIR CONTA"
                className={cn(
                  'bg-dark-bg-primary border-neutral-gray/20',
                  deleteConfirmation && deleteConfirmation !== 'EXCLUIR CONTA' && 'border-red-500'
                )}
              />
              {deleteConfirmation && deleteConfirmation !== 'EXCLUIR CONTA' && (
                <p className="text-red-500 text-xs">Digite exatamente EXCLUIR CONTA</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="sm:w-auto w-full"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={isDeleting || deleteConfirmation !== 'EXCLUIR CONTA' || !deletePassword}
              className="bg-red-500 hover:bg-red-600 text-white sm:w-auto w-full"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Confirmar Exclusão
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Informações de Contato DPO */}
      <section className="pt-4 border-t border-neutral-gray/10">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-accent-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-neutral-white font-medium">Data Protection Officer (DPO)</p>
            <p className="text-neutral-gray text-sm">
              Para questões sobre privacidade e proteção de dados, entre em contato:
            </p>
            <a
              href={`mailto:${LEGAL.dpoEmail}`}
              className="text-accent-primary hover:text-accent-secondary text-sm mt-1 inline-block"
            >
              {LEGAL.dpoEmail}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
