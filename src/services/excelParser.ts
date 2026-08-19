import * as XLSX from 'xlsx';
import { RawCandidate } from '@/types/salary';

export function parseBambooHRExcel(buffer: ArrayBuffer): RawCandidate[] {
  const wb = XLSX.read(buffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, raw: false, defval: '' });

  // BambooHR exports have a metadata header block; find the real column headers row
  const headerIdx = rows.findIndex((row) => Array.isArray(row) && row.includes('First Name'));
  if (headerIdx === -1) {
    throw new Error('Formato no reconocido. Exportá desde BambooHR → Active Applicants (incluye columnas First Name, Desired Salary, Country).');
  }

  const headers = rows[headerIdx] as string[];
  const col = (name: string) => headers.indexOf(name);

  const firstNameCol = col('First Name');
  const lastNameCol = col('Last Name');
  const positionCol = col('Position');
  const cityCol = col('City');
  const stateCol = col('State');
  const countryCol = col('Country');
  const salaryCol = col('Desired Salary');

  if (salaryCol === -1) {
    throw new Error('El archivo no tiene columna "Desired Salary". Verificá que sea un export de BambooHR con ese campo.');
  }

  const candidates: RawCandidate[] = [];

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i] as string[];
    const firstName = (row[firstNameCol] ?? '').toString().trim();
    const salary = (row[salaryCol] ?? '').toString().trim();

    if (!firstName || !salary) continue;

    candidates.push({
      firstName,
      lastName: (row[lastNameCol] ?? '').toString().trim(),
      position: (row[positionCol] ?? '').toString().trim(),
      city: (row[cityCol] ?? '').toString().trim(),
      state: (row[stateCol] ?? '').toString().trim(),
      country: (row[countryCol] ?? '').toString().trim(),
      rawSalary: salary,
    });
  }

  return candidates;
}
