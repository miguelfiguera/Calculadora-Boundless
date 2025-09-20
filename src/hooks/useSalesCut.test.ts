import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSalesCut } from './useSalesCut';

describe('useSalesCut Hook', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSalesCut());

    expect(result.current.data).toEqual({
      nombreCliente: '',
      watts: 0,
      numeroPlacas: 0,
      redline: 0,
      precioBateria: 0,
      numeroBaterias: 0,
      gananciaConsultor: 0,
      epcVenta: 0,
      pagoCliente: 0,
    });

    expect(result.current.calculations).toEqual({
      size: 0,
      precioPlacas: 0,
      precioTotal: 0,
      epcMinimo: 0,
      diferencial: 0,
      gananciaConsultorNeta: 0
    });
  });

  it('should update fields correctly', () => {
    const { result } = renderHook(() => useSalesCut());

    act(() => {
      result.current.updateField('watts', 450);
      result.current.updateField('numeroPlacas', 10);
    });

    expect(result.current.data.watts).toBe(450);
    expect(result.current.data.numeroPlacas).toBe(10);
  });

  it('should calculate size correctly', () => {
    const { result } = renderHook(() => useSalesCut());

    act(() => {
      result.current.updateField('watts', 450);
      result.current.updateField('numeroPlacas', 10);
    });

    expect(result.current.calculations.size).toBe(4500);
    expect(result.current.results.sizeKW).toBe('4.5');
  });

  it('should calculate precio de placas correctly', () => {
    const { result } = renderHook(() => useSalesCut());

    act(() => {
      result.current.updateField('watts', 450);
      result.current.updateField('numeroPlacas', 10);
      result.current.updateField('redline', 2.5);
    });

    expect(result.current.calculations.precioPlacas).toBe(11250);
  });

  it('should calculate precio total with batteries', () => {
    const { result } = renderHook(() => useSalesCut());

    act(() => {
      result.current.updateField('watts', 450);
      result.current.updateField('numeroPlacas', 10);
      result.current.updateField('redline', 2.5);
      result.current.updateField('precioBateria', 5000);
      result.current.updateField('numeroBaterias', 2);
    });

    expect(result.current.calculations.precioTotal).toBe(21250);
    expect(result.current.results.costoTotalEquipo).toBe('21250');
  });

  it('should calculate EPC minimo correctly', () => {
    const { result } = renderHook(() => useSalesCut());

    act(() => {
      result.current.updateField('watts', 450);
      result.current.updateField('numeroPlacas', 10);
      result.current.updateField('redline', 2.5);
      result.current.updateField('precioBateria', 5000);
      result.current.updateField('numeroBaterias', 2);
    });

    const epcMinimo = 21250 / 4500;
    expect(result.current.calculations.epcMinimo).toBeCloseTo(epcMinimo);
    expect(result.current.results.epcMinimoSunrun).toBe('4.722');
  });

  it('should calculate ganancia consultor neta without EPC de venta', () => {
    const { result } = renderHook(() => useSalesCut());

    act(() => {
      result.current.updateField('watts', 450);
      result.current.updateField('numeroPlacas', 10);
      result.current.updateField('redline', 2.5);
      result.current.updateField('gananciaConsultor', 1.5);
    });

    const diferencial = 1.5;
    const gananciaEsperada = (diferencial * 4500) * 0.9;

    expect(result.current.calculations.gananciaConsultorNeta).toBeCloseTo(gananciaEsperada);
  });

  it('should calculate ganancia consultor neta with EPC de venta', () => {
    const { result } = renderHook(() => useSalesCut());

    act(() => {
      result.current.updateField('watts', 450);
      result.current.updateField('numeroPlacas', 10);
      result.current.updateField('redline', 2.5);
      result.current.updateField('epcVenta', 3.5);
    });

    const size = 4500;
    const precioPlacas = 11250;
    const epcMinimo = precioPlacas / size;
    const gananciaEsperada = ((3.5 - epcMinimo) * size) * 0.9;

    expect(result.current.calculations.gananciaConsultorNeta).toBeCloseTo(gananciaEsperada);
  });

  it('should format decimals correctly with max 3 digits', () => {
    const { result } = renderHook(() => useSalesCut());

    act(() => {
      result.current.updateField('watts', 333);
      result.current.updateField('numeroPlacas', 3);
      result.current.updateField('redline', 3.14159);
    });

    const size = 999;
    const precioPlacas = size * 3.14159;
    const epcMinimo = precioPlacas / size;

    expect(result.current.results.epcMinimoSunrun).toBe('3.141');
  });

  it('should reset all values correctly', () => {
    const { result } = renderHook(() => useSalesCut());

    act(() => {
      result.current.updateField('watts', 450);
      result.current.updateField('numeroPlacas', 10);
      result.current.updateField('nombreCliente', 'Test Client');
    });

    expect(result.current.data.watts).toBe(450);

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toEqual({
      nombreCliente: '',
      watts: 0,
      numeroPlacas: 0,
      redline: 0,
      precioBateria: 0,
      numeroBaterias: 0,
      gananciaConsultor: 0,
      epcVenta: 0,
      pagoCliente: 0,
    });
  });

  it('should copy data to clipboard with correct format', () => {
    const { result } = renderHook(() => useSalesCut());

    act(() => {
      result.current.updateField('nombreCliente', 'Juan Pérez');
      result.current.updateField('watts', 450);
      result.current.updateField('numeroPlacas', 10);
      result.current.updateField('numeroBaterias', 2);
      result.current.updateField('epcVenta', 3.5);
      result.current.updateField('gananciaConsultor', 1.5);
      result.current.updateField('pagoCliente', 1500);
    });

    act(() => {
      result.current.copyToClipboard();
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('Sistema: 10 450 Baterías: 2')
    );
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('Nombre del Cliente: Juan Pérez')
    );
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('EPC de venta: 3.5')
    );
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('Pago Cliente: 1500')
    );
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('Pago Cliente con subvención: 1100')
    );
  });

  it('should handle edge case with zero size', () => {
    const { result } = renderHook(() => useSalesCut());

    act(() => {
      result.current.updateField('watts', 0);
      result.current.updateField('numeroPlacas', 10);
    });

    expect(result.current.calculations.size).toBe(0);
    expect(result.current.calculations.epcMinimo).toBe(0);
    expect(result.current.results.sizeKW).toBe('0');
  });

  it('should calculate diferencial correctly', () => {
    const { result } = renderHook(() => useSalesCut());

    act(() => {
      result.current.updateField('gananciaConsultor', 2.5);
    });

    expect(result.current.calculations.diferencial).toBe(2.5);
    expect(result.current.results.diferencial).toBe('2.5');
  });
});