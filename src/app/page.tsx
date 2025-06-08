import Image from "next/image";

export default function Home() {
  return (
    <div>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 2rem", borderBottom: "1px solid #eee" }}>
      <div style={{ fontWeight: "bold", fontSize: "1.5rem" }}>PhotoEye</div>
      <ul style={{ display: "flex", listStyle: "none", gap: "2rem", margin: 0, padding: 0 }}>
        <li><a href="#" style={{ textDecoration: "none", color: "#333" }}>Home</a></li>
        <li><a href="#" style={{ textDecoration: "none", color: "#333" }}>Features</a></li>
        <li><a href="#" style={{ textDecoration: "none", color: "#333" }}>Pricing</a></li>
        <li><a href="#" style={{ textDecoration: "none", color: "#333" }}>Contact</a></li>
      </ul>
      <button style={{ padding: "0.5rem 1.5rem", background: "#0070f3", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
        Sign In
      </button>
      </nav>
      <div>Landing Page</div>
    </div>
  );
}
