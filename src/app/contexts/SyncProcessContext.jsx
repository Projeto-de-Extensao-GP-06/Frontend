import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { atualizarDadosProcesso, conectarStatusSincronizacao } from "../services/processoService";

const SyncProcessContext = createContext({
  processosSincronizando: new Set(),
  iniciarSincronizacao: () => {},
  isSincronizando: () => false,
  ultimoProcessoSincronizadoId: null,
});

export function SyncProcessProvider({ children }) {
  const [sincronizandoIds, setSincronizandoIds] = useState(new Set());
  const [ultimoProcessoSincronizadoId, setUltimoProcessoSincronizadoId] = useState(null);
  const conexoesSseRef = useRef(new Map());
  const navigate = useNavigate();

  // Limpa conexões ativas quando o layout for desmontado
  useEffect(() => {
    const conexoes = conexoesSseRef.current;
    return () => {
      conexoes.forEach((desconectar) => {
        try {
          desconectar();
        } catch (_) {}
      });
      conexoes.clear();
    };
  }, []);

  const isSincronizando = useCallback(
    (processoId) => sincronizandoIds.has(String(processoId)),
    [sincronizandoIds]
  );

  const iniciarSincronizacao = useCallback(
    async ({ processoId, clientName }) => {
      const idStr = String(processoId);

      if (sincronizandoIds.has(idStr)) {
        toast.info("A sincronização deste processo já está em andamento.");
        return;
      }

      setSincronizandoIds((prev) => new Set(prev).add(idStr));

      // Se já houver conexão anterior desse processo, encerra
      if (conexoesSseRef.current.has(idStr)) {
        conexoesSseRef.current.get(idStr)();
        conexoesSseRef.current.delete(idStr);
      }

      // Conecta ao SSE global mantido no layout da aplicação
      const desconectarSse = conectarStatusSincronizacao(processoId, {
        onIniciado: () => {
          // Processo enfileirado no RabbitMQ
        },
        onProcessando: () => {
          toast.info("Processando na fila RabbitMQ: buscando dados oficiais no DataJud...", {
            duration: 6000,
          });
        },
        onConcluido: (data) => {
          // Remove da lista de processos em sincronização
          setSincronizandoIds((prev) => {
            const next = new Set(prev);
            next.delete(idStr);
            return next;
          });

          conexoesSseRef.current.delete(idStr);
          setUltimoProcessoSincronizadoId(processoId);

          // Dispara notificação global sonner que persiste em qualquer rota.
          // O scroll/highlight é feito pelo ProcessDetailPage após recarregar os dados.
          toast.success(
            clientName
              ? `Dados do processo de ${clientName} sincronizados com sucesso!`
              : "Dados do processo sincronizados com sucesso!",
            {
              duration: 15000,
              action: {
                label: "Ver Processo",
                onClick: () => {
                  const caminhoProcesso = `/app/processos/${processoId}`;
                  if (window.location.pathname === caminhoProcesso) {
                    const card = document.getElementById("card-dados-processo");
                    if (card) {
                      card.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  } else {
                    navigate(caminhoProcesso, { state: { destacarCard: true } });
                  }
                },
              },
            }
          );
        },
        onError: () => {
          // Caso a conexão SSE caia, desconecta o listener
          conexoesSseRef.current.delete(idStr);
        },
      });

      conexoesSseRef.current.set(idStr, desconectarSse);

      try {
        const resposta = await atualizarDadosProcesso(processoId);
        toast.info(
          resposta?.mensagem ||
            "Solicitação de sincronização enviada para a fila RabbitMQ!",
          { duration: 5000 }
        );
      } catch (err) {
        setSincronizandoIds((prev) => {
          const next = new Set(prev);
          next.delete(idStr);
          return next;
        });

        if (conexoesSseRef.current.has(idStr)) {
          conexoesSseRef.current.get(idStr)();
          conexoesSseRef.current.delete(idStr);
        }

        const msg = err.response?.data?.message || "Não foi possível iniciar a sincronização do processo.";
        toast.error(msg);
      }
    },
    [sincronizandoIds, navigate]
  );

  return (
    <SyncProcessContext.Provider
      value={{
        processosSincronizando: sincronizandoIds,
        iniciarSincronizacao,
        isSincronizando,
        ultimoProcessoSincronizadoId,
      }}
    >
      {children}
    </SyncProcessContext.Provider>
  );
}

export function useSyncProcess() {
  return useContext(SyncProcessContext);
}
