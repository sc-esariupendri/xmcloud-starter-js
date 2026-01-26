import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCustomFieldPersistence } from '../useCustomFieldPersistence';
import type { ClientSDK } from '@sitecore-marketplace-sdk/client';

interface TestData {
  searchIndex: string;
  fieldsMapping: Record<string, string>;
}

describe('useCustomFieldPersistence', () => {
  let mockClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockClient = {
      getValue: vi.fn(),
      setValue: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const defaultData: TestData = {
    searchIndex: 'index-1',
    fieldsMapping: { Title: 'title' },
  };

  describe('Basic functionality', () => {
    it('should load data from custom field on mount', async () => {
      const savedData = { searchIndex: 'index-2', fieldsMapping: { Title: 'title2' } };
      mockClient.getValue.mockResolvedValue(JSON.stringify(savedData));

      const onLoad = vi.fn();
      const { result } = renderHook(() =>
        useCustomFieldPersistence({
          client: mockClient,
          data: defaultData,
          onLoad,
        })
      );

      expect(result.current.isLoaded).toBe(false);

      // With fake timers, run all timers to resolve promises
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Direct assertion after timers run
      expect(result.current.isLoaded).toBe(true);
      expect(mockClient.getValue).toHaveBeenCalled();
      expect(onLoad).toHaveBeenCalledWith(savedData);
    });

    it('should save data after debounce period', async () => {
      mockClient.getValue.mockResolvedValue(null);
      mockClient.setValue.mockResolvedValue(undefined);

      const onLoad = vi.fn();
      const { result, rerender } = renderHook(
        ({ data }) =>
          useCustomFieldPersistence({
            client: mockClient,
            data,
            onLoad,
            debounceMs: 500,
          }),
        { initialProps: { data: defaultData } }
      );

      // With fake timers, run all timers to resolve promises
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isLoaded).toBe(true);

      // Wait for client to be ready
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      // Update data
      const newData = { ...defaultData, searchIndex: 'index-2' };
      rerender({ data: newData });

      // Advance past debounce
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      // Direct assertion after timers run
      expect(mockClient.setValue).toHaveBeenCalledWith(
        JSON.stringify(newData),
        false
      );
    });

    it('should indicate saving state', async () => {
      mockClient.getValue.mockResolvedValue(null);
      mockClient.setValue.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const onLoad = vi.fn();
      const { result, rerender } = renderHook(
        ({ data }) =>
          useCustomFieldPersistence({
            client: mockClient,
            data,
            onLoad,
          }),
        { initialProps: { data: defaultData } }
      );

      // With fake timers, run all timers to resolve promises
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isLoaded).toBe(true);

      // Wait for client ready
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      // Update data
      const newData = { ...defaultData, searchIndex: 'index-2' };
      rerender({ data: newData });

      // Advance past debounce - this will trigger the save
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      // Check saving state (it should be true immediately after debounce)
      expect(result.current.isSaving).toBe(true);

      // Complete the save
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Direct assertion after save completes
      expect(result.current.isSaving).toBe(false);
    });
  });

  describe('Edge cases - Client states', () => {
    it('should handle null client', async () => {
      const onLoad = vi.fn();
      const { result } = renderHook(() =>
        useCustomFieldPersistence({
          client: null,
          data: defaultData,
          onLoad,
        })
      );

      expect(result.current.isLoaded).toBe(false);
      expect(onLoad).not.toHaveBeenCalled();
    });

    it('should handle client without getValue/setValue methods', async () => {
      const invalidClient = {} as ClientSDK;
      const onLoad = vi.fn();

      const { result } = renderHook(() =>
        useCustomFieldPersistence({
          client: invalidClient,
          data: defaultData,
          onLoad,
        })
      );

      expect(result.current.isLoaded).toBe(false);
      expect(onLoad).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases - Load data', () => {
    it('should handle getValue returning null', async () => {
      mockClient.getValue.mockResolvedValue(null);

      const onLoad = vi.fn();
      const { result } = renderHook(() =>
        useCustomFieldPersistence({
          client: mockClient,
          data: defaultData,
          onLoad,
        })
      );

      // With fake timers, run all timers to resolve promises
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isLoaded).toBe(true);
      expect(onLoad).not.toHaveBeenCalled();
    });

    it('should handle getValue returning empty string', async () => {
      mockClient.getValue.mockResolvedValue('');

      const onLoad = vi.fn();
      const { result } = renderHook(() =>
        useCustomFieldPersistence({
          client: mockClient,
          data: defaultData,
          onLoad,
        })
      );

      // With fake timers, run all timers to resolve promises
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isLoaded).toBe(true);
      expect(onLoad).not.toHaveBeenCalled();
    });

    it('should handle getValue returning object instead of string', async () => {
      const dataObject = { searchIndex: 'index-2', fieldsMapping: {} };
      mockClient.getValue.mockResolvedValue(dataObject);

      const onLoad = vi.fn();
      const { result } = renderHook(() =>
        useCustomFieldPersistence({
          client: mockClient,
          data: defaultData,
          onLoad,
        })
      );

      // With fake timers, run all timers to resolve promises
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isLoaded).toBe(true);
      expect(onLoad).toHaveBeenCalledWith(dataObject);
    });

    it('should handle malformed JSON string', async () => {
      mockClient.getValue.mockResolvedValue('{ invalid json }');

      const onLoad = vi.fn();
      const { result } = renderHook(() =>
        useCustomFieldPersistence({
          client: mockClient,
          data: defaultData,
          onLoad,
        })
      );

      // With fake timers, run all timers to resolve promises
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isLoaded).toBe(true);
      expect(onLoad).not.toHaveBeenCalled();
    });

    it('should handle getValue throwing error', async () => {
      mockClient.getValue.mockRejectedValue(new Error('getValue failed'));

      const onLoad = vi.fn();
      const { result } = renderHook(() =>
        useCustomFieldPersistence({
          client: mockClient,
          data: defaultData,
          onLoad,
        })
      );

      // With fake timers, run all timers to resolve promises
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isLoaded).toBe(true);
      expect(onLoad).not.toHaveBeenCalled();
    });

    it('should handle "not implemented" error gracefully', async () => {
      mockClient.getValue.mockRejectedValue(
        new Error('Custom field methods not implemented')
      );

      const onLoad = vi.fn();
      const { result } = renderHook(() =>
        useCustomFieldPersistence({
          client: mockClient,
          data: defaultData,
          onLoad,
        })
      );

      // With fake timers, run all timers to resolve promises
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isLoaded).toBe(true);
      expect(result.current.saveError).toBeNull();
    });
  });

  describe('Edge cases - Save data', () => {
    it('should handle setValue throwing error', async () => {
      mockClient.getValue.mockResolvedValue(null);
      mockClient.setValue.mockRejectedValue(new Error('setValue failed'));

      const onLoad = vi.fn();
      const { result, rerender } = renderHook(
        ({ data }) =>
          useCustomFieldPersistence({
            client: mockClient,
            data,
            onLoad,
          }),
        { initialProps: { data: defaultData } }
      );

      // With fake timers, run all timers to resolve promises
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isLoaded).toBe(true);

      // Wait for client ready
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      // Update data
      const newData = { ...defaultData, searchIndex: 'index-2' };
      rerender({ data: newData });

      // Advance past debounce
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      // Direct assertion after timers run
      expect(result.current.saveError).toContain('setValue failed');
    });

    it('should handle setValue timeout and retry', async () => {
      mockClient.getValue.mockResolvedValue(null);
      mockClient.setValue
        .mockRejectedValueOnce(new Error('Operation timed out'))
        .mockResolvedValueOnce(undefined);

      const onLoad = vi.fn();
      const { result, rerender } = renderHook(
        ({ data }) =>
          useCustomFieldPersistence({
            client: mockClient,
            data,
            onLoad,
          }),
        { initialProps: { data: defaultData } }
      );

      // With fake timers, run all timers to resolve promises
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isLoaded).toBe(true);

      // Wait for client ready
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      // Update data
      const newData = { ...defaultData, searchIndex: 'index-2' };
      rerender({ data: newData });

      // Advance past debounce
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      // Wait for retry
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      // Direct assertion after timers run
      expect(mockClient.setValue).toHaveBeenCalledTimes(2);
    });

    it('should not retry on "not implemented" error', async () => {
      mockClient.getValue.mockResolvedValue(null);
      mockClient.setValue.mockRejectedValue(
        new Error('Custom field methods not implemented')
      );

      const onLoad = vi.fn();
      const { result, rerender } = renderHook(
        ({ data }) =>
          useCustomFieldPersistence({
            client: mockClient,
            data,
            onLoad,
          }),
        { initialProps: { data: defaultData } }
      );

      // With fake timers, run all timers to resolve promises
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isLoaded).toBe(true);

      // Wait for client ready
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      // Update data
      const newData = { ...defaultData, searchIndex: 'index-2' };
      rerender({ data: newData });

      // Advance past debounce
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      // Direct assertion after timers run - should error, but not retry
      expect(mockClient.setValue).toHaveBeenCalledTimes(1);
      expect(result.current.saveError).toBeNull();
    });

    it('should not save if data has not changed', async () => {
      mockClient.getValue.mockResolvedValue(null);
      mockClient.setValue.mockResolvedValue(undefined);

      const onLoad = vi.fn();
      const { result, rerender } = renderHook(
        ({ data }) =>
          useCustomFieldPersistence({
            client: mockClient,
            data,
            onLoad,
          }),
        { initialProps: { data: defaultData } }
      );

      // With fake timers, run all timers to resolve promises
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isLoaded).toBe(true);

      // Wait for client ready
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      // Update with same data
      rerender({ data: defaultData });

      // Advance past debounce
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      // Should not save
      expect(mockClient.setValue).not.toHaveBeenCalled();
    });

    it('should debounce multiple rapid changes', async () => {
      mockClient.getValue.mockResolvedValue(null);
      mockClient.setValue.mockResolvedValue(undefined);

      const onLoad = vi.fn();
      const { result, rerender } = renderHook(
        ({ data }) =>
          useCustomFieldPersistence({
            client: mockClient,
            data,
            onLoad,
            debounceMs: 500,
          }),
        { initialProps: { data: defaultData } }
      );

      // With fake timers, run all timers to resolve promises
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isLoaded).toBe(true);

      // Wait for client ready
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      // Make multiple rapid changes
      rerender({ data: { ...defaultData, searchIndex: 'index-2' } });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      rerender({ data: { ...defaultData, searchIndex: 'index-3' } });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      rerender({ data: { ...defaultData, searchIndex: 'index-4' } });

      // Advance past debounce
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      // Should only save once with the last value - direct assertion after timers run
      expect(mockClient.setValue).toHaveBeenCalledTimes(1);
      expect(mockClient.setValue).toHaveBeenCalledWith(
        JSON.stringify({ ...defaultData, searchIndex: 'index-4' }),
        false
      );
    });
  });

  describe('Edge cases - Data types', () => {
    it('should handle data with null values', async () => {
      mockClient.getValue.mockResolvedValue(null);
      mockClient.setValue.mockResolvedValue(undefined);

      const dataWithNull: any = { searchIndex: null, fieldsMapping: null };
      const onLoad = vi.fn();

      const { result, rerender } = renderHook(
        ({ data }) =>
          useCustomFieldPersistence({
            client: mockClient,
            data,
            onLoad,
          }),
        { initialProps: { data: defaultData } }
      );

      // With fake timers, run all timers to resolve promises
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isLoaded).toBe(true);

      // Wait for client ready
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      // Update with null values
      rerender({ data: dataWithNull });

      // Advance past debounce
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      // Direct assertion after timers run
      expect(mockClient.setValue).toHaveBeenCalled();
    });

    it('should handle data with undefined values', async () => {
      mockClient.getValue.mockResolvedValue(null);
      mockClient.setValue.mockResolvedValue(undefined);

      const dataWithUndefined: any = { searchIndex: undefined, fieldsMapping: {} };
      const onLoad = vi.fn();

      const { result, rerender } = renderHook(
        ({ data }) =>
          useCustomFieldPersistence({
            client: mockClient,
            data,
            onLoad,
          }),
        { initialProps: { data: defaultData } }
      );

      // With fake timers, run all timers to resolve promises
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isLoaded).toBe(true);

      // Wait for client ready
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      // Update with undefined values
      rerender({ data: dataWithUndefined });

      // Advance past debounce
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      // Direct assertion after timers run
      expect(mockClient.setValue).toHaveBeenCalled();
    });

    it('should handle empty data object', async () => {
      mockClient.getValue.mockResolvedValue(null);
      mockClient.setValue.mockResolvedValue(undefined);

      const emptyData: any = {};
      const onLoad = vi.fn();

      const { result, rerender } = renderHook(
        ({ data }) =>
          useCustomFieldPersistence({
            client: mockClient,
            data,
            onLoad,
          }),
        { initialProps: { data: defaultData } }
      );

      // With fake timers, run all timers to resolve promises
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isLoaded).toBe(true);

      // Wait for client ready
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      // Update with empty object
      rerender({ data: emptyData });

      // Advance past debounce
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      // Direct assertion after timers run
      expect(mockClient.setValue).toHaveBeenCalledWith(
        JSON.stringify(emptyData),
        false
      );
    });
  });

  describe('Custom debounce time', () => {
    it('should respect custom debounce time', async () => {
      mockClient.getValue.mockResolvedValue(null);
      mockClient.setValue.mockResolvedValue(undefined);

      const onLoad = vi.fn();
      const { result, rerender } = renderHook(
        ({ data }) =>
          useCustomFieldPersistence({
            client: mockClient,
            data,
            onLoad,
            debounceMs: 1000,
          }),
        { initialProps: { data: defaultData } }
      );

      // With fake timers, run all timers to resolve promises
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isLoaded).toBe(true);

      // Wait for client ready
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      // Update data
      const newData = { ...defaultData, searchIndex: 'index-2' };
      rerender({ data: newData });

      // Advance less than debounce time
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      // Should not have saved yet
      expect(mockClient.setValue).not.toHaveBeenCalled();

      // Advance past debounce time
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      // Now it should save - direct assertion after timers run
      expect(mockClient.setValue).toHaveBeenCalled();
    });
  });
});



