import { useState, useMemo, useCallback } from 'react';
import { formatDecimal } from '../utils/formatters';

export interface SalesCutData {
  nombreCliente: string;
  watts: number;
  numeroPlacas: number;
  redline: number;
  precioBateria: number;
  numeroBaterias: number;
  gananciaConsultor: number;
  epcVenta: number;
  pagoCliente: number;
}

export interface SalesCutCalculations {
  size: number;
  precioPlacas: number;
  precioTotal: number;
  epcMinimo: number;
  diferencial: number;
  gananciaConsultorNeta: number;
}

export interface SalesCutResults {
  sizeKW: string;
  costoTotalEquipo: string;
  gananciaConsultorNeta: string;
  epcMinimoSunrun: string;
  diferencial: string;
}

const initialData: SalesCutData = {
  nombreCliente: '',
  watts: 0,
  numeroPlacas: 0,
  redline: 0,
  precioBateria: 0,
  numeroBaterias: 0,
  gananciaConsultor: 0,
  epcVenta: 0,
  pagoCliente: 0,
};

export const useSalesCut = () => {
  const [data, setData] = useState<SalesCutData>(initialData);

  const updateField = useCallback((field: keyof SalesCutData, value: string | number) => {
    setData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value : value
    }));
  }, []);

  const calculations = useMemo<SalesCutCalculations>(() => {
    const size = data.watts * data.numeroPlacas;
    const precioPlacas = size * data.redline;
    const precioTotal = precioPlacas + (data.precioBateria * data.numeroBaterias);
    const epcMinimo = size > 0 ? precioTotal / size : 0;
    const diferencial = data.gananciaConsultor + epcMinimo - epcMinimo;

    let gananciaConsultorNeta = 0;
    if (!data.epcVenta || data.epcVenta === 0) {
      gananciaConsultorNeta = (diferencial * size) * 0.9;
    } else if (data.epcVenta > 0) {
      gananciaConsultorNeta = ((data.epcVenta - epcMinimo) * size) * 0.9;
    }

    return {
      size,
      precioPlacas,
      precioTotal,
      epcMinimo,
      diferencial,
      gananciaConsultorNeta
    };
  }, [data]);

  const results = useMemo<SalesCutResults>(() => ({
    sizeKW: formatDecimal(calculations.size / 1000),
    costoTotalEquipo: formatDecimal(calculations.precioTotal),
    gananciaConsultorNeta: formatDecimal(calculations.gananciaConsultorNeta),
    epcMinimoSunrun: formatDecimal(calculations.epcMinimo),
    diferencial: formatDecimal(calculations.diferencial)
  }), [calculations]);

  const copyToClipboard = useCallback(() => {
    const currentDate = new Date().toLocaleDateString('es-ES');
    const pagoConSubvencion = data.pagoCliente - 400;

    const text = `Sistema: ${data.numeroPlacas} ${data.watts} Baterías: ${data.numeroBaterias}
Nombre del Cliente: ${data.nombreCliente}
EPC de venta: ${data.epcVenta || ''}
Ganancia Consultor por kw: ${formatDecimal(calculations.diferencial)}
Ganancia Consultor (-10%): $${formatDecimal(calculations.gananciaConsultorNeta)}
Pago Cliente: ${data.pagoCliente || ''}
Pago Cliente con subvención: ${pagoConSubvencion}
Fecha: ${currentDate}`;

    navigator.clipboard.writeText(text);
    return text;
  }, [data, calculations]);

  const reset = useCallback(() => {
    setData(initialData);
  }, []);

  return {
    data,
    calculations,
    results,
    updateField,
    copyToClipboard,
    reset
  };
};