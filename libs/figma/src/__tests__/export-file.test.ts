import { describe, expect, test } from 'vite-plus/test';
import { formatExportFileName } from '../export';

describe('export file', () => {
  test('should format file name', async () => {
    expect(formatExportFileName('File.svg')).toBe('file.svg');
    expect(formatExportFileName('Common/Animals and Plants/Cat_sleeping.svg')).toBe(
      'common/animals-and-plants/cat_sleeping.svg'
    );
    expect(formatExportFileName('print: 32/copy&pasted.svg')).toBe('print-32/copy-pasted.svg');
  });
});
