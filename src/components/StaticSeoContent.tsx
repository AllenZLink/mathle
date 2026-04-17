import { GAME_MODES, type GameMode } from "@/lib/game";
import { homeMessages, modePageMessages, type Locale } from "@/messages";

type ExampleColor = "green" | "yellow" | "gray" | "blank";

const examples: Array<{
  messageKey: "seo.exampleGreen" | "seo.exampleYellow" | "seo.exampleGray";
  cells: string[];
  colors: ExampleColor[];
}> = [
  {
    messageKey: "seo.exampleGreen",
    cells: ["4", "1", "+", "5", "4", "0", "9", "5"],
    colors: ["blank", "blank", "green", "blank", "blank", "blank", "blank", "blank"]
  },
  {
    messageKey: "seo.exampleYellow",
    cells: ["8", "0", "4", "-", "6", "7", "9", "8"],
    colors: ["blank", "blank", "blank", "blank", "yellow", "blank", "blank", "blank"]
  },
  {
    messageKey: "seo.exampleGray",
    cells: ["1", "7", "+", "8", "5", "1", "0", "2"],
    colors: ["blank", "blank", "blank", "blank", "gray", "blank", "blank", "blank"]
  }
];

type StaticSeoContentProps = Readonly<{
  locale: Locale;
  mode?: GameMode;
}>;

export default function StaticSeoContent({ locale, mode }: StaticSeoContentProps) {
  const homeCopy = homeMessages[locale];
  const seoMode = mode ?? GAME_MODES.DAILY;
  const modeCopy = modePageMessages[locale][seoMode];

  return (
    <main className="content-panel">
      <h1 className="page-title">{mode ? modeCopy["seo.heading"] : homeCopy["seo.heading"]}</h1>
      <p className="body-copy mb-5">{mode ? modeCopy["seo.intro"] : homeCopy["seo.intro"]}</p>
      <section className="mb-6">
        <h2 className="section-title">{homeCopy["seo.howToPlayHeading"]}</h2>
        <p className="body-copy">{homeCopy["seo.howToPlay"]}</p>
        <div className="how-to-list">
          {[
            ["seo.howToPlayRule1Title", "seo.howToPlayRule1"],
            ["seo.howToPlayRule2Title", "seo.howToPlayRule2"],
            ["seo.howToPlayRule3Title", "seo.howToPlayRule3"],
            ["seo.howToPlayRule4Title", "seo.howToPlayRule4"],
            ["seo.howToPlayRule5Title", "seo.howToPlayRule5"]
          ].map(([titleKey, bodyKey]) => (
            <div className="how-to-item" key={titleKey}>
              <h3>{homeCopy[titleKey as keyof typeof homeCopy]}</h3>
              <p>{homeCopy[bodyKey as keyof typeof homeCopy]}</p>
            </div>
          ))}
        </div>
        <div className="how-to-examples">
          <h3>{homeCopy["seo.examplesHeading"]}</h3>
          {examples.map((example) => (
            <div className="how-to-example" key={example.messageKey}>
              <div className="example-equation" aria-label={`${example.cells.slice(0, 5).join("")} equals ${example.cells.slice(5).join("")}`}>
                {example.cells.slice(0, 5).map((cell, index) => (
                  <div className={`example-cell example-cell-${example.colors[index]}`} key={`${example.messageKey}-${index}`}>
                    {cell}
                  </div>
                ))}
                <div className="example-equals">=</div>
                {example.cells.slice(5).map((cell, offset) => {
                  const index = offset + 5;
                  return (
                    <div className={`example-cell example-cell-${example.colors[index]}`} key={`${example.messageKey}-${index}`}>
                      {cell}
                    </div>
                  );
                })}
              </div>
              <p>{homeCopy[example.messageKey]}</p>
            </div>
          ))}
          <div className="color-mode-comparison">
            <div className="color-mode-group">
              <h4>{homeCopy["seo.standardColorsHeading"]}</h4>
              <div className="color-swatch-row">
                <span className="color-swatch color-swatch-green">{homeCopy["seo.colorCorrect"]}</span>
                <span className="color-swatch color-swatch-yellow">{homeCopy["seo.colorPresent"]}</span>
                <span className="color-swatch color-swatch-gray">{homeCopy["seo.colorAbsent"]}</span>
              </div>
            </div>
            <div className="color-mode-group">
              <h4>{homeCopy["seo.colorBlindColorsHeading"]}</h4>
              <div className="color-swatch-row">
                <span className="color-swatch color-swatch-amber">{homeCopy["seo.colorCorrect"]}</span>
                <span className="color-swatch color-swatch-blue">{homeCopy["seo.colorPresent"]}</span>
                <span className="color-swatch color-swatch-gray">{homeCopy["seo.colorAbsent"]}</span>
              </div>
              <p>{homeCopy["seo.colorBlindPalette"]}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="mb-6">
        <h2 className="section-title">{homeCopy["seo.modesHeading"]}</h2>
        <p className="body-copy">{mode ? modeCopy["seo.feature"] : homeCopy["seo.modes"]}</p>
      </section>
      <section className="mb-6">
        <h2 className="section-title">{homeCopy["seo.faqHeading"]}</h2>
        <div className="faq-list">
          {[
            ["seo.faqQuestion1", "seo.faqAnswer1"],
            ["seo.faqQuestion2", "seo.faqAnswer2"],
            ["seo.faqQuestion3", "seo.faqAnswer3"],
            ["seo.faqQuestion4", "seo.faqAnswer4"],
            ["seo.faqQuestion5", "seo.faqAnswer5"],
            ["seo.faqQuestion6", "seo.faqAnswer6"],
            ["seo.faqQuestion7", "seo.faqAnswer7"]
          ].map(([questionKey, answerKey]) => (
            <div className="faq-item" key={questionKey}>
              <h3>{homeCopy[questionKey as keyof typeof homeCopy]}</h3>
              <p>{homeCopy[answerKey as keyof typeof homeCopy]}</p>
            </div>
          ))}
        </div>
      </section>
      <noscript>
        <p className="mt-6 rounded border border-blue-200 bg-blue-50 p-4">
          {homeCopy["seo.noscript"]}
        </p>
      </noscript>
    </main>
  );
}
