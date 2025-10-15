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
  leadFee: number;
  adders: number;
  porcentajeComisionConsultor: number;
}

export interface SalesCutCalculations {
  size: number;
  precioPlacas: number;
  precioTotal: number;
  epcMinimo: number;
  diferencial: number;
  gananciaConsultorNeta: number;
  precioVenta: number;
  comisionInstaladora: number;
  ochentaPorciento: number;
  montoDisponible: number;
  comisionConsultor: number;
  comisionGerente: number;
  gananciaBruta: number;
}

export interface SalesCutResults {
  sizeKW: string;
  costoTotalEquipo: string;
  gananciaConsultorNeta: string;
  epcMinimoSunrun: string;
  diferencial: string;
  comisionInstaladora: string;
  comisionConsultor: string;
  comisionGerente: string;
  gananciaBruta: string;
}

const getInitialData = (user: string | null): SalesCutData => {
  let redline = 2.35; // Valor por defecto para cualquier otro usuario
  let precioBateria = 11200; // Valor por defecto

  switch (user) {
    case 'Horizon':
    case 'Elias':
      redline = 2.10;
      break;
    case 'RR-Advisor':
      redline = 2.20;
      break;
    case 'JRamos':
      redline = 1.52; // Baseline para Boundless
      precioBateria = 9000; // Precio de batería para Boundless
      break;
    default:
      redline = 2.35; // Usuarios no listados originalmente
  }

  return {
    nombreCliente: '',
    watts: 0,
    numeroPlacas: 0,
    redline,
    precioBateria,
    numeroBaterias: 0,
    gananciaConsultor: 0,
    epcVenta: 0,
    pagoCliente: 0,
    montoSubvencion: 400,
    leadFee: 150,
    adders: 0,
    porcentajeComisionConsultor: 62, // Valor por defecto
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

    let precioPlacas = 0;
    let precioTotal = 0;
    let epcBase = 0;

    if (user === 'JRamos') {
      // Fórmulas específicas para Boundless
      precioPlacas = size * 1.52;
      precioTotal = size * 1.52 + (9000 * data.numeroBaterias);
      // EPC mínimo: (tamaño * 1.52 + 9000) / tamaño
      epcBase = size > 0 ? (size * 1.52 + 9000) / size : 0;
    } else {
      // Fórmulas para otros usuarios
      precioPlacas = size * data.redline;
      precioTotal = precioPlacas + (data.precioBateria * data.numeroBaterias);
      epcBase = size > 0 ? precioTotal / size : 0;
    }

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

    // Cálculos específicos para Boundless
    let precioVenta = 0;
    let comisionInstaladora = 0;
    let ochentaPorciento = 0;
    let montoDisponible = 0;
    let comisionConsultor = 0;
    let comisionGerente = 0;
    let gananciaBruta = 0;

    if (user === 'JRamos') {
      precioVenta = size * data.epcVenta;
      gananciaBruta = precioVenta - precioTotal; // Ganancia bruta = precio de venta - costo total del equipo
      comisionInstaladora = gananciaBruta * 0.20; // 20% de la ganancia bruta
      ochentaPorciento = gananciaBruta * 0.80; // 80% de la ganancia bruta
      montoDisponible = ochentaPorciento - data.leadFee - data.adders;
      comisionConsultor = montoDisponible * (data.porcentajeComisionConsultor / 100);
      comisionGerente = montoDisponible - comisionConsultor;
    }

    return {
      size,
      precioPlacas,
      precioTotal,
      epcMinimo,
      diferencial,
      gananciaConsultorNeta,
      precioVenta,
      comisionInstaladora,
      ochentaPorciento,
      montoDisponible,
      comisionConsultor,
      comisionGerente,
      gananciaBruta
    };
  }, [data, user]);

  const results = useMemo<SalesCutResults>(() => ({
    sizeKW: formatDecimal(calculations.size / 1000),
    costoTotalEquipo: formatDecimal(calculations.precioTotal),
    gananciaConsultorNeta: formatDecimal(calculations.gananciaConsultorNeta, 2),
    epcMinimoSunrun: formatDecimal(calculations.epcMinimo),
    diferencial: formatDecimal(calculations.diferencial),
    comisionInstaladora: formatDecimal(calculations.comisionInstaladora, 2),
    comisionConsultor: formatDecimal(calculations.comisionConsultor, 2),
    comisionGerente: formatDecimal(calculations.comisionGerente, 2),
    gananciaBruta: formatDecimal(calculations.gananciaBruta, 2)
  }), [calculations]);

  const copyToClipboard = useCallback(() => {
    const currentDate = new Date().toLocaleDateString('es-ES');
    const pagoConSubvencion = data.pagoCliente - data.montoSubvencion;

    let text = '';

    if (user === 'JRamos') {
      // Estructura para Boundless
      const porcentajeGerente = 100 - data.porcentajeComisionConsultor;
      text = `Sistema: ${data.numeroPlacas} Placas - ${data.watts} Watts + Baterías: ${data.numeroBaterias}
Nombre del Cliente: ${data.nombreCliente}
EPC de venta: ${data.epcVenta || ''}
Ganancia por KW: ${formatDecimal(calculations.diferencial)}
Ganancia de Consultor (${data.porcentajeComisionConsultor}%): $${formatDecimal(calculations.comisionConsultor, 2)}
Ganancia de Gerente (${porcentajeGerente}%): $${formatDecimal(calculations.comisionGerente, 2)}
Comisión Instaladora (20%): $${formatDecimal(calculations.comisionInstaladora, 2)}
Adders: $${data.adders || 0}
Pago Cliente: $${data.pagoCliente || ''}
Fecha: ${currentDate}`;
    } else {
      // Estructura para otros usuarios
      text = `Sistema: ${data.numeroPlacas} Placas - ${data.watts} Watts + Baterías: ${data.numeroBaterias}
Nombre del Cliente: ${data.nombreCliente}
EPC de venta: ${data.epcVenta || ''}
Ganancia Consultor por kw: ${formatDecimal(calculations.diferencial)}
Ganancia Consultor (-10%): $${formatDecimal(calculations.gananciaConsultorNeta, 2)}
Pago Cliente: $${data.pagoCliente || ''}`;

      // Solo agregar pago con subvención si ES Horizon
      if (user === 'Horizon') {
        text += `\nPago Cliente con subvención: $${pagoConSubvencion}`;
      }

      text += `\nFecha: ${currentDate}`;
    }

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