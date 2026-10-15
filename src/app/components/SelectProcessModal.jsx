import { useState, useEffect } from "react";
import { Search, FileText, X, Check, ChevronDown, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { ProcessCard } from "./ProcessCard";
import { PaginationBar } from "./PaginationBar";
import { listarProcessos, mapearProcesso } from "../services/processoService";
import { api } from "../provider/api";
import { toast } from "sonner";
import "../../styles/select-process-modal.css";

export function SelectProcessModal({
  open,
  onOpenChange,
  selectedProcessId,
  onSelect,
}) {
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [phasesList, setPhasesList] = useState([]);
  const [tribunalsList, setTribunalsList] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [priorityFilter, setPriorityFilter] = useState("todas");
  const [phaseFilter, setPhaseFilter] = useState("todas");
  const [tribunalFilter, setTribunalFilter] = useState("todos");
  const [page, setPage] = useState(1);

  // Carrega opções de fases e tribunais da API
  useEffect(() => {
    let active = true;
    async function carregarOpcoes() {
      try {
        const [fasesRes, tribRes] = await Promise.all([
          api.get("/fasesProcesso").catch(() => ({ data: [] })),
          api.get("/siglaTribunais").catch(() => ({ data: [] })),
        ]);
        if (!active) return;
        const fases = Array.isArray(fasesRes.data) ? fasesRes.data : [];
        const tribs = Array.isArray(tribRes.data) ? tribRes.data : [];
        setPhasesList(fases.map((f) => f.nome).filter(Boolean));
        setTribunalsList(
          tribs.map((t) => t.nome?.toUpperCase() || t.nome).filter(Boolean)
        );
      } catch (err) {
        console.error("Erro ao carregar opções no modal de processos:", err);
      }
    }
    carregarOpcoes();
    return () => {
      active = false;
    };
  }, []);

  // Carrega processos reais do backend quando o modal abrir
  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);

    listarProcessos({ size: 100 })
      .then((data) => {
        if (!active) return;
        const rawContent = data.content || (Array.isArray(data) ? data : []);
        const mapped = rawContent.map(mapearProcesso);
        setProcesses(mapped);
        setSelectedProcess(
          mapped.find((p) => String(p.id) === String(selectedProcessId)) || null
        );
      })
      .catch((err) => {
        console.error("Erro ao carregar processos:", err);
        if (active) {
          toast.error("Não foi possível carregar os processos do servidor.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, selectedProcessId]);

  const PAGE_SIZE = 6;

  const filtered = processes.filter((p) => {
    const term = search.toLowerCase();
    const matchSearch =
      !search ||
      p.cnj?.toLowerCase().includes(term) ||
      p.clientName?.toLowerCase().includes(term) ||
      p.tribunal?.toLowerCase().includes(term) ||
      p.phase?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term);

    const matchStatus =
      statusFilter === "todos" ||
      p.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchPriority =
      priorityFilter === "todas" ||
      p.priority?.toLowerCase() === priorityFilter.toLowerCase();

    const matchPhase =
      phaseFilter === "todas" ||
      p.phase?.toLowerCase() === phaseFilter.toLowerCase();

    const matchTribunal =
      tribunalFilter === "todos" ||
      p.tribunal?.toLowerCase() === tribunalFilter.toLowerCase();

    return matchSearch && matchStatus && matchPriority && matchPhase && matchTribunal;
  });

  const hasActiveFilters =
    search !== "" ||
    statusFilter !== "todos" ||
    priorityFilter !== "todas" ||
    phaseFilter !== "todas" ||
    tribunalFilter !== "todos";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("todos");
    setPriorityFilter("todas");
    setPhaseFilter("todas");
    setTribunalFilter("todos");
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const handleCardClick = (process) => {
    setSelectedProcess(process);
  };

  const handleConfirm = () => {
    if (selectedProcess) {
      onSelect(selectedProcess);
      onOpenChange(false);
    }
  };

  const availablePhases =
    phasesList.length > 0
      ? phasesList
      : Array.from(new Set(processes.map((p) => p.phase).filter(Boolean)));

  const availableTribunals =
    tribunalsList.length > 0
      ? tribunalsList
      : Array.from(new Set(processes.map((p) => p.tribunal).filter(Boolean)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="select-process-dialog-content">
        <DialogHeader className="select-process-dialog-header">
          <div>
            <p className="select-process-modal-kicker">Seleção de Processo</p>
            <DialogTitle className="select-process-modal-title">
              Selecionar Processo
            </DialogTitle>
          </div>
          <DialogDescription className="select-process-modal-subtitle">
            Busque e selecione o processo para análise com o assistente de IA.
          </DialogDescription>
        </DialogHeader>

        <div className="select-process-modal-body">
          {/* ── Search + Filters Panel ── */}
          <div className="select-modal-panel">
            {/* Search row */}
            <div className="select-modal-search-row">
              <div className="select-modal-search-wrap">
                <Search size={16} className="select-modal-search-icon" />
                <input
                  type="text"
                  placeholder="Buscar por CNJ, cliente, tribunal ou descrição..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="select-modal-search-input"
                />
              </div>
              <button type="button" className="select-modal-search-button">
                Buscar
              </button>
            </div>

            {/* Divider */}
            <div className="select-modal-divider" />

            {/* Filter controls */}
            <div className="select-modal-filters-grid">
              {/* Status filter */}
              <div className="select-modal-filter-item">
                <p className="select-modal-filter-label">Status</p>
                <div className="select-modal-filter-group">
                  {["todos", "ativo", "encerrado", "suspenso"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setStatusFilter(s);
                        setPage(1);
                      }}
                      className={`select-modal-filter-pill ${statusFilter === s ? "is-active" : ""}`}
                    >
                      {s === "todos"
                        ? "Todos"
                        : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority filter */}
              <div className="select-modal-filter-item">
                <p className="select-modal-filter-label">Prioridade</p>
                <div className="select-modal-filter-group">
                  {["todas", "alta", "média", "baixa"].map((pr) => (
                    <button
                      key={pr}
                      type="button"
                      onClick={() => {
                        setPriorityFilter(pr);
                        setPage(1);
                      }}
                      className={`select-modal-filter-pill ${priorityFilter === pr ? "is-active" : ""}`}
                    >
                      {pr === "todas"
                        ? "Todas"
                        : pr.charAt(0).toUpperCase() + pr.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phase dropdown */}
              <div className="select-modal-filter-item">
                <p className="select-modal-filter-label">Fase</p>
                <div className="select-modal-filter-select-wrap">
                  <select
                    value={phaseFilter}
                    onChange={(e) => {
                      setPhaseFilter(e.target.value);
                      setPage(1);
                    }}
                    className="select-modal-filter-select"
                  >
                    <option value="todas">Todas as fases</option>
                    {availablePhases.map((ph) => (
                      <option key={ph} value={ph.toLowerCase()}>
                        {ph}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="select-modal-filter-select-chevron" />
                </div>
              </div>

              {/* Tribunal dropdown */}
              <div className="select-modal-filter-item">
                <p className="select-modal-filter-label">Tribunal</p>
                <div className="select-modal-filter-select-wrap">
                  <select
                    value={tribunalFilter}
                    onChange={(e) => {
                      setTribunalFilter(e.target.value);
                      setPage(1);
                    }}
                    className="select-modal-filter-select"
                  >
                    <option value="todos">Todos os tribunais</option>
                    {availableTribunals.map((t) => (
                      <option key={t} value={t.toLowerCase()}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="select-modal-filter-select-chevron" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Results count + clear ── */}
          <div className="select-modal-results-row">
            <p className="select-modal-results-count">
              {loading
                ? "Carregando processos..."
                : filtered.length === processes.length
                ? `${filtered.length} processos encontrados`
                : `${filtered.length} de ${processes.length} processos encontrados`}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="select-modal-clear-filters"
              >
                <X size={11} />
                Limpar filtros
              </button>
            )}
          </div>

          {/* ── Process Grid / Empty / Loading State ── */}
          {loading ? (
            <div className="select-modal-empty-state">
              <Loader2 size={28} className="animate-spin text-primary" />
              <p className="select-modal-empty-text">Carregando processos do servidor...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="select-modal-empty-state">
              <div className="select-modal-empty-icon-wrap">
                <FileText size={24} />
              </div>
              <p className="select-modal-empty-title">Nenhum processo encontrado</p>
              <p className="select-modal-empty-text">
                Tente ajustar os filtros ou os termos de busca digitados.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="select-modal-empty-clear"
                >
                  Limpar todos os filtros
                </button>
              )}
            </div>
          ) : (
            <div className="select-process-grid">
              {paginated.map((proc) => (
                <ProcessCard
                  key={proc.id}
                  process={proc}
                  selected={selectedProcess?.id === proc.id}
                  onClick={() => handleCardClick(proc)}
                  showChevron={false}
                />
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {!loading && totalPages > 1 && (
            <PaginationBar page={safePage} total={totalPages} onPage={setPage} />
          )}
        </div>

        {/* ── Footer / Confirm Action ── */}
        <DialogFooter className="select-process-dialog-footer">
          <div className="select-process-footer-info">
            {selectedProcess ? (
              <div className="select-process-footer-selected">
                <span className="select-process-footer-label">Selecionado:</span>
                <span
                  className="select-process-footer-name"
                  title={selectedProcess.clientName}
                >
                  {selectedProcess.clientName}
                </span>
                <span className="select-process-footer-cnj">
                  {selectedProcess.cnj}
                </span>
              </div>
            ) : (
              <span className="select-process-footer-placeholder">
                Nenhum processo selecionado
              </span>
            )}
          </div>

          <div className="select-process-footer-actions">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="select-process-btn select-process-btn--cancel"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!selectedProcess}
              onClick={handleConfirm}
              className="select-process-btn select-process-btn--confirm"
            >
              <Check size={15} />
              Confirmar Escolha
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
