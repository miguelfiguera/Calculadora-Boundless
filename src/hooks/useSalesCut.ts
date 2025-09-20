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
  montoSubvencion: number;
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

const getInitialData = (user: string | null): SalesCutData => {
  let redline = 0;

  switch (user) {
    case 'Horizon':
    case 'Elias':
      redline = 2.10;
      break;
    case 'RR-Advisor':
      redline = 2.20;
      break;
    default:
      redline = 0;
  }

  return {
    nombreCliente: '',
    watts: 0,
    numeroPlacas: 0,
    redline,
    precioBateria: 11200,
    numeroBaterias: 0,
    gananciaConsultor: 0,
    epcVenta: 0,
    pagoCliente: 0,
    montoSubvencion: 400,
  };
};

export const useSalesCut = (user: string | null = null) => {
  const [data, setData] = useState<SalesCutData>(() => getInitialData(user));

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
    const epcBase = size > 0 ? precioTotal / size : 0;

    let epcMinimo = 0;
    let diferencial = 0;
    let gananciaConsultorNeta = 0;

    if (!data.epcVenta || data.epcVenta === 0) {
      // Si NO hay EPC de venta, el EPC mínimo incluye la ganancia del consultor
      epcMinimo = epcBase + data.gananciaConsultor;
      diferencial = data.gananciaConsultor;
      gananciaConsultorNeta = (diferencial * size) * 0.9;
    } else {
      // Si HAY EPC de venta, el EPC mínimo es solo el base y el diferencial se calcula
      epcMinimo = epcBase;
      diferencial = data.epcVenta - epcBase;
      gananciaConsultorNeta = (diferencial * size) * 0.9;
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
    gananciaConsultorNeta: formatDecimal(calculations.gananciaConsultorNeta, 2),
    epcMinimoSunrun: formatDecimal(calculations.epcMinimo),
    diferencial: formatDecimal(calculations.diferencial)
  }), [calculations]);

  const copyToClipboard = useCallback(() => {
    const currentDate = new Date().toLocaleDateString('es-ES');
    const pagoConSubvencion = data.pagoCliente - data.montoSubvencion;

    let text = `Sistema: ${data.numeroPlacas} ${data.watts} Baterías: ${data.numeroBaterias}
Nombre del Cliente: ${data.nombreCliente}
EPC de venta: ${data.epcVenta || ''}
Ganancia Consultor por kw: ${formatDecimal(calculations.diferencial)}
Ganancia Consultor (-10%): $${formatDecimal(calculations.gananciaConsultorNeta, 2)}
Pago Cliente: ${data.pagoCliente || ''}`;

    // Solo agregar pago con subvención si ES Horizon
    if (user === 'Horizon') {
      text += `\nPago Cliente con subvención: ${pagoConSubvencion}`;
    }

    text += `\nFecha: ${currentDate}`;

    navigator.clipboard.writeText(text);
    return text;
  }, [data, calculations, user]);

  const reset = useCallback(() => {
    setData(getInitialData(user));
  }, [user]);

  return {
    data,
    calculations,
    results,
    updateField,
    copyToClipboard,
    reset
  };
};