Logos usadas nas páginas principais do site
============================================

Coloque nesta pasta (public/) os seguintes arquivos:

  logo-cij.jpg     (ou .png) - Centro Integrado de Joelho (C I J + ícone do joelho)
  logo-dr-juarez.png         - Dr. Juarez Sebastian - Ortopedia e Cirurgia do Joelho
  logo-sote.png             - Hospital SOTE (parceiro, exibido no rodapé)

Tamanhos usados no site:
  - Sidebar (menu): pequeno (~32px altura)
  - Header TCLE / Questionários: grande (~64px)
  - Header EVA/IKDC/KOOS: pequeno (~32px)
  - Footer: grande (~64px) + logo SOTE quando disponível

Se logo-sote.png não existir, altere em DashboardLayout.tsx: showSote={false}.
