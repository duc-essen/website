// Klaro Privacy Manager — Konfiguration fuer duc-essen
// Doku: https://klaro.org/docs/integration/annotated-configuration
window.klaroConfig = {
  version: 1,
  elementID: 'klaro',
  storageMethod: 'cookie',
  cookieName: 'klaro-consent',
  cookieExpiresAfterDays: 365,
  default: false,        // Default opt-out (DSGVO konform)
  mustConsent: false,    // Banner ist abweisbar, nicht hart blockierend
  acceptAll: true,       // "Alle akzeptieren"-Button
  hideDeclineAll: false,
  noticeAsModal: false,  // Banner unten am Rand statt Modal
  htmlTexts: true,       // erlaubt Links in den Texten

  translations: {
    de: {
      privacyPolicyUrl: '/duc-website/datenschutz',
      consentModal: {
        title: 'Datenschutz-Einstellungen',
        description:
          'Wir verwenden auf dieser Website Drittanbieter-Dienste, um euch Karten und das Anmeldeformular zu zeigen. Diese setzen Cookies und übertragen Daten an externe Server. Bitte wählt, welche Dienste ihr erlauben möchtet. Eure Wahl könnt ihr jederzeit über den Link „Cookie-Einstellungen" im Footer ändern.',
      },
      consentNotice: {
        description:
          'Wir verwenden Drittanbieter-Dienste (Google Maps, Vereinsplaner-Formular). Diese werden erst nach eurer Zustimmung geladen.',
        learnMore: 'Einstellungen anpassen',
      },
      ok: 'Alle akzeptieren',
      decline: 'Ablehnen',
      acceptAll: 'Alle akzeptieren',
      acceptSelected: 'Auswahl speichern',
      save: 'Speichern',
      close: 'Schließen',
      poweredBy: '',
      purposes: {
        maps: { title: 'Karten' },
        forms: { title: 'Formulare' },
      },
      service: {
        disableAll: {
          title: 'Alle Dienste aktivieren oder deaktivieren',
          description:
            'Hier könnt ihr alle Dienste auf einmal an- oder ausschalten.',
        },
        required: { title: '(notwendig)' },
        purposes: 'Zweck',
      },
      'google-maps': {
        title: 'Google Maps',
        description:
          'Zeigt unsere Trainingsadresse als interaktive Karte. Beim Laden werden Daten (u.a. IP-Adresse) an Google in den USA übertragen.',
      },
      vereinsplaner: {
        title: 'Vereinsplaner-Formular',
        description:
          'Anmeldeformular für das Probetraining, bereitgestellt von Vereinsplaner. Beim Laden werden Daten an Vereinsplaner übertragen.',
      },
    },
  },

  purposes: ['maps', 'forms'],

  services: [
    {
      name: 'google-maps',
      purposes: ['maps'],
      required: false,
      default: false,
      optOut: false,
      onlyOnce: true,
      cookies: [],
    },
    {
      name: 'vereinsplaner',
      purposes: ['forms'],
      required: false,
      default: false,
      optOut: false,
      onlyOnce: true,
      cookies: [],
    },
  ],
};
