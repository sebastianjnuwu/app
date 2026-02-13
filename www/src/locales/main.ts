import i18next, { type TFunction } from "i18next";
import $ from "jquery";

import pt from "./lang/pt-BR";
import en from "./lang/en-US";

i18next.init({
  lng: "pt-BR",
  debug: false,
  preload: ["en-US", "pt-BR"],
  resources: {
    "en-US": { translation: en },
    "pt-BR": { translation: pt },
  },
  interpolation: {
    escapeValue: false,
    useRawValueToEscape: true,
  },
  load: "all",
});

//  define uma funçSempreão TFunction, nunca undefined
const lang: TFunction = i18next.getFixedT(
  window.navigator.language === "pt-BR" ? "pt-BR" : "en-US"
);

// Atualiza elementos HTML automaticamente
$("[i18next-id]").each(function () {
  const id = $(this).attr("i18next-id");
  if (id) $(this).html(lang(id));
});

export { lang };
