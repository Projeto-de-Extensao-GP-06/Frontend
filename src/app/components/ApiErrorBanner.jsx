/**
 * Banner de erro para exibir mensagens de falha retornadas pela API.
 * Reutilizado em LoginPage e PasswordResetPage.
 */
export function ApiErrorBanner({ message }) {
    if (!message) return null;

    return (
        <div
            role="alert"
            style={{
                backgroundColor: "rgba(220, 38, 38, 0.15)",
                border: "1px solid rgba(220, 38, 38, 0.4)",
                borderRadius: "0.625rem",
                padding: "0.625rem 0.875rem",
                color: "#fca5a5",
                fontSize: "0.8125rem",
                textAlign: "center",
                marginBottom: "1rem",
            }}
        >
            {message}
        </div>
    );
}
