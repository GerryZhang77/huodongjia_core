import { describe, expect, it } from "vitest";
import {
  findUnsafeSpreadsheetIntegerCells,
  getUnsafeSpreadsheetIntegerMessage,
} from "./spreadsheetImport";

describe("spreadsheet long-number protection", () => {
  it("flags identity numbers that were parsed as unsafe numeric cells", () => {
    const cells = findUnsafeSpreadsheetIntegerCells([
      { 姓名: "测试用户", 身份证号: 430626199609175800 },
    ]);

    expect(cells).toEqual([{ rowNumber: 2, field: "身份证号" }]);
    expect(getUnsafeSpreadsheetIntegerMessage(cells)).toContain(
      "设置为“文本”",
    );
  });

  it("keeps text identity numbers and safe numeric cells", () => {
    expect(
      findUnsafeSpreadsheetIntegerCells([
        { 身份证号: "430626199609175810", 手机号: 13800000000 },
      ]),
    ).toEqual([]);
  });
});
