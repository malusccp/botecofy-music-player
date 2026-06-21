/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta extraída da logo do Botecofy (tema claro, cores de bandeira/boteco).
        boteco: {
          // --- Tema "A Mesa do Boteco": dark mode QUENTE da marca (formato estilo
          //     app de música, cores 100% Botecofy). Marinho profundo + porta-copos
          //     de madeira/cortiça + brilhos de cerveja. ---
          base: "#0E1533", // fundo do app (marinho quente profundo), atrás dos painéis
          panel: "#151C40", // sidebar, top bar, player
          card: "#2B211A", // cards = "porta-copos" de madeira/cortiça quente
          "card-hover": "#3A2C22", // hover dos cards
          wood: "#7A4A1E", // madeira do balcão (acabamentos do player)
          // texto (off-white/creme quente — nada de cinza frio)
          ink: "#F6EEDC", // texto principal (creme quente)
          muted: "#BCB199", // texto secundário (taupe quente)
          // --- Acentos da marca (inalterados) + variantes claras p/ legibilidade no escuro ---
          yellow: "#FFC400", // amarelo cerveja (cor de marca principal)
          "yellow-dark": "#E0A500",
          green: "#0B8A3D", // verde da logo
          "green-dark": "#0A5E2C",
          "green-light": "#2FD171", // verde claro (play, links no escuro)
          blue: "#1E40AF",
          "blue-bright": "#2949D6", // azul cobalto vibrante (fundo do login)
          "blue-deep": "#16276E", // azul escuro (pattern/marca d'água)
          "blue-light": "#7B93FF",
          red: "#DA2D1F", // vermelho ("FY")
          "red-light": "#FF6F61",
          // --- Papel de boteco (tela de login) — mantém ---
          parchment: "#F4E8CC",
          "parchment-soft": "#FBF3DE",
          brown: "#5B3A21",
          "brown-soft": "#7A5230",
          // --- Aliases legados remapeados p/ o tema escuro (não quebrar classes antigas) ---
          cream: "#0B1542",
          paper: "#15225A",
          surface: "#15225A",
          bg: "#0B1542",
          amber: "#FFC400",
          ember: "#0B8A3D",
        },
      },
      fontFamily: {
        // títulos do app: slab serif robusta (letreiro pintado de boteco)
        display: ['"Zilla Slab"', "Georgia", "serif"],
        // marca "Botecofy": fonte customizada da logo, usada SÓ na tela de login.
        brand: ['"Michelle FLF"', '"Zilla Slab"', "Georgia", "serif"],
        // corpo/formulários: sans humanista amigável
        sans: ['"Nunito"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        boteco: "0 6px 20px -8px rgba(20, 53, 31, 0.25)",
        "boteco-card": "0 18px 40px -16px rgba(11, 23, 70, 0.55)",
      },
      keyframes: {
        // espuma do copo "respirando" devagar
        foam: {
          "0%, 100%": { opacity: "0.9", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
        // ícones do fundo flutuando levemente
        bob: {
          "0%, 100%": { transform: "translateY(0) rotate(var(--rot, 0deg))" },
          "50%": { transform: "translateY(-12px) rotate(var(--rot, 0deg))" },
        },
      },
      animation: {
        foam: "foam 3.2s ease-in-out infinite",
        bob: "bob 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
