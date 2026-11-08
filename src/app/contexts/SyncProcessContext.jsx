import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { atualizarDadosProcesso, conectarStatusSincronizacao } from "../services/processoService";
import { atualizarDadosSolicitacao, conectarStatusSincronizacaoSolicitacao } from "../services/solicitacaoService";

const SyncProcessContext = createContext({
  processosSincronizando: new Set(),
  iniciarSincronizacao: () => {},
  acompanharSincronizacao: () => {},
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

  const acompanharSincronizacao = useCallback(
    ({ processoId, clientName, tipo = "processo" }) => {
      const idStr = String(processoId);

      if (sincronizandoIds.has(idStr)) {
        return;
      }

      setSincronizandoIds((prev) => new Set(prev).add(idStr));

      // Se já houver conexão anterior desse processo, encerra
      if (conexoesSseRef.current.has(idStr)) {
        conexoesSseRef.current.get(idStr)();
        conexoesSseRef.current.delete(idStr);
      }

      const conectar =
        tipo === "solicitacao"
          ? conectarStatusSincronizacaoSolicitacao
          : conectarStatusSincronizacao;

      // Conecta ao SSE global mantido no layout da aplicação
      const desconectarSse = conectar(processoId, {
        onIniciado: () => {},
        onProcessando: () => {},
        onReprocessando: () => {},
        onConcluido: (data) => {
          setSincronizandoIds((prev) => {
            const next = new Set(prev);
            next.delete(idStr);
            return next;
          });

          conexoesSseRef.current.delete(idStr);

          // Trata status de falha/aviso retornado pelo backend
          if (data?.status === "ERRO" || data?.status === "AVISO") {
            toast.error(
              data?.mensagem || "Não foi possível sincronizar os dados oficiais no DataJud.",
              { duration: 6000 }
            );
            return;
          }

          setUltimoProcessoSincronizadoId(processoId);

          const isSolicitacao = tipo === "solicitacao";
          const labelVer = isSolicitacao ? "Ver Solicitação" : "Ver Processo";
          const caminhoDestino = isSolicitacao
            ? `/app/solicitacoes/${processoId}`
            : `/app/processos/${processoId}`;
          const mensagemSucesso = clientName
            ? `Dados ${isSolicitacao ? "da solicitação" : "do processo"} de ${clientName} sincronizados com sucesso!`
            : `Dados ${isSolicitacao ? "da solicitação" : "do processo"} sincronizados com sucesso!`;

          // Dispara notificação de sucesso com ação para ver o processo/solicitação
          toast.success(
            mensagemSucesso,
            {
              duration: 10000,
              action: {
                label: labelVer,
                onClick: () => {
                  if (window.location.pathname === caminhoDestino) {
                    const card = document.getElementById("card-dados-processo");
                    if (card) {
                      card.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  } else {
                    navigate(caminhoDestino, { state: { destacarCard: true } });
                  }
                },
              },
            }
          );
        },
        onError: () => {
          setSincronizandoIds((prev) => {
            const next = new Set(prev);
            next.delete(idStr);
            return next;
          });
          conexoesSseRef.current.delete(idStr);
        },
      });

      conexoesSseRef.current.set(idStr, desconectarSse);
    },
    [sincronizandoIds, navigate]
  );

  const iniciarSincronizacao = useCallback(
    async ({ processoId, clientName, tipo = "processo" }) => {
      const idStr = String(processoId);

      if (sincronizandoIds.has(idStr)) {
        toast.info(
          tipo === "solicitacao"
            ? "A sincronização desta solicitação já está em andamento."
            : "A sincronização deste processo já está em andamento.",
          { duration: 4000 }
        );
        return;
      }

      setUltimoProcessoSincronizadoId(null);

      acompanharSincronizacao({ processoId, clientName, tipo });

      try {
        const funcaoAtualizar =
          tipo === "solicitacao"
            ? atualizarDadosSolicitacao
            : atualizarDadosProcesso;
        const resposta = await funcaoAtualizar(processoId);
        toast.info(
          resposta?.mensagem ||
            "Solicitação de sincronização enviada para a fila de processamento.",
          { duration: 4000 }
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

        const msg =
          err.response?.data?.message ||
          (tipo === "solicitacao"
            ? "Não foi possível iniciar a sincronização da solicitação."
            : "Não foi possível iniciar a sincronização do processo.");
        toast.error(msg, { duration: 5000 });
      }
    },
    [sincronizandoIds, acompanharSincronizacao]
  );

  return (
    <SyncProcessContext.Provider
      value={{
        processosSincronizando: sincronizandoIds,
        iniciarSincronizacao,
        acompanharSincronizacao,
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
