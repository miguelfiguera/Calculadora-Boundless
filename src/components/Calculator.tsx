import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSalesCut } from '../hooks/useSalesCut';
import InputField from './InputField';
import Results from './Results';

const Calculator: React.FC = () => {
  const { user, logout } = useAuth();
  const { data, results, updateField, copyToClipboard, reset } = useSalesCut(user);
  const [copied, setCopied] = useState(false);
  const isHorizon = user === 'Horizon';
  const isJRamos = user === 'JRamos';

  const handleCopy = () => {
    copyToClipboard();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-8">
      <div className="bg-gray-800 shadow-lg px-4 py-4 mb-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">Boundless Calculator</h1>
            <p className="text-sm text-gray-400">{user}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-6">Datos de Entrada</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <InputField
              label="Nombre del Cliente"
              name="nombreCliente"
              type="text"
              value={data.nombreCliente}
              onChange={(value) => updateField('nombreCliente', value)}
              placeholder="Ingrese el nombre del cliente"
            />

            <InputField
              label="Watts"
              name="watts"
              value={data.watts}
              onChange={(value) => updateField('watts', parseFloat(value) || 0)}
              placeholder="Máx. 4 dígitos"
              max={9999}
            />

            <InputField
              label="Número de Placas"
              name="numeroPlacas"
              value={data.numeroPlacas}
              onChange={(value) => updateField('numeroPlacas', parseInt(value) || 0)}
              placeholder="Cantidad de placas solares"
            />

            <InputField
              label={isJRamos ? "Baseline" : "Redline"}
              name="redline"
              value={data.redline}
              onChange={(value) => updateField('redline', parseFloat(value) || 0)}
              placeholder="Valor con 2 decimales"
              isDecimal={true}
              step="0.01"
            />

            <InputField
              label="Precio Batería ($)"
              name="precioBateria"
              value={data.precioBateria}
              onChange={(value) => updateField('precioBateria', parseFloat(value) || 0)}
              placeholder="Precio en dólares"
              isDecimal={true}
            />

            <InputField
              label="Número de Baterías"
              name="numeroBaterias"
              value={data.numeroBaterias}
              onChange={(value) => updateField('numeroBaterias', parseInt(value) || 0)}
              placeholder="Cantidad de baterías"
            />

            <InputField
              label="EPC de Venta (Sunrun)"
              name="epcVenta"
              value={data.epcVenta}
              onChange={(value) => updateField('epcVenta', parseFloat(value) || 0)}
              placeholder="EPC en Sunrun"
              isDecimal={true}
              required={false}
            />

            <InputField
              label="Pago Cliente"
              name="pagoCliente"
              value={data.pagoCliente}
              onChange={(value) => updateField('pagoCliente', parseFloat(value) || 0)}
              placeholder="Pago del cliente"
              isDecimal={true}
              required={false}
            />

            {isHorizon && (
              <InputField
                label="Monto Subvención ($)"
                name="montoSubvencion"
                value={data.montoSubvencion}
                onChange={(value) => updateField('montoSubvencion', parseFloat(value) || 0)}
                placeholder="Monto de la subvención"
                isDecimal={true}
                required={false}
              />
            )}

            {isJRamos && (
              <>
                <InputField
                  label="Lead Fee"
                  name="leadFee"
                  value={`-$${data.leadFee}`}
                  onChange={() => {}} // No se puede modificar
                  placeholder="-$150"
                  type="text"
                  required={false}
                  disabled={true}
                />

                <InputField
                  label="Adders ($)"
                  name="adders"
                  value={data.adders}
                  onChange={(value) => updateField('adders', parseFloat(value) || 0)}
                  placeholder="Monto adicional"
                  isDecimal={true}
                  required={false}
                />
              </>
            )}
          </div>

          {isJRamos && (
            <div className="mt-6 mb-6 p-6 bg-gray-700 rounded-lg">
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Ajustar Comisión del Consultor: {data.porcentajeComisionConsultor}%
              </label>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-xs text-gray-400">50%</span>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={[50, 60, 62, 64, 66].indexOf(data.porcentajeComisionConsultor)}
                  onChange={(e) => {
                    const index = parseInt(e.target.value);
                    const porcentajes = [50, 60, 62, 64, 66];
                    updateField('porcentajeComisionConsultor', porcentajes[index]);
                  }}
                  className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-xs text-gray-400">66%</span>
              </div>
              <div className="flex justify-between px-2">
                <span className="text-xs text-gray-500">50%</span>
                <span className="text-xs text-gray-500">60%</span>
                <span className="text-xs text-gray-500">62%</span>
                <span className="text-xs text-gray-500">64%</span>
                <span className="text-xs text-gray-500">66%</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={handleCopy}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {copied ? '✓ Copiado!' : 'Copiar Datos'}
            </button>

            <button
              onClick={reset}
              className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>

        <Results results={results} user={user} />
      </div>
    </div>
  );
};

export default Calculator;