import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import enJson from "../../assets/i18n/en.json";

export function initI18n() {
  console.log(enJson);

  i18next.use(initReactI18next).init({
    resources: {
      en: { ...enJson },
    },
    lng: "en",
  });
}
