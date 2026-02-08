'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { runDataRetentionManual } from '@/app/actions/admin-data-retention';
import { toast } from 'sonner';

export default function DataRetentionClient() {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleRunManual = async () => {
    if (
      !confirm(
        'Tem certeza que deseja executar as políticas de retenção de dados manualmente? Esta ação pode excluir dados permanentemente.'
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const result = await runDataRetentionManual();

      if (result.success) {
        setLastResult(result.data);
        toast.success('Políticas de retenção executadas com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao executar políticas');
      }
    } catch (error) {
      toast.error('Erro ao executar políticas de retenção');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Retenção de Dados (LGPD)</h1>
        <p className="text-gray-400 mt-2">
          Gerenciamento de políticas automatizadas de retenção de dados
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Políticas Ativas</h2>

        <div className="space-y-4">
          <div className="border-l-4 border-yellow-500 bg-yellow-500/10 p-4 rounded">
            <h3 className="font-semibold text-yellow-400">11 Meses de Inatividade</h3>
            <p className="text-sm text-gray-300 mt-1">
              Envia email de aviso para usuários inativos
            </p>
          </div>

          <div className="border-l-4 border-red-500 bg-red-500/10 p-4 rounded">
            <h3 className="font-semibold text-red-400">12 Meses de Inatividade</h3>
            <p className="text-sm text-gray-300 mt-1">
              Exclui permanentemente conta e dados relacionados
            </p>
          </div>

          <div className="border-l-4 border-blue-500 bg-blue-500/10 p-4 rounded">
            <h3 className="font-semibold text-blue-400">2 Anos - Briefings</h3>
            <p className="text-sm text-gray-300 mt-1">
              Anonimiza briefings não convertidos em projetos
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Execução Manual</h2>
        <p className="text-gray-400 mb-4">
          Execute as políticas de retenção manualmente para testes ou situações emergenciais.
          <br />
          <strong className="text-yellow-400">Atenção:</strong> Esta ação pode excluir dados
          permanentemente.
        </p>

        <Button onClick={handleRunManual} disabled={loading} variant="destructive">
          {loading ? 'Executando...' : 'Executar Políticas Agora'}
        </Button>
      </Card>

      {lastResult && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Último Resultado</h2>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-800 p-4 rounded">
              <p className="text-sm text-gray-400">Avisos Enviados</p>
              <p className="text-2xl font-bold text-white">{lastResult.summary.warningsSent}</p>
            </div>

            <div className="bg-gray-800 p-4 rounded">
              <p className="text-sm text-gray-400">Usuários Excluídos</p>
              <p className="text-2xl font-bold text-white">{lastResult.summary.usersDeleted}</p>
            </div>

            <div className="bg-gray-800 p-4 rounded">
              <p className="text-sm text-gray-400">Briefings Anonimizados</p>
              <p className="text-2xl font-bold text-white">
                {lastResult.summary.briefingsAnonymized}
              </p>
            </div>
          </div>

          {lastResult.errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500 p-4 rounded">
              <h3 className="font-semibold text-red-400 mb-2">
                Erros ({lastResult.errors.length})
              </h3>
              <ul className="text-sm text-gray-300 space-y-1">
                {lastResult.errors.map((error: string, index: number) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      <Card className="p-6 bg-gray-800/50">
        <h2 className="text-xl font-semibold text-white mb-4">Informações</h2>

        <div className="space-y-3 text-sm text-gray-300">
          <p>
            <strong className="text-white">Execução Automática:</strong> Diariamente às 03:00 AM via
            cron job
          </p>
          <p>
            <strong className="text-white">Logs:</strong> Todas as exclusões são registradas em{' '}
            <code className="bg-gray-700 px-2 py-1 rounded">DataDeletionLog</code>
          </p>
          <p>
            <strong className="text-white">Exceções:</strong> Usuários com{' '}
            <code className="bg-gray-700 px-2 py-1 rounded">doNotDelete = true</code> são
            preservados
          </p>
          <p>
            <strong className="text-white">Documentação:</strong> Consulte{' '}
            <code className="bg-gray-700 px-2 py-1 rounded">docs/cron-jobs.md</code> para detalhes
            técnicos
          </p>
        </div>
      </Card>
    </div>
  );
}
