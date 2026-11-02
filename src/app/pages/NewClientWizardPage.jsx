import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, UserRound } from "lucide-react";
import { clienteService, getClienteError } from "../services/clienteService";
import { maskCPF, maskCNPJ, maskPhone, maskCEP } from "../utils/masks";
import { useCepLookup } from "../hooks/useCepLookup";
import "../../styles/new-client-wizard-page.css";

const EMPTY_ADDRESS = {
  cep: "",
  logradouro: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "SP",
  complemento: ""
};

const EMPTY_CONTACT = { name: "", email: "", phone: "", profession: "" };

const STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO"
];

const createEmptyForm = (type) => ({
  type,
  name: "",
  document: "",
  rg: "",
  comoConheceu: "INDICACAO",
  statusClienteId: 1,
  address: { ...EMPTY_ADDRESS },
  contacts: [{ ...EMPTY_CONTACT }]
});

const Field = ({ label, children, className = "" }) => (
  <label className={`wizard-field ${className}`.trim()}>
    <span className="wizard-field__label">{label}</span>
    {children}
  </label>
);

function ContactFields({ contact, index, onChange, onRemove, canRemove }) {
  return (
    <section className={`wizard-contact ${index === 0 ? "wizard-contact--primary" : ""}`}>
      <div className="wizard-contact__header">
        <p className="wizard-contact__title">
          {index === 0 ? "Contato Principal" : `Contato adicional ${index}`}
        </p>
        {canRemove && (
          <button
            type="button"
            className="wizard-contact__remove"
            onClick={() => onRemove(index)}
            aria-label={`Remover contato ${index + 1}`}
          >
            <Trash2 size={17} />
          </button>
        )}
      </div>
      <div className="wizard-form-grid">
        <Field label="Nome" className="wizard-form-grid__full">
          <input
            className="wizard-input"
            autoComplete="name"
            placeholder="Nome do contato"
            required
            maxLength={150}
            value={contact.name}
            onChange={(event) => onChange(index, "name", event.target.value)}
          />
        </Field>
        <Field label="E-mail" className="wizard-form-grid__full">
          <input
            className="wizard-input"
            type="email"
            autoComplete="email"
            placeholder="email@empresa.com"
            required
            maxLength={255}
            value={contact.email}
            onChange={(event) => onChange(index, "email", event.target.value)}
          />
        </Field>
        <Field label="Telefone" className="wizard-form-grid__full">
          <input
            className="wizard-input"
            type="tel"
            autoComplete="tel"
            placeholder="(00) 00000-0000"
            required
            maxLength={20}
            value={contact.phone}
            onChange={(event) => onChange(index, "phone", maskPhone(event.target.value))}
          />
        </Field>
        <Field label="Profissão / Cargo" className="wizard-form-grid__full">
          <input
            className="wizard-input"
            placeholder="Ex.: Diretor, Gerente..."
            maxLength={100}
            value={contact.profession}
            onChange={(event) => onChange(index, "profession", event.target.value)}
          />
        </Field>
      </div>
    </section>
  );
}

export default function NewClientWizardPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => createEmptyForm(""));
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const cepLookup = useCepLookup(form.address.cep, Boolean(form.type));
  const sanitizedCep = form.address.cep.replace(/\D/g, "");
  const isCurrentCepLookup = cepLookup.requestedCep === sanitizedCep;
  const addressLookup = isCurrentCepLookup ? cepLookup.data : null;
  const isPF = form.type === "PF";
  const steps = isPF
    ? [{ label: "Cliente" }, { label: "Endereço" }]
    : [{ label: "Empresa" }, { label: "Endereço" }, { label: "Contatos" }];
  const stepIndex = step - 1;
  const isTypeSelection = step === 0;
  const isAddressStep = step > 0 && steps[stepIndex]?.label === "Endereço";
  const isContactsStep = !isPF && steps[stepIndex]?.label === "Contatos";
  const lastStep = steps.length;

  useEffect(() => {
    document.title = "SGPJ | Novo Cliente";
  }, []);

  useEffect(() => {
    if (!cepLookup.data || !isCurrentCepLookup) return;

    setForm((current) => ({
      ...current,
      address: {
        ...current.address,
        logradouro: cepLookup.data.logradouro || "",
        bairro: cepLookup.data.bairro || "",
        cidade: cepLookup.data.localidade || "",
        estado: cepLookup.data.uf || "SP"
      }
    }));
  }, [cepLookup.data, isCurrentCepLookup]);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };
  const setAddress = (field, value) => {
    setForm((current) => ({
      ...current,
      address: { ...current.address, [field]: value }
    }));
  };
  const setContact = (index, field, value) => {
    setForm((current) => ({
      ...current,
      contacts: current.contacts.map((contact, contactIndex) =>
        contactIndex === index ? { ...contact, [field]: value } : contact
      )
    }));
  };
  const addContact = () => {
    setForm((current) => ({
      ...current,
      contacts: [...current.contacts, { ...EMPTY_CONTACT }]
    }));
  };
  const removeContact = (index) => {
    setForm((current) => ({
      ...current,
      contacts: current.contacts.filter((_, contactIndex) => contactIndex !== index)
    }));
  };

  const selectType = (type) => {
    setForm(createEmptyForm(type));
    setStep(1);
    setError("");
  };

  const goBack = () => {
    if (isTypeSelection) {
      navigate("/app/clientes");
      return;
    }
    if (step === 1) {
      setStep(0);
      setError("");
      return;
    }
    setStep((current) => current - 1);
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (step < lastStep) {
      setStep((current) => current + 1);
      return;
    }

    setSaving(true);
    try {
      const request = isPF
        ? {
            ...form,
            contacts: form.contacts.map((contact, index) => (
              index === 0 ? { ...contact, name: form.name } : contact
            ))
          }
        : form;
      const saved = await clienteService.create(request);
      navigate(`/app/clientes/${saved.id}`);
    } catch (requestError) {
      setError(getClienteError(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="wizard-page">
      <button type="button" className="wizard-back" onClick={goBack}>
        <ArrowLeft size={17} />
        {isTypeSelection ? "Clientes" : step === 1 ? "Tipo de Cliente" : steps[stepIndex - 1]?.label}
      </button>

      <header className="wizard-header">
        <p className="wizard-breadcrumb">Clientes <span>›</span> Novo Cliente</p>
        <h1 className="wizard-title">
          {isTypeSelection ? "Novo Cliente" : `Novo Cliente ${isPF ? "PF" : "PJ"}`}
        </h1>
        <p className="wizard-subtitle">
          {isTypeSelection
            ? "Selecione o tipo de documento do cliente:"
            : isAddressStep
              ? `Informe o endereço ${isPF ? "do cliente" : "da empresa"}:`
              : isContactsStep
                ? "Adicione os contatos da empresa:"
                : "Preencha os dados do cliente:"}
        </p>
      </header>

      {isTypeSelection ? (
        <div className="wizard-type-grid">
          <button
            type="button"
            className="wizard-type-btn wizard-type-btn--pf"
            onClick={() => selectType("PF")}
          >
            <span className="wizard-type-btn__badge">
              <span className="wizard-type-btn__badge-text">CPF</span>
            </span>
            <span className="wizard-type-btn__copy">
              <span className="wizard-type-btn__title">Pessoa Física</span>
              <span className="wizard-type-btn__sub">Documento CPF</span>
            </span>
          </button>
          <button
            type="button"
            className="wizard-type-btn wizard-type-btn--pj"
            onClick={() => selectType("PJ")}
          >
            <span className="wizard-type-btn__badge">
              <span className="wizard-type-btn__badge-text">CNPJ</span>
            </span>
            <span className="wizard-type-btn__copy">
              <span className="wizard-type-btn__title">Pessoa Jurídica</span>
              <span className="wizard-type-btn__sub">Documento CNPJ</span>
            </span>
          </button>
        </div>
      ) : (
        <>
          <nav className="wizard-steps" aria-label="Etapas do cadastro">
            {steps.map((item, index) => {
              const number = index + 1;
              const isComplete = number < step;
              const isActive = number === step;
              return (
                <div className="wizard-steps__item" key={item.label}>
                  <button
                    type="button"
                    className="wizard-steps__node"
                    onClick={() => number < step && setStep(number)}
                    disabled={number >= step}
                    aria-current={isActive ? "step" : undefined}
                    aria-label={`${number}. ${item.label}${isComplete ? ", concluída" : isActive ? ", atual" : ""}`}
                  >
                    <span className={`wizard-steps__circle ${isComplete ? "wizard-steps__circle--done" : isActive ? "wizard-steps__circle--active" : "wizard-steps__circle--pending"}`}>
                      {isComplete ? <Check size={16} aria-hidden="true" /> : number}
                    </span>
                    <span className={`wizard-steps__label ${isActive ? "wizard-steps__label--active" : ""}`}>
                      {item.label}
                    </span>
                  </button>
                  {index < steps.length - 1 && (
                    <span className={`wizard-steps__connector ${isComplete ? "wizard-steps__connector--done" : ""}`} />
                  )}
                </div>
              );
            })}
          </nav>

          <form className="wizard-form" onSubmit={submit}>
            {isAddressStep ? (
              <div className="wizard-form-grid">
                <Field label="CEP" className="wizard-form-grid__full">
                  <input
                    className="wizard-input wizard-input--mono"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    placeholder="00000-000"
                    maxLength={9}
                    value={form.address.cep}
                    onChange={(event) => setAddress("cep", maskCEP(event.target.value))}
                  />
                </Field>
                {cepLookup.loading && isCurrentCepLookup && (
                  <p className="wizard-cep-status wizard-form-grid__full" role="status">Buscando endereço...</p>
                )}
                {cepLookup.error && isCurrentCepLookup && (
                  <p className="wizard-cep-status wizard-cep-status--error wizard-form-grid__full" role="alert">
                    {cepLookup.error}
                  </p>
                )}
                <Field label="Logradouro" className="wizard-form-grid__full">
                  <input
                    className="wizard-input"
                    autoComplete="address-line1"
                    placeholder="Rua, Avenida..."
                    required
                    maxLength={150}
                    disabled={Boolean(addressLookup?.logradouro)}
                    value={form.address.logradouro}
                    onChange={(event) => setAddress("logradouro", event.target.value)}
                  />
                </Field>
                <Field label="Número">
                  <input
                    className="wizard-input"
                    placeholder="00"
                    required
                    maxLength={10}
                    value={form.address.numero}
                    onChange={(event) => setAddress("numero", event.target.value)}
                  />
                </Field>
                <Field label="Complemento">
                  <input
                    className="wizard-input"
                    autoComplete="address-line2"
                    placeholder="Apto, Sala..."
                    maxLength={150}
                    value={form.address.complemento}
                    onChange={(event) => setAddress("complemento", event.target.value)}
                  />
                </Field>
                <Field label="Bairro" className="wizard-form-grid__full">
                  <input
                    className="wizard-input"
                    autoComplete="address-level3"
                    placeholder="Bairro"
                    required
                    maxLength={100}
                    disabled={Boolean(addressLookup?.bairro)}
                    value={form.address.bairro}
                    onChange={(event) => setAddress("bairro", event.target.value)}
                  />
                </Field>
                <Field label="Cidade" className="wizard-form-grid__city">
                  <input
                    className="wizard-input"
                    autoComplete="address-level2"
                    placeholder="Cidade"
                    required
                    maxLength={100}
                    disabled={Boolean(addressLookup?.localidade)}
                    value={form.address.cidade}
                    onChange={(event) => setAddress("cidade", event.target.value)}
                  />
                </Field>
                <Field label="Estado" className="wizard-form-grid__state">
                  <select
                    className="wizard-input"
                    autoComplete="address-level1"
                    required
                    disabled={Boolean(addressLookup?.uf)}
                    value={form.address.estado}
                    onChange={(event) => setAddress("estado", event.target.value)}
                  >
                    {STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                  </select>
                </Field>
              </div>
            ) : isContactsStep ? (
              <div className="wizard-contacts">
                {form.contacts.map((contact, index) => (
                  <ContactFields
                    key={index}
                    contact={contact}
                    index={index}
                    onChange={setContact}
                    onRemove={removeContact}
                    canRemove={index > 0}
                  />
                ))}
                <button type="button" className="wizard-add-contact" onClick={addContact}>
                  <Plus size={18} />
                  Adicionar outro contato
                </button>
              </div>
            ) : (
              <div className="wizard-form-grid">
                <Field label={isPF ? "CPF" : "CNPJ"} className="wizard-form-grid__full">
                  <input
                    className="wizard-input wizard-input--mono"
                    autoComplete="off"
                    inputMode="numeric"
                    placeholder={isPF ? "000.000.000-00" : "00.000.000/0000-00"}
                    required
                    maxLength={isPF ? 14 : 18}
                    value={form.document}
                    onChange={(event) => setField("document", isPF ? maskCPF(event.target.value) : maskCNPJ(event.target.value))}
                  />
                </Field>
                {isPF && (
                  <Field label="RG" className="wizard-form-grid__full">
                    <input
                      className="wizard-input wizard-input--mono"
                      autoComplete="off"
                      placeholder="00.000.000-0"
                      maxLength={15}
                      value={form.rg}
                      onChange={(event) => setField("rg", event.target.value)}
                    />
                  </Field>
                )}
                <Field label={isPF ? "Nome Completo" : "Nome / Razão Social"} className="wizard-form-grid__full">
                  <input
                    className="wizard-input"
                    autoComplete="name"
                    placeholder={isPF ? "Nome do cliente" : "Nome da empresa"}
                    required
                    maxLength={150}
                    value={form.name}
                    onChange={(event) => setField("name", event.target.value)}
                  />
                </Field>
                {isPF ? (
                  <>
                    <Field label="E-mail" className="wizard-form-grid__full">
                      <input
                        className="wizard-input"
                        type="email"
                        autoComplete="email"
                        placeholder="email@exemplo.com"
                        required
                        maxLength={255}
                        value={form.contacts[0].email}
                        onChange={(event) => setContact(0, "email", event.target.value)}
                      />
                    </Field>
                    <Field label="Telefone" className="wizard-form-grid__full">
                      <input
                        className="wizard-input"
                        type="tel"
                        autoComplete="tel"
                        placeholder="(00) 00000-0000"
                        required
                        maxLength={20}
                        value={form.contacts[0].phone}
                        onChange={(event) => setContact(0, "phone", maskPhone(event.target.value))}
                      />
                    </Field>
                    <Field label="Profissão" className="wizard-form-grid__full">
                      <input
                        className="wizard-input"
                        placeholder="Ex.: Engenheiro, Médico..."
                        maxLength={100}
                        value={form.contacts[0].profession}
                        onChange={(event) => setContact(0, "profession", event.target.value)}
                      />
                    </Field>
                    {form.contacts.length > 1 && form.contacts.slice(1).map((contact, index) => (
                      <div className="wizard-form-grid__full" key={index + 1}>
                        <ContactFields
                          contact={contact}
                          index={index + 1}
                          onChange={setContact}
                          onRemove={removeContact}
                          canRemove
                        />
                      </div>
                    ))}
                    <button type="button" className="wizard-add-contact wizard-form-grid__full" onClick={addContact}>
                      <Plus size={18} />
                      Adicionar outro contato
                    </button>
                  </>
                ) : null}
              </div>
            )}

            {error && <p className="wizard-error" role="alert">{error}</p>}

            <div className="wizard-actions">
              {step > 1 ? (
                <button type="button" className="wizard-action wizard-action--outline" onClick={goBack}>
                  <ArrowLeft size={17} />
                  Voltar
                </button>
              ) : (
                <button type="button" className="wizard-action wizard-action--outline" onClick={() => navigate("/app/clientes")}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="wizard-action wizard-action--primary" disabled={saving}>
                {saving ? "Salvando..." : step === lastStep ? (
                  <><UserRound size={17} /> Criar cliente</>
                ) : (
                  <>Próximo <ArrowRight size={17} /></>
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </main>
  );
}
