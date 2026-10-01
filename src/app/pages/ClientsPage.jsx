import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, Users, Trash2, Pencil, LoaderCircle, AlertCircle } from "lucide-react";
import { ClientCard } from "../components/ClientCard";
import { PaginationBar } from "../components/PaginationBar";
import { clienteService, getClienteError } from "../services/clienteService";
import "../../styles/clients-page.css";

export default function ClientsPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pageSize = 6;
  const loadClients = async () => { setLoading(true); setError(""); try { setClients(await clienteService.list()); } catch (requestError) { setError(getClienteError(requestError)); } finally { setLoading(false); } };
  useEffect(() => { document.title = "Clientes"; loadClients(); }, []);
  const filtered = clients.filter((client) => { const term = search.trim().toLowerCase(); return !term || [client.name, client.email, client.cpf, client.cnpj].filter(Boolean).some((value) => value.toLowerCase().includes(term)); }).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const handleDelete = async (client) => { if (!window.confirm(`Excluir o cliente ${client.name}?`)) return; try { await clienteService.remove(client.id); await loadClients(); } catch (requestError) { window.alert(getClienteError(requestError)); } };
  return <div className="clients-page">
    <div className="clients-header"><div><p className="clients-kicker">SGPJ</p><h1 className="clients-title">Clientes</h1></div><button onClick={() => navigate("/app/clientes/novo")} className="clients-new-button"><Plus size={16} /> Novo Cliente</button></div>
    <div className="clients-panel"><div className="clients-search-row"><div className="clients-search-wrap"><Search size={16} className="clients-search-icon" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar por nome, e-mail ou CPF/CNPJ..." className="clients-search-input" /></div><button className="clients-search-button" onClick={() => setPage(1)}>Buscar</button></div></div>
    <div className="clients-results-row"><p className="clients-results-count">{filtered.length} cliente{filtered.length === 1 ? "" : "s"}</p></div>
    {loading ? <div className="clients-empty-state"><LoaderCircle className="clients-empty-icon" size={24} /><p className="clients-empty-title">Carregando clientes...</p></div> : error ? <div className="clients-empty-state"><AlertCircle className="clients-empty-icon" size={24} /><p className="clients-empty-title">Não foi possível carregar os clientes</p><p className="clients-empty-text">{error}</p><button onClick={loadClients} className="clients-empty-clear">Tentar novamente</button></div> : visible.length === 0 ? <div className="clients-empty-state"><Users className="clients-empty-icon" size={24} /><p className="clients-empty-title">Nenhum cliente encontrado</p></div> : <div className="clients-grid">{visible.map((client) => <ClientCard key={client.id} client={client} onClick={() => navigate(`/app/clientes/${client.id}`)} actions={<><button aria-label={`Editar ${client.name}`} title="Editar" onClick={(event) => { event.stopPropagation(); navigate(`/app/clientes/${client.id}/editar`); }}><Pencil size={15} /></button><button aria-label={`Excluir ${client.name}`} title="Excluir" onClick={(event) => { event.stopPropagation(); handleDelete(client); }}><Trash2 size={15} /></button></>} />)}</div>}
    {!loading && visible.length > 0 && <PaginationBar page={safePage} total={totalPages} onPage={setPage} />}
  </div>;
}
