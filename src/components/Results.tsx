import React from 'react';
import type { SalesCutResults } from '../hooks/useSalesCut';

interface ResultsProps {
  results: SalesCutResults;
}

const Results: React.FC<ResultsProps> = ({ results }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold text-white mb-4">Resultados</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Tamaño (kW)</p>
          <p className="text-white text-lg font-semibold">{results.sizeKW || '0'}</p>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Costo Total del Equipo</p>
          <p className="text-white text-lg font-semibold">${results.costoTotalEquipo || '0'}</p>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Ganancia del Consultor Neta (-10%)</p>
          <p className="text-green-400 text-lg font-semibold">${results.gananciaConsultorNeta || '0'}</p>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">EPC Mínimo en Sunrun</p>
          <p className="text-white text-lg font-semibold">{results.epcMinimoSunrun || '0'}</p>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 sm:col-span-2">
          <p className="text-gray-400 text-sm mb-1">Diferencial</p>
          <p className="text-blue-400 text-lg font-semibold">{results.diferencial || '0'}</p>
        </div>
      </div>
    </div>
  );
};

export default Results;