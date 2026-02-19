/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  exportProgressAsJSON,
  exportProgressAsCSV,
  formatTimeSpent,
  calculatePercentage,
} from '../export';
import type { GameProgress } from '../../types';

describe('export', () => {
  describe('formatTimeSpent', () => {
    it('should format seconds only', () => {
      expect(formatTimeSpent(45)).toBe('45s');
    });

    it('should format zero seconds', () => {
      expect(formatTimeSpent(0)).toBe('0s');
    });

    it('should format minutes and seconds', () => {
      expect(formatTimeSpent(125)).toBe('2m 5s');
    });

    it('should format exact minutes', () => {
      expect(formatTimeSpent(60)).toBe('1m 0s');
      expect(formatTimeSpent(120)).toBe('2m 0s');
    });

    it('should format hours and minutes', () => {
      expect(formatTimeSpent(3660)).toBe('1h 1m');
    });

    it('should format exact hours', () => {
      expect(formatTimeSpent(3600)).toBe('1h 0m');
    });

    it('should format multiple hours', () => {
      expect(formatTimeSpent(7320)).toBe('2h 2m');
    });

    it('should handle large values', () => {
      expect(formatTimeSpent(36000)).toBe('10h 0m');
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate 100% correctly', () => {
      expect(calculatePercentage(10, 10)).toBe(100);
    });

    it('should calculate 50% correctly', () => {
      expect(calculatePercentage(5, 10)).toBe(50);
    });

    it('should calculate 0% correctly', () => {
      expect(calculatePercentage(0, 10)).toBe(0);
    });

    it('should return 0 when total is 0', () => {
      expect(calculatePercentage(0, 0)).toBe(0);
      expect(calculatePercentage(5, 0)).toBe(0);
    });

    it('should round to nearest integer', () => {
      expect(calculatePercentage(1, 3)).toBe(33);
      expect(calculatePercentage(2, 3)).toBe(67);
    });

    it('should handle decimal inputs', () => {
      expect(calculatePercentage(7.5, 10)).toBe(75);
    });
  });

  describe('exportProgressAsJSON', () => {
    let mockLink: { href: string; download: string; click: ReturnType<typeof vi.fn> };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let appendChildSpy: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let removeChildSpy: any;
    let mockUrl: string;

    const mockProgress: GameProgress = {
      currentLevel: 2,
      problemsCompleted: 15,
      lastPlayedDate: '2024-01-15T10:30:00Z',
      totalTimeSpent: 1200,
      levelProgress: {
        level1: {
          questionsAnswered: 10,
          questionsCorrect: 9,
          explanationsProvided: 5,
          explanationScores: [90, 88, 92],
          mastered: true,
        },
      },
    };

    const mockSummary = {
      totalScore: 90,
      averageTime: 60,
    };

    beforeEach(() => {
      mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      mockUrl = 'blob:test-url';

      // Mock document.createElement to return our mock link
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement);

      // Mock document.body methods
      appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

      // Mock URL methods (these don't exist in jsdom by default)
      global.URL.createObjectURL = vi.fn().mockReturnValue(mockUrl);
      global.URL.revokeObjectURL = vi.fn();

      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should create a download link with correct filename', () => {
      const today = new Date().toISOString().split('T')[0];

      exportProgressAsJSON('test-game', 'Test Game', '1.0.0', mockProgress, mockSummary);

      expect(mockLink.download).toBe(`test-game-progress-${today}.json`);
    });

    it('should set link href to blob URL', () => {
      exportProgressAsJSON('test-game', 'Test Game', '1.0.0', mockProgress, mockSummary);

      expect(mockLink.href).toBe(mockUrl);
    });

    it('should trigger download click', () => {
      exportProgressAsJSON('test-game', 'Test Game', '1.0.0', mockProgress, mockSummary);

      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should create Blob with JSON content type', () => {
      exportProgressAsJSON('test-game', 'Test Game', '1.0.0', mockProgress, mockSummary);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      const blob = (global.URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/json');
    });

    it('should include export data structure in Blob', () => {
      exportProgressAsJSON('test-game', 'Test Game', '1.0.0', mockProgress, mockSummary);

      const blob = (global.URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(blob).toBeInstanceOf(Blob);

      // Use FileReader to verify content
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const parsed = JSON.parse(reader.result as string);
          expect(parsed).toHaveProperty('exportTimestamp');
          expect(parsed.gameName).toBe('Test Game');
          expect(parsed.gameVersion).toBe('1.0.0');
          expect(parsed.studentProgress).toEqual(mockProgress);
          expect(parsed.summary).toEqual(mockSummary);
          resolve();
        };
        reader.readAsText(blob);
      });
    });

    it('should append link to document body', () => {
      exportProgressAsJSON('test-game', 'Test Game', '1.0.0', mockProgress, mockSummary);

      expect(appendChildSpy).toHaveBeenCalled();
    });

    it('should remove link from document body after click', () => {
      exportProgressAsJSON('test-game', 'Test Game', '1.0.0', mockProgress, mockSummary);

      expect(removeChildSpy).toHaveBeenCalled();
    });

    it('should revoke object URL after download', () => {
      exportProgressAsJSON('test-game', 'Test Game', '1.0.0', mockProgress, mockSummary);

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    });
  });

  describe('exportProgressAsCSV', () => {
    let mockLink: { href: string; download: string; click: ReturnType<typeof vi.fn> };
    let mockUrl: string;

    beforeEach(() => {
      mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      mockUrl = 'blob:test-url';

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement);
      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

      global.URL.createObjectURL = vi.fn().mockReturnValue(mockUrl);
      global.URL.revokeObjectURL = vi.fn();

      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should create a download link with correct filename', () => {
      const today = new Date().toISOString().split('T')[0];
      const rows = [{ name: 'Test', score: 100 }];

      exportProgressAsCSV('test-game', rows);

      expect(mockLink.download).toBe(`test-game-progress-${today}.csv`);
    });

    it('should create CSV with headers from first row', () => {
      const rows = [
        { name: 'Alice', score: 90 },
        { name: 'Bob', score: 85 },
      ];

      exportProgressAsCSV('test-game', rows);

      const blob = (global.URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0];

      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const csvContent = reader.result as string;
          const lines = csvContent.split('\n');
          expect(lines[0]).toBe('name,score');
          resolve();
        };
        reader.readAsText(blob);
      });
    });

    it('should create CSV with data rows', () => {
      const rows = [
        { name: 'Alice', score: 90 },
        { name: 'Bob', score: 85 },
      ];

      exportProgressAsCSV('test-game', rows);

      const blob = (global.URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0];

      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const csvContent = reader.result as string;
          const lines = csvContent.split('\n');
          expect(lines[1]).toBe('Alice,90');
          expect(lines[2]).toBe('Bob,85');
          resolve();
        };
        reader.readAsText(blob);
      });
    });

    it('should create Blob with CSV content type', () => {
      const rows = [{ name: 'Test', score: 100 }];

      exportProgressAsCSV('test-game', rows);

      const blob = (global.URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/csv');
    });

    it('should handle empty rows array', () => {
      exportProgressAsCSV('test-game', []);

      expect(console.error).toHaveBeenCalledWith('No data to export');
      expect(global.URL.createObjectURL).not.toHaveBeenCalled();
    });

    it('should not create download link for empty data', () => {
      exportProgressAsCSV('test-game', []);

      expect(mockLink.click).not.toHaveBeenCalled();
    });

    it('should trigger download click', () => {
      const rows = [{ name: 'Test', score: 100 }];

      exportProgressAsCSV('test-game', rows);

      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should handle multiple columns', () => {
      const rows = [
        { id: 1, name: 'Alice', score: 90, time: 120 },
        { id: 2, name: 'Bob', score: 85, time: 150 },
      ];

      exportProgressAsCSV('test-game', rows);

      const blob = (global.URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0];

      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const csvContent = reader.result as string;
          const lines = csvContent.split('\n');
          expect(lines[0]).toBe('id,name,score,time');
          expect(lines[1]).toBe('1,Alice,90,120');
          resolve();
        };
        reader.readAsText(blob);
      });
    });

    it('should revoke object URL after download', () => {
      const rows = [{ name: 'Test', score: 100 }];

      exportProgressAsCSV('test-game', rows);

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    });
  });
});
