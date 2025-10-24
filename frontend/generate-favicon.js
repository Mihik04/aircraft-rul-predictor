// generate-favicon.js
import favicons from "favicons";
import fs from "fs";
import path from "path";

const source = "public/favicon.png"; // input file
const outputDir = "public"; // output folder

const configuration = {
  path: "/", // Path for icons
  appName: "Aircraft RUL Predictor",
  appShortName: "RUL App",
  appDescription: "Aircraft Predictive Maintenance Dashboard",
  developerName: "Mihik Sarkar",
  theme_color: "#2073E8",
  background: "#ffffff",
  icons: {
    android: true,
    appleIcon: true,
    appleStartup: false,
    favicons: true,
    windows: false,
    yandex: false,
  },
};

favicons(source, configuration)
  .then((response) => {
    // Write all generated files
    response.images.forEach((image) => {
      fs.writeFileSync(path.join(outputDir, image.name), image.contents);
    });
    response.files.forEach((file) => {
      fs.writeFileSync(path.join(outputDir, file.name), file.contents);
    });
    console.log("✅ Favicons generated successfully!");
  })
  .catch((error) => console.error("❌ Favicon generation failed:", error));
