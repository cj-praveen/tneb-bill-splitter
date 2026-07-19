import React, { useState, useEffect } from 'react';

export default function BillSplitter({ data }) {
  const [splitCount, setSplitCount] = useState(1);
  const [personUnits, setPersonUnits] = useState([]);

  useEffect(() => {
    setPersonUnits(Array(splitCount).fill(0));
  }, [splitCount]);

  const handleUnitChange = (index, value) => {
    const newUnits = [...personUnits];
    newUnits[index] = value;
    setPersonUnits(newUnits);
  };

  const totalUnits = data.totalunits || 0;
  const unitCharges = data.unitcharges || 0;
  const extraCharges = data.extracharges || 0;
  const fixedCharges = data.fixedcharges || 0;

  const unitPrice = totalUnits > 0 ? Math.floor(unitCharges / totalUnits) : 0;
  const extraPrice = totalUnits > 0 ? extraCharges / totalUnits : 0;
  const fixedPrice = splitCount > 0 ? fixedCharges / splitCount : 0;

  let totalCalculated = 0;
  let totalUnitsEntered = 0;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6 mt-10">
      <h1 className="text-2xl font-bold text-gray-800 text-center">TNEB Bill Splitter</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col justify-between h-full">
          <label className="block text-sm font-medium text-gray-700">Total Units</label>
          <input type="number" value={data.totalunits} readOnly className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-gray-50 focus:outline-none" />
        </div>
        <div className="flex flex-col justify-between h-full">
          <label className="block text-sm font-medium text-gray-700">Total Amount (₹)</label>
          <input type="number" value={data.totalamount} readOnly className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-gray-50 focus:outline-none" />
        </div>
        <div className="flex flex-col justify-between h-full">
          <label className="block text-sm font-medium text-gray-700">Unit Charges (₹) <span className="text-xs text-gray-500 font-normal">[CC Charges]</span></label>
          <input type="number" value={data.unitcharges} readOnly className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-gray-50 focus:outline-none" />
        </div>
        <div className="flex flex-col justify-between h-full">
          <label className="block text-sm font-medium text-gray-700">Extra Charges (₹) <span className="text-xs text-gray-500 font-normal block md:inline mt-0.5 md:mt-0">[Tax, Penalty, Adjustment, Welding, Excess Demand]</span></label>
          <input type="number" value={data.extracharges} readOnly className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-gray-50 focus:outline-none" />
        </div>
        <div className="flex flex-col justify-between h-full">
          <label className="block text-sm font-medium text-gray-700">Fixed Charges (₹)</label>
          <input type="number" value={data.fixedcharges} readOnly className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-gray-50 focus:outline-none" />
        </div>
        <div className="md:col-span-2 flex flex-col justify-between h-full">
          <label htmlFor="splitcount" className="block text-sm font-medium text-gray-700">Number of People to Split</label>
          <input type="number" id="splitcount" value={splitCount} onChange={(e) => setSplitCount(Math.max(1, parseInt(e.target.value) || 1))} min="1" className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none" />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Units Consumed Per Person</h2>
        <div className="space-y-3">
          {personUnits.map((units, index) => (
            <div key={index} className="flex items-center gap-4">
              <label className="w-24 text-sm font-medium text-gray-700">Person {index + 1}</label>
              <input 
                type="number" 
                value={units === 0 ? '' : units} 
                onChange={(e) => handleUnitChange(index, parseFloat(e.target.value) || 0)} 
                className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none" 
                placeholder="Units consumed" 
              />
            </div>
          ))}
        </div>
      </div>

      {totalUnits > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Split Breakdown</h2>
          <div className="bg-gray-100 p-4 rounded-md space-y-2">
            {personUnits.map((units, index) => {
              const personUnitCost = units * unitPrice;
              const personExtraCost = units * extraPrice;
              const personTotal = personUnitCost + personExtraCost + fixedPrice;

              totalCalculated += personTotal;
              totalUnitsEntered += units;

              return (
                <div key={index} className="py-2 border-b border-gray-200 last:border-0">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Person {index + 1} ({units} units)</span>
                    <span className="text-sm font-bold text-gray-900">₹{personTotal.toFixed(2)}</span>
                  </div>
                  <ul className="text-xs text-gray-500 mt-2 space-y-1">
                    <li><span className="font-medium text-gray-600">Unit Charges:</span> {units} units × ₹{unitPrice.toFixed(2)} = ₹{personUnitCost.toFixed(2)}</li>
                    <li><span className="font-medium text-gray-600">Extra Charges:</span> {units} units × ₹{extraPrice.toFixed(2)} = ₹{personExtraCost.toFixed(2)}</li>
                    <li><span className="font-medium text-gray-600">Fixed Charges:</span> ₹{fixedPrice.toFixed(2)}</li>
                  </ul>
                </div>
              );
            })}
            
            <div className="mt-4 pt-3 border-t-2 border-gray-300">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total Units Accounted:</span>
                <span className={totalUnitsEntered !== totalUnits ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>
                  {totalUnitsEntered} / {totalUnits}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-800 mt-1">
                <span>Total Calculated Amount:</span>
                <span>₹{totalCalculated.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
