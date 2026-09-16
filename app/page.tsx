export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "#f8fafc",
        color: "#0f172a",
        fontFamily: "Arial, Helvetica, sans-serif",
        textAlign: "center",
      }}
    >
      <div>
        <p style={{ color: "#64748b", letterSpacing: "0.08em" }}>
          NEXT.JS ON VERCEL
        </p>
        <h1 style={{ fontSize: "clamp(3rem, 10vw, 6rem)", margin: "16px 0" }}>
          Hello World!
        </h1>
        <p style={{ color: "#475569", fontSize: "1.125rem" }}>
          Your new app is live.
        </p>
      </div>
    </main>
  );
}
