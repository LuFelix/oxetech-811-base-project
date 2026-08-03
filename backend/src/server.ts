import https from "https";
import fs from "fs";
import app from "./app";

const port = Number(process.env.PORT || 3000);

const sslKeyPath = process.env.SSL_KEY_PATH || "/app/server.key";
const sslCertPath = process.env.SSL_CERT_PATH || "/app/server.crt";

if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
  const options = {
    key: fs.readFileSync(sslKeyPath),
    cert: fs.readFileSync(sslCertPath),
  };
  https.createServer(options, app).listen(port, () => {
    console.log(`Oxetech Helpdesk API running on https://localhost:${port}`);
  });
} else {
  app.listen(port, () => {
    console.log(`Oxetech Helpdesk API running on http://localhost:${port}`);
  });
}