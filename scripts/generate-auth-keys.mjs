import { writeFileSync } from "node:fs";
import { exportJWK, exportPKCS8, generateKeyPair } from "../node_modules/.pnpm/jose@5.10.0/node_modules/jose/dist/node/esm/index.js";

const keys = await generateKeyPair("RS256", { extractable: true });
const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

writeFileSync("scripts/.jwt_private_key.txt", privateKey.trimEnd().replace(/\n/g, " "));
writeFileSync("scripts/.jwks.txt", jwks);

console.log("Generated JWT_PRIVATE_KEY and JWKS into scripts/.jwt_private_key.txt and scripts/.jwks.txt");
