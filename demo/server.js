import express from "express";
import { runEntropyFilter } from "../dist/index.js";

const app = express();
app.use(express.json());

app.post("/analyze", (req, res) => {
  const text = String(req.body?.text ?? "");
  const result = runEntropyFilter(text);
  res.json({ ok: true, input_len: text.length, result });
});

app.listen(3000, () => console.log("Demo server on http://localhost:3000"));
