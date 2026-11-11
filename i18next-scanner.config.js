export default {
  input: ["src/**/*.{js,jsx}"],
  output: "./public/locales/",
  options: {
    debug: false,
    func: { list: ["t"], extensions: [".js", ".jsx"] },
    lngs: ["en", "hi"],
    ns: ["translation"],
    defaultLng: "en",
    defaultNs: "translation",
    resource: {
      loadPath: "public/locales/{{lng}}/{{ns}}.json",
      savePath: "public/locales/{{lng}}/{{ns}}.json",
    },
  },
};
