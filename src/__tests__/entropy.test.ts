import { runEntropyFilter } from "../index";

test("low entropy simple text", () => {
  const result = runEntropyFilter("hola mundo");
  expect(result.entropy_analysis.score).toBeGreaterThanOrEqual(0);
});
