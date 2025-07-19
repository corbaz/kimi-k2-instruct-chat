### Next.js mit Tailwind CSS 4 und shadcn (2025) installieren

Hier findest du eine übersichtliche Schritt-für-Schritt-Anleitung, um ein modernes Next.js-Projekt mit Tailwind CSS v4 und shadcn/ui (2025) aufzusetzen.

#### 1. Next.js-Projekt erstellen

```bash
npx create-next-app@latest mein-projekt --typescript --eslint --app
cd mein-projekt
```
Dies erstellt ein neues Projekt mit TypeScript und aktiviert den App Router[1].

#### 2. Tailwind CSS 4 und PostCSS installieren

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```
Tailwind v4 nutzt standardmäßig die neue PostCSS-basierte Konfiguration (kein `tailwind.config.js` mehr notwendig)[2][3][1].

#### 3. PostCSS-Konfiguration erstellen

Erstelle im Projektstamm die Datei `postcss.config.mjs` mit folgendem Inhalt:

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```
Keine weitere Tailwind-Konfiguration nötig. Tailwind erkennt deinen App-Code automatisch[2][1][4].

#### 4. Tailwind ins globale CSS importieren

Füge in deiner globalen CSS-Datei (z. B. `app/globals.css`) hinzu:

```css
@import "tailwindcss";
```
Das ersetzt die früheren Tailwind-Direktiven wie `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`[2][3][1].

#### 5. shadcn/ui installieren & konfigurieren

Ab 2025 gibt es zwei Wege: Automatisch per CLI (empfohlen) oder Komponenten manuell kopieren[5][6][7][8].

##### a) CLI-Methode (empfohlen)

```bash
pnpm dlx shadcn@latest init
```
Folge im Prompt den Anweisungen. Wähle „Next.js“ als Integration und bestätige die Einrichtung[5][6].

##### b) Einzelne shadcn-Komponenten hinzufügen

Beispiel für einen Button:

```bash
pnpm dlx shadcn@latest add button
```
Die Komponente wird nach `/components/ui/button.tsx` kopiert und kann direkt importiert werden:

```js
import { Button } from "@/components/ui/button";
```
Du kannst alle weiteren shadcn-Komponenten analog hinzufügen[5][6][9].

#### 6. Shadcn & Tailwind v4 zusammenbringen

Die neuen shadcn/ui-Komponenten unterstützen direkt Tailwind v4 – inklusive neuer Theme- und Farbvariablen. Das Einbinden erfolgt meist automatisch, bei Bedarf kannst du CSS-Variablen in deiner `globals.css` oder einer eigenen `shadcn.css` Datei hinzufügen[7][4][8].

Beispiel für Variable-Definition in `globals.css`:

```css
@import "tailwindcss";

/* Shadcn UI CSS Variablen */
:root {
  --background: hsl(224 71% 4%);
  --foreground: hsl(213 31% 91%);
  /* weitere Variablen ... */
}
@theme {
  --radius: 0.5rem;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* weitere Mappings ... */
}
```
Dadurch funktionieren Theme- und Farbvarianten von shadcn/ui out-of-the-box[7][4][8].

#### 7. Entwicklung starten

Starte den lokalen Entwickler-Server:

```bash
npm run dev
```

Erstelle eine Beispielseite in `app/page.tsx`:

```tsx
import { Button } from "@/components/ui/button";

export default function Home() {
  return Hallo Next.js 15 + Tailwind 4 + shadcn/ui!;
}
```

### Hinweise

- **Kein tailwind.config.js mehr:** Tailwind CSS v4 benötigt diesen standardmäßig nicht mehr[1][10].
- **shadcn/ui** ist voll kompatibel mit Tailwind 4, React 19 und den neuesten Next.js-Releases[8][11].
- **pnpm** ist für die CLI-Tools empfohlen, npm geht aber auch.
- **Weitere Komponenten** kannst du jederzeit per CLI hinzufügen.

Mit diesen Schritten hast du ein topaktuelles Next.js-Setup mit Tailwind CSS 4 und shadcn/ui für 2025 – perfekt für moderne, performante Frontends[2][1][5][8].

[1] https://www.linkedin.com/pulse/setting-up-tailwind-css-v4-nextjs-sitesh-kumar-hrbcc
[2] https://tailwindcss.com/docs/guides/nextjs
[3] https://nextjs.org/docs/app/guides/tailwind-css
[4] https://www.shadcnblocks.com/blog/tailwind4-shadcn-themeing/
[5] https://v3.shadcn.com/docs/installation/next
[6] https://ui.shadcn.com/docs/installation/next
[7] https://www.luisball.com/blog/shadcn-ui-with-tailwind-v4
[8] https://ui.shadcn.com/docs/tailwind-v4
[9] https://peerlist.io/blog/engineering/how-to-use-shadcn-ui-with-nextjs
[10] https://www.reddit.com/r/nextjs/comments/1he510l/nextjs_tailwind_css_v4_no_config_hassle/
[11] https://www.reddit.com/r/nextjs/comments/1jt9i3m/master_the_2025_stack_complete_guide_to_nextjs_15/
[12] https://ayushkhatri.hashnode.dev/how-to-install-tailwind-css-v4-in-nextjs-step-by-step-guide
[13] https://nextjs.org/docs/pages/guides/tailwind-css
[14] https://themeselection.com/nextjs-tailwind-config/
[15] https://www.swhabitation.com/blogs/how-to-install-shadcn-with-nextjs-14-a-step-by-step-guide
[16] https://www.youtube.com/watch?v=Jol0vCitur4
[17] https://www.youtube.com/watch?v=6s_Xm-wWhB4
[18] https://dev.to/darshan_bajgain/setting-up-2025-nextjs-15-with-shadcn-tailwind-css-v4-no-config-needed-dark-mode-5kl
[19] https://ui.shadcn.com/docs/installation
[20] https://www.youtube.com/watch?v=ctAl4eCCtJ4