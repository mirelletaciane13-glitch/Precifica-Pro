import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Calculator, 
  Settings, 
  Package, 
  DollarSign, 
  Zap, 
  Printer, 
  User, 
  ChevronRight,
  Sparkles,
  Info,
  ShoppingBag
} from 'lucide-react';

interface BoxType {
  id: string;
  name: string;
  quantity: number;
  sheetsPerUnit: number;
  totalSheetsManual?: number;
  isManual?: boolean;
}

interface AdditionalCost {
  id: string;
  name: string;
  value: number;
}

export default function App() {
  // 1. Paper Configuration
  const [paperType, setPaperType] = useState('Papel Fotográfico 180g');
  const [paperUnitCost, setPaperUnitCost] = useState(0.30);

  // 2. Box Types
  const [boxTypes, setBoxTypes] = useState<BoxType[]>([
    { id: '1', name: 'Caixa Milk', quantity: 5, sheetsPerUnit: 1, isDefault: true },
    { id: '2', name: 'Caixa Pirâmide', quantity: 5, sheetsPerUnit: 1, isDefault: true },
    { id: '3', name: 'Caixa Alça', quantity: 5, sheetsPerUnit: 1, isDefault: true },
    { id: '6', name: 'Caixa Coração', quantity: 5, sheetsPerUnit: 1, isDefault: true },
    { id: '7', name: 'Toppers de docinho', quantity: 15, sheetsPerUnit: 0, totalSheetsManual: 1, isManual: true, isDefault: true },
  ]);

  // 4. Production Costs
  const [costs, setCosts] = useState({
    energy: 5.00,
    printing: 5.00,
    labor: 20.00,
  });

  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>([
    { id: '1', name: 'Fita de Cetim', value: 2.00 },
    { id: '2', name: 'Embalagem', value: 3.00 },
  ]);

  const [showResults, setShowResults] = useState(false);
  const [unitMargin, setUnitMargin] = useState(0.3);

  // Calculations
  const calculations = useMemo(() => {
    const totalSheets = boxTypes.reduce((acc, box) => {
      if (box.isManual && box.totalSheetsManual !== undefined) {
        return acc + box.totalSheetsManual;
      }
      return acc + (box.quantity * box.sheetsPerUnit);
    }, 0);

    const totalPaperCost = totalSheets * paperUnitCost;
    const totalAdditionalCosts = additionalCosts.reduce((acc, c) => acc + c.value, 0);
    const totalProductionCosts = costs.energy + costs.printing + costs.labor + totalAdditionalCosts;
    const totalKitCost = totalPaperCost + totalProductionCosts;

    const margins = [
      { label: 'Sugestão de Venda (20%)', margin: 0.2 },
      { label: 'Sugestão de Venda (30%)', margin: 0.3 },
      { label: 'Sugestão de Venda (40%)', margin: 0.4 },
      { label: 'Sugestão de Venda (50%)', margin: 0.5 },
      { label: 'Sugestão de Venda (60%)', margin: 0.6 },
      { label: 'Sugestão de Venda (70%)', margin: 0.7 },
      { label: 'Sugestão de Venda (80%)', margin: 0.8 },
      { label: 'Sugestão de Venda (90%)', margin: 0.9 }
    ];

    const suggestions = margins.map(m => {
      const profit = totalKitCost * m.margin;
      const finalPrice = totalKitCost + profit;
      return {
        label: m.label,
        percentage: m.margin * 100,
        profit,
        finalPrice
      };
    });

    // Unit prices (based on selected margin)
    const totalItems = boxTypes.reduce((acc, box) => acc + box.quantity, 0);
    const unitFixedCost = totalItems > 0 ? totalProductionCosts / totalItems : 0;

    const unitPrices = boxTypes.map(box => {
      const sheetsUsed = box.isManual && box.totalSheetsManual !== undefined 
        ? box.totalSheetsManual / (box.quantity || 1) 
        : box.sheetsPerUnit;
      
      const boxPaperCost = sheetsUsed * paperUnitCost;
      const boxTotalCost = boxPaperCost + unitFixedCost;
      const unitProfit = boxTotalCost * unitMargin;
      return {
        name: box.name,
        price: boxTotalCost + unitProfit
      };
    });

    return {
      totalSheets,
      totalPaperCost,
      totalAdditionalCosts,
      totalProductionCosts,
      totalKitCost,
      suggestions,
      unitPrices
    };
  }, [boxTypes, paperUnitCost, costs, unitMargin, additionalCosts]);

  // Auto-update printing cost based on total sheets (R$ 1.00 per sheet)
  useEffect(() => {
    setCosts(prev => ({ ...prev, printing: calculations.totalSheets }));
  }, [calculations.totalSheets]);

  const addBoxType = (isManual = false) => {
    const newBox: BoxType = {
      id: Math.random().toString(36).substr(2, 9),
      name: isManual ? 'Item Adicional' : 'Nova Caixa',
      quantity: 1,
      sheetsPerUnit: isManual ? 0 : 1,
      totalSheetsManual: isManual ? 1 : 0,
      isManual
    };
    setBoxTypes([...boxTypes, newBox]);
  };

  const removeBoxType = (id: string) => {
    setBoxTypes(boxTypes.filter(box => box.id !== id));
  };

  const updateBox = (id: string, field: keyof BoxType, value: any) => {
    setBoxTypes(boxTypes.map(box => box.id === id ? { ...box, [field]: value } : box));
  };

  const addAdditionalCost = () => {
    const newCost: AdditionalCost = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Novo Custo',
      value: 0
    };
    setAdditionalCosts([...additionalCosts, newCost]);
  };

  const removeAdditionalCost = (id: string) => {
    setAdditionalCosts(additionalCosts.filter(c => c.id !== id));
  };

  const updateAdditionalCost = (id: string, field: keyof AdditionalCost, value: any) => {
    setAdditionalCosts(additionalCosts.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <header className="text-center mb-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block p-2 px-4 bg-pastel-pink/30 rounded-full mb-4"
        >
          <span className="text-sm font-bold text-pink-600 tracking-widest uppercase flex items-center gap-2">
            <Sparkles size={16} /> Papelaria Criativa
          </span>
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black text-stone-800 mb-2">
          Precifica <span className="text-pastel-pink">Pro</span>
        </h1>
        <p className="text-stone-500">Calcule seus custos e lucre com amor 💖</p>
      </header>

      <div className="grid gap-8">
        {/* 1. Paper Configuration */}
        <section className="glass-card p-6 md:p-8">
          <h2 className="section-title">
            <Settings className="text-pastel-purple" /> Configuração do Papel
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-600 mb-1">Tipo de Papel</label>
              <input 
                type="text" 
                value={paperType}
                onChange={(e) => setPaperType(e.target.value)}
                className="input-field"
                placeholder="Ex: Fotográfico 180g"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-600 mb-1">Valor da Folha (R$)</label>
              <input 
                type="number" 
                step="0.01"
                value={paperUnitCost}
                onChange={(e) => setPaperUnitCost(parseFloat(e.target.value) || 0)}
                className="input-field"
              />
            </div>
          </div>
        </section>

        {/* 2. Box Quantities */}
        <section className="glass-card p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="section-title mb-0">
              <Package className="text-pastel-blue" /> Quantidade de Caixas no Kit
            </h2>
            <div className="flex gap-2 w-full md:w-auto">
              <button onClick={() => addBoxType(false)} className="btn-secondary text-sm flex-1 md:flex-none">
                <Plus size={18} /> Caixa
              </button>
              <button onClick={() => addBoxType(true)} className="btn-secondary text-sm flex-1 md:flex-none bg-pastel-purple hover:bg-purple-200">
                <Plus size={18} /> Item adicional
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <AnimatePresence>
              {boxTypes.map((box) => (
                <motion.div 
                  key={box.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 bg-stone-50/50 rounded-2xl border border-stone-100 flex flex-wrap md:flex-nowrap items-end gap-4"
                >
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-bold text-stone-400 mb-1 uppercase">Nome</label>
                    <input 
                      type="text" 
                      value={box.name}
                      onChange={(e) => updateBox(box.id, 'name', e.target.value)}
                      className="input-field py-1.5"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-bold text-stone-400 mb-1 uppercase">Qtd</label>
                    <input 
                      type="number" 
                      value={box.quantity}
                      onChange={(e) => updateBox(box.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="input-field py-1.5"
                    />
                  </div>
                  {box.isManual ? (
                    <div className="w-24">
                      <label className="block text-xs font-bold text-stone-400 mb-1 uppercase">Total Folhas</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={box.totalSheetsManual}
                        onChange={(e) => updateBox(box.id, 'totalSheetsManual', parseFloat(e.target.value) || 0)}
                        className="input-field py-1.5"
                      />
                    </div>
                  ) : (
                    <div className="w-24">
                      <label className="block text-xs font-bold text-stone-400 mb-1 uppercase">Folhas/Un</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={box.sheetsPerUnit}
                        onChange={(e) => updateBox(box.id, 'sheetsPerUnit', parseFloat(e.target.value) || 0)}
                        className="input-field py-1.5"
                      />
                    </div>
                  )}
                  {!box.isManual && (
                    <div className="w-24 text-center pb-2">
                      <span className="block text-[10px] font-bold text-stone-400 uppercase">Total Folhas</span>
                      <span className="text-sm font-bold text-stone-700">{Math.round(box.quantity * box.sheetsPerUnit)}</span>
                    </div>
                  )}
                  <button 
                    onClick={() => removeBoxType(box.id)}
                    className="p-2 text-stone-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Total Sheets Summary */}
          <div className="mt-6 pt-4 border-t border-stone-100 flex justify-between items-center px-4">
            <span className="text-sm font-bold text-stone-400 uppercase">Resumo do Kit</span>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="block text-[10px] font-bold text-stone-400 uppercase">Total de Itens</span>
                <span className="text-lg font-black text-stone-700">
                  {boxTypes.reduce((acc, box) => acc + box.quantity, 0)}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-[10px] font-bold text-stone-400 uppercase">Total de Folhas</span>
                <span className="text-lg font-black text-pastel-pink">
                  {Math.round(calculations.totalSheets)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Additional Costs */}
        <section className="glass-card p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="section-title mb-0">
              <ShoppingBag className="text-pastel-orange" /> Custos Adicionais (Adereços/Extras)
            </h2>
            <button onClick={addAdditionalCost} className="btn-secondary text-sm">
              <Plus size={18} /> Adicionar
            </button>
          </div>
          
          <div className="grid gap-3">
            <AnimatePresence>
              {additionalCosts.map((cost) => (
                <motion.div 
                  key={cost.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 bg-stone-50/50 p-3 rounded-xl border border-stone-100"
                >
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={cost.name}
                      onChange={(e) => updateAdditionalCost(cost.id, 'name', e.target.value)}
                      className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-stone-700 w-full p-0"
                      placeholder="Ex: Fita, Cola, Strass..."
                    />
                  </div>
                  <div className="w-24 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-stone-100">
                    <span className="text-xs font-bold text-stone-400">R$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      value={cost.value}
                      onChange={(e) => updateAdditionalCost(cost.id, 'value', parseFloat(e.target.value) || 0)}
                      className="w-full text-sm font-bold text-stone-700 focus:outline-none"
                    />
                  </div>
                  <button 
                    onClick={() => removeAdditionalCost(cost.id)}
                    className="p-1.5 text-stone-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {additionalCosts.length === 0 && (
              <p className="text-center text-stone-400 text-sm italic py-4">Nenhum custo adicional adicionado.</p>
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-stone-100 text-right">
            <span className="text-[10px] font-bold text-stone-400 uppercase mr-2">Total Adicionais:</span>
            <span className="text-sm font-black text-stone-700">R$ {calculations.totalAdditionalCosts.toFixed(2)}</span>
          </div>
        </section>

        {/* 4. Production Costs */}
        <section className="glass-card p-6 md:p-8">
          <h2 className="section-title">
            <Zap className="text-pastel-yellow" /> Custos Fixos de Produção
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-600 mb-1 flex items-center gap-2">
                <Zap size={14} className="text-yellow-500" /> Energia (R$)
              </label>
              <input 
                type="number" 
                step="0.01"
                value={costs.energy}
                onChange={(e) => setCosts({ ...costs, energy: parseFloat(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-600 mb-1 flex items-center gap-2">
                <Printer size={14} className="text-blue-500" /> Impressão (R$)
              </label>
              <input 
                type="number" 
                step="0.01"
                value={costs.printing}
                onChange={(e) => setCosts({ ...costs, printing: parseFloat(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-600 mb-1 flex items-center gap-2">
                <User size={14} className="text-purple-500" /> Mão de Obra (R$)
              </label>
              <input 
                type="number" 
                step="0.01"
                value={costs.labor}
                onChange={(e) => setCosts({ ...costs, labor: parseFloat(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
          </div>
        </section>

        {/* Calculate Button */}
        <div className="flex justify-center py-4">
          <button 
            onClick={() => setShowResults(true)}
            className="btn-primary w-full md:w-auto px-12 text-lg"
          >
            <Calculator /> Calcular Preço
          </button>
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {showResults && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8 pb-12"
            >
              {/* Summary */}
              <div className="glass-card p-8 bg-pastel-green/10 border-pastel-green/30">
                <h2 className="section-title">
                  <Info className="text-pastel-green" /> Resumo de Custos
                </h2>
                
                {/* Highlight Card */}
                <div className="mb-8 p-6 bg-white rounded-3xl shadow-sm border border-pastel-green/20 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <span className="block text-sm font-bold text-stone-400 uppercase mb-1">Custo Total de Produção do Kit</span>
                    <span className="text-4xl font-black text-green-600">R$ {calculations.totalKitCost.toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 w-full md:w-auto">
                    <div className="flex justify-between gap-4">
                      <span className="text-sm text-stone-500">Papel:</span>
                      <span className="text-sm font-bold text-stone-700">R$ {calculations.totalPaperCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-sm text-stone-500">Energia:</span>
                      <span className="text-sm font-bold text-stone-700">R$ {costs.energy.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-sm text-stone-500">Impressão:</span>
                      <span className="text-sm font-bold text-stone-700">R$ {costs.printing.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-sm text-stone-500">Mão de Obra:</span>
                      <span className="text-sm font-bold text-stone-700">R$ {costs.labor.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-sm text-stone-500">Adicionais:</span>
                      <span className="text-sm font-bold text-stone-700">R$ {calculations.totalAdditionalCosts.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="text-right">
                    <span className="block text-[10px] font-bold text-stone-400 uppercase mb-0.5">Total de Custos Fixos</span>
                    <span className="text-sm font-bold text-stone-600">R$ {calculations.totalProductionCosts.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="grid md:grid-cols-3 gap-4">
                {calculations.suggestions.map((sug, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ y: -5 }}
                    className={`glass-card p-6 text-center border-2 ${
                      idx === 1 ? 'border-pastel-pink bg-pastel-pink/5' : 'border-transparent'
                    }`}
                  >
                    <div className="text-xs font-bold text-stone-400 uppercase mb-2">{sug.label}</div>
                    <div className="text-3xl font-black text-stone-800 mb-1">R$ {sug.finalPrice.toFixed(2)}</div>
                    <div className="inline-block px-3 py-1 bg-stone-100 rounded-full text-sm font-bold text-stone-600 mb-4">
                      {sug.percentage}% de Lucro
                    </div>
                    <div className="text-sm text-stone-500">
                      Valor do Lucro: <span className="font-bold text-green-500">R$ {sug.profit.toFixed(2)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Unit Prices */}
              <div className="glass-card p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <h2 className="section-title mb-0">
                    <DollarSign className="text-pastel-orange" /> Sugestão de Preço Unitário
                  </h2>
                  <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-100">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">Margem de Lucro</span>
                    <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-stone-100">
                      <input 
                        type="number"
                        value={Math.round(unitMargin * 100)}
                        onChange={(e) => setUnitMargin((parseInt(e.target.value) || 0) / 100)}
                        className="w-16 text-sm font-black text-stone-700 text-right focus:outline-none bg-transparent"
                      />
                      <span className="text-sm font-black text-stone-700">%</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-stone-400 mb-6 italic">* Baseado em {(unitMargin * 100).toFixed(0)}% de margem de lucro sobre o custo proporcional.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {calculations.unitPrices.map((unit, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-stone-50 rounded-xl border border-stone-100">
                      <span className="text-sm font-semibold text-stone-600">{unit.name}</span>
                      <span className="text-sm font-bold text-stone-800">R$ {unit.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-stone-400 hover:text-pastel-pink transition-colors text-sm font-bold flex items-center justify-center gap-2 mx-auto"
                >
                  Voltar ao topo <ChevronRight size={16} className="-rotate-90" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="mt-12 text-center text-stone-400 text-xs pb-8">
        <p>© {new Date().getFullYear()} Precifica Papelaria Criativa - Feito com ✨</p>
      </footer>
    </div>
  );
}
