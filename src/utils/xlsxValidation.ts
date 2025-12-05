// Utility to validate the Stores upload XLSX file
// Rules:
// - File must be .xlsx
// - Must contain first worksheet with headers: Nombre, ID Externo, Estado (any order not allowed)
// - Must contain at least one data row
import * as XLSX from 'xlsx';

const REQUIRED_HEADERS = ['Nombre', 'ID Externo', 'Estado'];

const normalize = (s?: string) => (s ?? '').trim().toLowerCase();

export async function validateStoresUploadFile(file: File): Promise<void> {
  const name = file?.name || '';
  const extOk = /\.xlsx$/i.test(name);
  const mimeOk =
    file.type ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === '';

  if (!extOk) {
    throw new Error('El archivo debe tener extensión .xlsx');
  }
  if (!mimeOk) {
    throw new Error('Tipo de archivo no válido. Debe ser un Excel (.xlsx)');
  }
  if (!file || file.size === 0) {
    throw new Error('El archivo está vacío');
  }

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('El archivo no contiene hojas');
  }
  const ws = workbook.Sheets[sheetName];
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  if (!rows.length) {
    throw new Error('El archivo no contiene datos');
  }
  const headerRow = (rows[0] || []).map((c) => String(c ?? ''));
  const headersNorm = headerRow.map((h) => normalize(h));

  const expectedNorm = REQUIRED_HEADERS.map((h) => normalize(h));
  const matches =
    headersNorm.length >= expectedNorm.length &&
    expectedNorm.every((h, idx) => headersNorm[idx] === h);

  if (!matches) {
    throw new Error(
      'Encabezados inválidos. Se requieren las columnas: Nombre, ID Externo, Estado (en ese orden).',
    );
  }

  const dataRows = rows
    .slice(1)
    .filter((r) => r && r.some((c) => String(c ?? '').trim() !== ''));
  if (dataRows.length === 0) {
    throw new Error(
      'El archivo solo contiene encabezados, no hay filas de datos',
    );
  }
}

export default validateStoresUploadFile;
