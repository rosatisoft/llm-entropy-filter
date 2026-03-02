import fs from "node:fs";
import path from "node:path";

const jsonPath = path.join(path.dirname(new URL(import.meta.url).pathname), "support.json");
const rules = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

export default rules;
