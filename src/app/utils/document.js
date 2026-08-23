export const getDocBadgeClass = (type) => {
  const t = (type || "").toUpperCase();
  if (t === "PDF") return "edit-process-doc-badge--pdf";
  if (["PNG", "JPG", "JPEG", "WEBP", "GIF", "SVG"].includes(t)) return "edit-process-doc-badge--img";
  if (["DOC", "DOCX"].includes(t)) return "edit-process-doc-badge--doc";
  if (["XLS", "XLSX", "CSV"].includes(t)) return "edit-process-doc-badge--sheet";
  return "edit-process-doc-badge--generic";
};

export const getDocVariant = (type) => {
  const t = (type || "").toUpperCase();
  if (t === "PDF") return "pdf";
  if (["PNG", "JPG", "JPEG", "WEBP", "GIF", "SVG"].includes(t)) return "img";
  if (["DOC", "DOCX"].includes(t)) return "doc";
  if (["XLS", "XLSX", "CSV"].includes(t)) return "sheet";
  return "other";
};
