#!/usr/bin/env node
// Writes the English and German copies of the Camperiada drawings: the Polish
// SVGs in public/camperiada/layers/ with their labels swapped, into layers/en/
// and layers/de/. Run with: node scripts/translate-camperiada-layers.mjs
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "camperiada", "layers");
const LANGS = ["en", "de"];

// Polish label → [English, German]. Kept short so they fit the drawing.
const LABELS = {
  "185 × 130 cm · bagażnik pod spodem": ["185 × 130 cm · storage below", "185 × 130 cm · Stauraum darunter"],
  "Akumulator LiFePO4": ["LiFePO4 battery", "LiFePO4-Batterie"],
  "Aneks kuchenny": ["Kitchen unit", "Küchenzeile"],
  "Dach podnoszony pop-top": ["Pop-top elevating roof", "Aufstelldach (Pop-Top)"],
  "Dach standardowy": ["Standard roof", "Seriendach"],
  "Dach standardowy · wys. 1,99 m": ["Standard roof · height 1.99 m", "Seriendach · Höhe 1,99 m"],
  "Fotel na szynach": ["Seat on rails", "Schienensitz"],
  "Fotel na szynach z funkcją spania (układ 4-osobowy)": ["Seat on rails with sleeping function (4 seats)", "Schienensitz mit Schlaffunktion (4 Sitze)"],
  "Izolacja kauczukowa 19 mm": ["19 mm rubber insulation", "19 mm Kautschukdämmung"],
  "Izolacja termiczna": ["Thermal insulation", "Wärmedämmung"],
  "KABINA": ["CAB", "KABINE"],
  "Kanapa rock &amp; roll": ["Rock &amp; roll sofa", "Rock-&amp;-Roll-Bank"],
  "LiFePO4 100 Ah · pod fotelem kierowcy": ["LiFePO4 100 Ah · under driver's seat", "LiFePO4 100 Ah · unter dem Fahrersitz"],
  "Lodówka 40 l": ["40 l fridge", "Kühlschrank 40 l"],
  "Lodówka kompresorowa": ["Compressor fridge", "Kompressor-Kühlbox"],
  "Ogrzewanie 2 kW": ["2 kW heater", "Heizung 2 kW"],
  "Ogrzewanie postojowe": ["Parking heater", "Standheizung"],
  "Ogrzewanie postojowe Webasto": ["Webasto parking heater", "Webasto-Standheizung"],
  "Okno przesuwne": ["Sliding window", "Schiebefenster"],
  "Okno uchylne": ["Hinged window", "Ausstellfenster"],
  "Oświetlenie LED": ["LED lighting", "LED-Beleuchtung"],
  "Oświetlenie LED ×6": ["LED lighting ×6", "LED-Beleuchtung ×6"],
  "PRZÓD →": ["FRONT →", "VORNE →"],
  "← PRZÓD": ["← FRONT", "← VORNE"],
  "TYŁ →": ["REAR →", "HINTEN →"],
  "← TYŁ": ["← REAR", "← HINTEN"],
  "Panel PV 175 W": ["175 W PV panel", "PV-Modul 175 W"],
  "Panel fotowoltaiczny": ["Solar panel", "Solarmodul"],
  "Panele ścienne ze sklejki": ["Plywood wall panels", "Sperrholz-Wandpaneele"],
  "Pop-top · łóżko 2-os.": ["Pop-top · double bed", "Pop-Top · Doppelbett"],
  "Sklejka brzozowa 4 mm": ["4 mm birch plywood", "Birkensperrholz 4 mm"],
  "Szafki górne": ["Overhead cabinets", "Hängeschränke"],
  "Szafki górne 2 × 60 cm": ["Overhead cabinets 2 × 60 cm", "Hängeschränke 2 × 60 cm"],
  "Tapicerka z wykładziny": ["Carpet lining", "Teppichverkleidung"],
  "VW T5 – rzut z góry": ["VW T5 – top view", "VW T5 – Draufsicht"],
  "VW T5 – ściana lewa": ["VW T5 – left wall", "VW T5 – linke Wand"],
  "VW T5 – ściana prawa": ["VW T5 – right wall", "VW T5 – rechte Wand"],
  "Webasto 2 kW · pod fotelem pasażera": ["Webasto 2 kW · under passenger seat", "Webasto 2 kW · unter dem Beifahrersitz"],
  "Wykładzina": ["Carpet", "Teppich"],
  "antracyt": ["anthracite", "anthrazit"],
  "drzwi przesuwne": ["sliding door", "Schiebetür"],
  "montaż na dachu": ["roof-mounted", "Dachmontage"],
  "nawiew": ["air outlet", "Luftauslass"],
  "obszyta wykładziną": ["carpet-lined", "mit Teppichbezug"],
  "przesuw": ["slides", "verschiebbar"],
  "rozłożone 175 × 116 cm": ["unfolded 175 × 116 cm", "ausgeklappt 175 × 116 cm"],
  "rozłożone 180 × 120 cm": ["unfolded 180 × 120 cm", "ausgeklappt 180 × 120 cm"],
  "układ 4-osobowy": ["4-seat layout", "4-Sitzer-Variante"],
  "Łóżko poprzeczne": ["Transverse bed", "Querbett"],
  "Łóżko rock &amp; roll": ["Rock &amp; roll bed", "Rock-&amp;-Roll-Bett"],
  "Łóżko składane z fotela (układ 4-osobowy)": ["Bed folding out of a seat (4 seats)", "Aus dem Sitz klappbares Bett (4 Sitze)"],
  "Łóżko z fotela": ["Seat bed", "Sitzbett"],
  "łóżko 185 × 120 cm · 4 os.": ["bed 185 × 120 cm · 4 seats", "Bett 185 × 120 cm · 4 Sitze"],
  "Świetlik 40 × 40": ["Roof light 40 × 40", "Dachfenster 40 × 40"],
  "Świetlik dachowy": ["Roof light", "Dachfenster"],
};

// Numbers and units read the same in every language.
const NEUTRAL = /^(\d|4°C)$/;

const files = readdirSync(ROOT, { recursive: true })
  .map((file) => file.replaceAll("\\", "/"))
  .filter((file) => file.endsWith(".svg") && !LANGS.includes(file.split("/")[0]));

const missing = new Set();
for (const file of files) {
  const source = readFileSync(join(ROOT, file), "utf8");
  LANGS.forEach((lang, i) => {
    const out = source.replace(/(<(text|tspan|title)\b[^>]*>)([^<]+)(?=<)/g, (match, open, _tag, label) => {
      if (NEUTRAL.test(label)) return match;
      if (!LABELS[label]) {
        missing.add(label);
        return match;
      }
      return open + LABELS[label][i];
    });
    const target = join(ROOT, lang, file);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, out);
  });
}

if (missing.size > 0) {
  console.error("Untranslated labels:", [...missing]);
  process.exit(1);
}
console.log(`Translated ${files.length} drawings into ${LANGS.join(", ")} (${relative(process.cwd(), ROOT)}).`);
