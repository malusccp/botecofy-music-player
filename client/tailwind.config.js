/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta extraída da logo do Botecofy (tema claro, cores de bandeira/boteco).
        boteco: {
          cream: "#FFFDF5", // fundo da página (claro)
          paper: "#FFFFFF", // cards / superfícies
          ink: "#14351F", // texto principal (verde bem escuro)
          muted: "#5C6B61", // texto secundário
          yellow: "#FFC400", // amarelo cerveja (cor de marca principal)
          "yellow-dark": "#E0A500",
          green: "#0B8A3D", // verde da logo (texto/linhas)
          "green-dark": "#0A5E2C",
          blue: "#1E40AF", // azul (chinelo/detalhes)
          red: "#DA2D1F", // vermelho ("FY")
          // aliases de compatibilidade com o tema antigo
          bg: "#FFFDF5",
          surface: "#FFFFFF",
          card: "#FFFFFF",
          amber: "#FFC400",
          ember: "#0B8A3D",
        },
      },
      fontFamily: {
        display: ["Georgia", "serif"],
      },
      boxShadow: {
        boteco: "0 6px 20px -8px rgba(20, 53, 31, 0.25)",
      },
    },
  },
  plugins: [],
};
