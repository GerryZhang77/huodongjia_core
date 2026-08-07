export interface UnsafeSpreadsheetIntegerCell {
  rowNumber: number;
  field: string;
}

/**
 * Excel/JavaScript 都无法可靠保存超过安全整数范围的长编号。
 * 这类值在转成字符串前就可能已经被改写，不能继续做身份证等校验。
 */
export const findUnsafeSpreadsheetIntegerCells = (
  rows: Array<Record<string, unknown>>,
): UnsafeSpreadsheetIntegerCell[] => {
  const cells: UnsafeSpreadsheetIntegerCell[] = [];

  rows.forEach((row, index) => {
    Object.entries(row).forEach(([field, value]) => {
      if (
        typeof value === "number" &&
        Number.isInteger(value) &&
        !Number.isSafeInteger(value)
      ) {
        cells.push({ rowNumber: index + 2, field });
      }
    });
  });

  return cells;
};

export const getUnsafeSpreadsheetIntegerMessage = (
  cells: UnsafeSpreadsheetIntegerCell[],
): string => {
  const preview = cells
    .slice(0, 3)
    .map((cell) => `第 ${cell.rowNumber} 行「${cell.field}」`)
    .join("、");
  const remaining = cells.length > 3 ? `等 ${cells.length} 处` : "";

  return `${preview}${remaining}包含超过安全长度的数字，内容可能已被 Excel 改写。请先将身份证号或长编号列设置为“文本”，重新粘贴原始号码后再导入。`;
};
