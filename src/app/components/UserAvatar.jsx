export const avatarPalette = [
  { bg: "user-avatar--blue", text: "user-avatar-text--blue" },
  { bg: "user-avatar--gold", text: "user-avatar-text--gold" },
  { bg: "user-avatar--green", text: "user-avatar-text--green" },
  { bg: "user-avatar--amber", text: "user-avatar-text--amber" },
];

export const getInitials = (name = "") => {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export function UserAvatar({ name = "", size = "md", className = "" }) {
  const initials = getInitials(name);
  const idx = name ? name.charCodeAt(0) % avatarPalette.length : 0;
  const { bg, text } = avatarPalette[idx] || avatarPalette[0];

  const sizeClass = size === "lg" ? "is-lg" : size === "sm" ? "is-sm" : "is-md";

  return (
    <div className={`user-avatar ${sizeClass} ${bg} ${className}`.trim()}>
      <span className={`user-avatar-initials ${text}`}>{initials}</span>
    </div>
  );
}

export default UserAvatar;
