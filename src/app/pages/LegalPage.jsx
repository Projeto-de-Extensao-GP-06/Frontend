import { useEffect } from "react";
import { ArrowLeft, Scale } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import "../../styles/legal-page.css";

const privacySections = [
  ["1. Quem somos", "A Thauany Bezerra Advocacia, inscrita no CNPJ sob o n° 65.073.469/0001-04, representada por Thauany dos Santos Bezerra, é a responsável pelo tratamento dos dados pessoais descritos nesta política."],
  ["2. Dados coletados", "Podemos coletar os dados preenchidos no formulário de contato, como nome, e-mail, telefone, estado, número do processo e a descrição da situação. Também podem ser recebidos dados e documentos relacionados ao processo para análise jurídica."],
  ["3. Finalidades do tratamento", "Os dados são utilizados para entrar em contato com a pessoa interessada, compreender e analisar o caso, avaliar a possibilidade de atuação profissional e organizar uma base de dados para gerenciamento dos atendimentos e processos."],
  ["4. Compartilhamento e acesso", "O acesso é restrito à advogada responsável e aos funcionários autorizados que precisam dessas informações para executar suas atividades. Não comercializamos dados pessoais."],
  ["5. Armazenamento e exclusão", "Os dados serão mantidos enquanto forem necessários para as finalidades informadas ou até que a pessoa titular solicite sua exclusão. A exclusão poderá ser solicitada pelo canal de contato indicado nesta página, ressalvadas as hipóteses em que a conservação seja necessária para cumprir obrigação legal, regulatória ou exercer direitos."],
  ["6. Direitos da pessoa titular", "A pessoa titular pode solicitar confirmação da existência de tratamento, acesso, correção, atualização, informação sobre o uso dos dados e exclusão, quando aplicável. As solicitações serão avaliadas conforme a legislação e poderão exigir confirmação de identidade."],
  ["7. Segurança", "Adotamos medidas administrativas e técnicas compatíveis com a natureza dos dados para reduzir riscos de acesso não autorizado, perda, alteração ou divulgação indevida. Nenhum sistema é totalmente livre de riscos."],
  ["8. Cookies e tecnologias semelhantes", "Esta versão do site não define o uso de cookies de publicidade ou ferramentas de análise. Caso essas tecnologias sejam adicionadas, esta política deverá ser atualizada para explicar sua finalidade e as opções disponíveis."],
  ["9. Contato", "Para dúvidas ou solicitações relacionadas aos dados pessoais, entre em contato pelo e-mail thauany@thauanybezerra.adv.br."],
  ["10. Atualizações", "Esta política poderá ser atualizada para refletir mudanças no tratamento de dados, na legislação ou nos serviços oferecidos. Última atualização: 16 de agosto de 2026."]
];

const termsSections = [
  ["1. Sobre o site", "O site da Thauany Bezerra Advocacia apresenta informações institucionais, áreas de atuação e um canal inicial para contato. O preenchimento do formulário não cria, por si só, relação advogado-cliente, contrato de honorários ou obrigação de aceitação do caso."],
  ["2. Informações enviadas", "A pessoa usuária se compromete a fornecer informações verdadeiras, atuais e suficientes para o contato. Não envie dados de terceiros ou documentos que não possam ser compartilhados legitimamente."],
  ["3. Análise e aceitação do caso", "As informações recebidas serão analisadas para verificar a possibilidade de atendimento. A advogada poderá solicitar esclarecimentos, recusar a atuação ou indicar que a pessoa procure outro profissional. O envio do formulário não garante retorno ou aceitação do processo."],
  ["4. Uso adequado", "É proibido utilizar o site para enviar conteúdo ilícito, ofensivo, fraudulento, malicioso ou que viole direitos de terceiros, bem como tentar comprometer sua disponibilidade, segurança ou funcionamento."],
  ["5. Propriedade intelectual", "Os textos, identidade visual, logotipo e demais elementos do site pertencem à responsável ou são utilizados com autorização. Sua reprodução ou utilização comercial depende de autorização prévia, salvo as hipóteses permitidas por lei."],
  ["6. Disponibilidade e informações jurídicas", "Empregamos esforços para manter o site disponível e as informações corretas, mas conteúdos institucionais não substituem consulta jurídica individualizada. A disponibilidade poderá ser interrompida para manutenção ou por fatores externos."],
  ["7. Privacidade", "O tratamento das informações enviadas pelo site segue a Política de Privacidade. Ao utilizar o formulário, a pessoa usuária declara que leu as informações aplicáveis e concorda com o tratamento necessário ao atendimento inicial."],
  ["8. Alterações", "Estes Termos de Uso podem ser atualizados a qualquer momento. A versão publicada nesta página será a aplicável a partir de sua disponibilização."],
  ["9. Legislação e contato", "Estes termos serão interpretados de acordo com a legislação brasileira. Dúvidas podem ser encaminhadas para thauany@thauanybezerra.adv.br. O foro competente deverá ser confirmado na revisão jurídica da versão definitiva."],
  ["10. Vigência", "Última atualização: 16 de agosto de 2026."]
];

export default function LegalPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isPrivacy = pathname === "/politica-de-privacidade";
  const sections = isPrivacy ? privacySections : termsSections;
  const title = isPrivacy ? "Política de Privacidade" : "Termos de Uso";
  const description = isPrivacy
    ? "Como a Thauany Bezerra Advocacia coleta, utiliza, armazena e protege dados pessoais."
    : "Regras para utilização do site e envio de informações para contato inicial.";

  useEffect(() => {
    document.title = `SGPJ | ${title}`;
    window.scrollTo(0, 0);
  }, [title]);

  const handleBack = (e) => {
    e.preventDefault();
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return <main className="legal-page">
    <header className="legal-page__header">
      <div className="legal-page__header-inner">
        <Link to="/" onClick={handleBack} className="legal-page__back"><ArrowLeft size={17} /> Voltar ao site</Link>
        <div className="legal-page__brand"><Scale size={22} /> Thauany Bezerra Advocacia</div>
      </div>
    </header>
    <article className="legal-page__article">
      <p className="legal-page__eyebrow">Documento institucional</p>
      <h1>{title}</h1>
      <p className="legal-page__intro">{description}</p>
      {sections.map(([heading, text]) => <section key={heading} className="legal-page__section">
        <h2>{heading}</h2>
        <p>{text}</p>
      </section>)}
      <Link to="/" onClick={handleBack} className="legal-page__return">Voltar para o site</Link>
    </article>
  </main>;
}