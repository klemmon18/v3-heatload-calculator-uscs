import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wine, 
  Thermometer, 
  Lightbulb, 
  CheckCircle2, 
  Info,
  ExternalLink,
  Zap,
  Box,
  Layers,
  Users,
  PhoneCall,
  AlertTriangle,
  Sun,
  ArrowRight,
  ChevronDown,
  Flame,
  ShieldCheck,
  X,
  Lock,
  Layout,
  MessageSquare
} from 'lucide-react';
import { 
  SurfaceInput, 
  UsageFactors, 
  InsulationRValue, 
  GlassType
} from './types';
import { calculateUSCSLoad } from './utils/calculations';
import { USCS_PRODUCTS } from './constants';

const LOGO_DATA_URI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAABQBAMAAAA+A8YJAAAAG1BMVEXYv8D///8AAAD/v8D/uMD/wMD/xMD/ycD/z8D8o7uLAAAACXBIWXMAAA7EAAAOxAGVKw4bAAADNUlEQVRYhe2XzY7TMBSFp0092NCOu2Ym4Q2YgXWvK8RMK+IdWInpDRZasWCFBSs66pC5z8TJxPlpYyD1U9V98uece+NzzonK6I8XG7W0Yp9yM48Hw5hS6XieVjR5FPsI68EwY8m0H09G37P7/CjO7vW7WFrx5FE0M2I9GGYsmfTjyY7f4X6/UUt75UfRDYYZi7N7fX6vX4LlxZNH0UaIDWCIscS/fX49L94S9hFiAxhirL7/8uvyYfHkUbQBYisYYizP7vN96ZeyjxArwPBiuXd/6RftLp48ijpArAfDiuX0Xp9fBks8eRRlgFgPhhlL/C9fnh9vifYRYgUYYuz8Pl/2Szl/p79X6Y9X+uMVX4KlxZNHUQeI68EwY4kfXz7Nl/mSR1EHiOvBMGPpt788Px5vCfYRYvVgmLE8v9fnh96STx5F9WCYsTy/z9f9MvYRYvVgmLEY6/P79bCkvZ6p83v98Up/vOJLsLR48ii6X6p349eDYcYSv/ny4eXJp8idX0/9/p9H8Zkv9xO5DYYZS/3+y4vXh+7mP463u/G7WNoLzYxi3RhizfH04uWpW89fL8f7e32vP8Xv/CjWjSHWHPv9L98fP3X9/mR9/2K9fS/uB8OMxfv9lzfXh67P/5Xv8/7yvX398uRRrB9DrDn+xsv3P3T7/H/5PrvPr/ul7S+eXhTr+9uMZcffevm7H7p+frf+yvYXu8/3S1+8vXjyKFYvNTPW679fHj91/X6/fJ+9/fK9Xf99+ZLHfLkv76fE70fRzIj1Xp9ff+p6S798v+8v7S7e8uRRVDPifq/P7/vPXO/vl/vL8X6+9MVLPT/W76fEb96/H8WqMfX7fPnyp/p9vvT5pS3B0p8vP4q3/W28H8U6D+P9fOmLXvNl3m+0fT/WzYv7f7x8/+P7fOn798ut938v/f6fR7FmHuvNf3p5vR/ i/vPXO/vl/vL8X6+9MVLPT/W76fEb96/H8WqMfX7fPnyp/p9vvT5pS3B0p8vP4q3/W28H8U6D+P9fOmLXvNl3m+0fT/WzYv7f7x8/+P7fOn798ut938v/f6fR7FmHuvNf3p5vR/uP1/m6/45n/ly76e8F08exRov7v94+fH960fP75f7y/V9L2t5O16fL365m9/29X68+I2Xf59uS38p3r6XNfvfXvx9S898mS/m7f6/L/W8v3R4eYsfL08exf8U/YvHkx9F89v2P9mDIn+p/N0fLzYv3va34pW/5EnxS97yF96LhP/CfyfD74T89+Xv/778A/X9R1/8G5T/N8W/R5P/f/9Yf+o/q8t8uf/0f8VvYfD08v1L8S/X0Uv9S639e/UfT5/8f+f663G/vT/9/7/F/234EizN7N+v9McXfAn79v6v99P/727+87jffvS5rOUp3va9eNu/f7p86P7v6/G3F//n8Gv59T+Pr/6uL/Wf3v4E64/Yv196/8/j998fX/1dvX0v+v8Gv9O79S/F0iYw/0mFmX26v9v6l8rMvP4vNf/vE86Yf6vM/m/Y/";

const App: React.FC = () => {
  const [surfaces, setSurfaces] = useState<SurfaceInput[]>([
    { id: '1', name: 'Wall 1', type: 'Wall', width: 10, height: 8, rValue: InsulationRValue.R19, isExterior: false, sunExposed: false, glassWidth: 0, glassHeight: 0, glassType: GlassType.None },
    { id: '2', name: 'Wall 2', type: 'Wall', width: 10, height: 8, rValue: InsulationRValue.R19, isExterior: false, sunExposed: false, glassWidth: 0, glassHeight: 0, glassType: GlassType.None },
    { id: '3', name: 'Wall 3', type: 'Wall', width: 8, height: 8, rValue: InsulationRValue.R19, isExterior: false, sunExposed: false, glassWidth: 0, glassHeight: 0, glassType: GlassType.None },
    { id: '4', name: 'Wall 4', type: 'Wall', width: 8, height: 8, rValue: InsulationRValue.R19, isExterior: false, sunExposed: false, glassWidth: 0, glassHeight: 0, glassType: GlassType.None },
    { id: '5', name: 'Ceiling', type: 'Ceiling', width: 10, height: 8, rValue: InsulationRValue.R30, isExterior: false, sunExposed: false, glassWidth: 0, glassHeight: 0, glassType: GlassType.None, isVaulted: false, minHeight: 8, maxHeight: 10 },
    { id: '6', name: 'Floor', type: 'Floor', width: 10, height: 8, rValue: InsulationRValue.None, isExterior: false, sunExposed: false, glassWidth: 0, glassHeight: 0, glassType: GlassType.None, isRadiantFloor: false },
  ]);

  const [usage, setUsage] = useState<UsageFactors>({
    peopleCount: 0,
    peopleHours: 0,
    applianceWatts: 0,
    applianceHours: 0,
    ledWatts: 20,
    ledHours: 5,
    incandescentWatts: 0,
    incandescentHours: 0,
    ambientTemp: 75,
    outdoorTemp: 95,
    targetTemp: 55,
    frequentDoorOpening: false,
    equipmentWatts: 0,
    equipmentHours: 0
  });

  const [leadSubmitted, setLeadSubmitted] = useState(false);
  
  const [vaporBarrier, setVaporBarrier] = useState<'unselected' | 'yes' | 'no'>('unselected');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [infoConfirmed, setInfoConfirmed] = useState(false);

  const isCalculable = useMemo(() => {
    return vaporBarrier === 'yes' || (vaporBarrier === 'no' && disclaimerAccepted);
  }, [vaporBarrier, disclaimerAccepted]);

  const result = useMemo(() => {
    return calculateUSCSLoad(surfaces, usage);
  }, [surfaces, usage]);

  const recommendedProducts = useMemo(() => {
    if (!isCalculable || !infoConfirmed) return [];
    return USCS_PRODUCTS.filter(p => p.btuCapacity >= result.totalBtuLoad)
      .sort((a, b) => a.btuCapacity - b.btuCapacity);
  }, [result.totalBtuLoad, isCalculable, infoConfirmed]);

  const updateSurface = (id: string, field: keyof SurfaceInput, value: any) => {
    if (infoConfirmed) setInfoConfirmed(false);

    setSurfaces(surfaces.map(s => {
      if (s.id === id) {
        let finalValue = value;
        
        if (['width', 'height', 'minHeight', 'maxHeight', 'glassWidth', 'glassHeight'].includes(field as string)) {
          const numVal = Number(value);
          if (numVal < 0) finalValue = 0;
          if (numVal > 1000) finalValue = 1000; 
        }

        const updated = { ...s, [field]: finalValue };
        
        return updated;
      }
      return s;
    }));
  };

  const handleVaporBarrierChange = (val: 'yes' | 'no') => {
    setVaporBarrier(val);
    if (val === 'no' && !disclaimerAccepted) {
      setShowDisclaimer(true);
    }
    setInfoConfirmed(false);
  };

  const parseNumberInput = (value: string) => {
    if (value === '') return 0;
    return Number(value.replace(/^0+(?=\d)/, ''));
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#333333] font-sans selection:bg-[#7A1C2D] selection:text-white pb-20">
      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl border-t-8 border-[#b30000] shadow-2xl relative">
            <button 
              onClick={() => { setShowDisclaimer(false); setVaporBarrier('unselected'); }} 
              className="absolute top-6 right-6 text-slate-400 hover:text-[#333333] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="p-10 md:p-14 space-y-8">
              <div className="flex items-center gap-4 text-[#b30000]">
                <AlertTriangle className="w-12 h-12" />
                <h2 className="text-4xl font-black uppercase tracking-tighter font-montserrat leading-none">Warning</h2>
              </div>
              
              <div className="space-y-6">
                <p className="text-2xl font-black text-[#333333] uppercase tracking-tight leading-tight font-montserrat">
                  A vapor barrier or closed-cell spray foam is REQUIRED for proper wine cellar construction.
                </p>
                <p className="text-lg text-slate-600 font-bold leading-relaxed italic border-l-4 border-slate-200 pl-6">
                  Without a proper vapor barrier, mold, mildew, and condensation failure are likely. Moisture infiltration will compromise cooling efficiency and cause structural damage.
                </p>
                <div className="bg-red-50 p-6 border border-red-100">
                  <p className="text-[13px] text-red-900 font-black uppercase tracking-[0.1em] leading-relaxed">
                    By continuing, you acknowledge full responsibility for system performance and potential environmental failures resulting from the absence of a proper vapor barrier.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => { setDisclaimerAccepted(true); setShowDisclaimer(false); }}
                className="w-full bg-[#333333] text-white py-6 text-lg font-black uppercase tracking-[0.3em] hover:bg-black transition-all active:scale-[0.98] font-montserrat shadow-xl"
              >
                I Acknowledge and Accept Responsibility
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Global Disclaimer Bar */}
      <div className="bg-[#b30000] text-white py-2 px-4 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        Estimates Only. Final requirements must be verified by US Cellar Systems.
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        
        {/* Header Section: Logo & Calculator Identity */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16 px-2">
          <div className="flex flex-col space-y-6 md:space-y-8 flex-1">
            <div className="flex items-center gap-4">
              <img 
                src={LOGO_DATA_URI} 
                alt="US Cellar Systems" 
                className="h-20 md:h-24 w-auto object-contain"
              />
            </div>
            
            <div className="space-y-4 max-w-2xl">
              <div className="inline-block bg-[#7A1C2D] text-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                Prototype Model A
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-black text-[#333333] uppercase tracking-tight font-montserrat leading-tight">
                Cellar BTU Load Calculator <br className="hidden md:block"/> & Product Recommendations
              </h1>
              <div className="pt-2">
                <a href="tel:562-728-5700" className="inline-flex items-center gap-2.5 bg-[#333333] text-white px-6 py-4 rounded-none font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-md group">
                  <PhoneCall className="w-4 h-4 group-hover:animate-bounce" /> Technical Support: 562.728.5700
                </a>
              </div>
            </div>
          </div>

          {/* THE BTU SQUARE */}
          <div className={`w-full lg:w-[480px] xl:w-[560px] min-h-[340px] rounded-none shadow-2xl flex flex-col items-center justify-center p-8 md:p-12 text-white relative overflow-hidden group transition-all duration-700 ${isCalculable && infoConfirmed ? 'bg-[#7A1C2D]' : 'bg-slate-300'}`}>
            <div className="absolute top-0 left-0 w-full h-full bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div className="relative z-10 text-center w-full flex flex-col items-center">
              <div className="text-[11px] md:text-[13px] font-black text-white/50 uppercase tracking-[0.3em] md:tracking-[0.4em] mb-4 md:mb-8 font-montserrat">Estimated Peak Load Requirement</div>
              
              {isCalculable ? (
                infoConfirmed ? (
                  <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center">
                    <div className="flex flex-col md:flex-row items-center justify-center md:gap-4 lg:gap-6">
                      <span className="text-[5.5rem] md:text-[7rem] lg:text-[8.5rem] xl:text-[10rem] font-black tracking-tighter drop-shadow-2xl font-montserrat leading-none">
                        {result.totalBtuLoad}
                      </span>
                      <span className="text-xl md:text-2xl lg:text-3xl font-light italic text-white/60 uppercase tracking-[0.1em] md:tracking-[0.2em] font-montserrat md:mb-4 lg:mb-6 md:self-end leading-none">
                        BTU/h
                      </span>
                    </div>
                    <div className="mt-4 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">Room Volume: {result.volume} cu.ft</div>
                  </div>
                ) : (
                  <div className="text-center space-y-6 max-w-xs mx-auto py-10">
                     <Lock className="w-16 h-16 text-white/40 mx-auto mb-4" />
                     <p className="text-[12px] font-black uppercase tracking-[0.2em] text-white/60 font-montserrat">Engine Locked: Review & Confirm Below</p>
                  </div>
                )
              ) : (
                <div className="text-center space-y-4 max-w-xs mx-auto py-10">
                   <AlertTriangle className="w-16 h-16 text-white/40 mx-auto mb-4" />
                   <p className="text-[12px] font-black uppercase tracking-[0.2em] text-white/60 font-montserrat">Engine Halted: Acknowledgment Required Below</p>
                </div>
              )}
            </div>

            <div className="mt-8 md:mt-0 md:absolute md:bottom-10 flex items-center gap-3 px-6 py-3 bg-white/10 border border-white/20 rounded-none backdrop-blur-md">
              <Zap className={`w-5 h-5 md:w-6 md:h-6 ${isCalculable && infoConfirmed ? 'text-amber-400 animate-pulse' : 'text-white/20'}`} />
              <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] font-montserrat whitespace-nowrap">
                {isCalculable && infoConfirmed ? 'Live Real-Time Engine' : 'Engine Standby'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-8 space-y-12">
            
            {/* Vapor Barrier Gatekeeper */}
            <section className="bg-[#333333] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none transition-transform group-hover:scale-110 duration-1000">
                <ShieldCheck className="w-32 h-32" />
              </div>
              <div className="relative z-10 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <h3 className="text-xl font-black uppercase tracking-[0.2em] font-montserrat">Structural Requirement</h3>
                    <p className="text-slate-400 font-bold italic text-sm">Does the space include a vapor barrier or closed-cell spray foam?</p>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleVaporBarrierChange('yes')}
                      className={`px-12 py-5 font-black uppercase tracking-widest text-sm transition-all shadow-xl ${vaporBarrier === 'yes' ? 'bg-[#7A1C2D] text-white border-none' : 'bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10'}`}
                    >
                      Yes
                    </button>
                    <button 
                      onClick={() => handleVaporBarrierChange('no')}
                      className={`px-12 py-5 font-black uppercase tracking-widest text-sm transition-all shadow-xl ${vaporBarrier === 'no' ? 'bg-[#b30000] text-white border-none' : 'bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10'}`}
                    >
                      No
                    </button>
                  </div>
                </div>
                
                {vaporBarrier === 'no' && disclaimerAccepted && (
                  <div className="p-6 bg-[#b30000]/10 border border-[#b30000]/30 animate-in slide-in-from-left-4 duration-500">
                     <p className="text-[11px] text-[#b30000] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4" /> Proceeding with No Vapor Barrier (Acknowledged)
                     </p>
                  </div>
                )}
              </div>
            </section>

            {/* 1. Construction & Insulation */}
            <section className={`transition-opacity duration-700 ${isCalculable ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none select-none'}`}>
              <div className="bg-white rounded-none shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-[#333333] px-10 py-7 flex items-center text-white rounded-none">
                  <h3 className="font-bold flex items-center gap-4 text-base uppercase tracking-[0.3em] font-montserrat">
                    <Layers className="w-6 h-6 text-[#7A1C2D]" /> Construction & Insulation
                  </h3>
                </div>
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                  {surfaces.map((s) => (
                    <div key={s.id} className="p-8 bg-slate-50 rounded-none border border-slate-200 space-y-6 transition-all hover:border-[#7A1C2D]/40 group shadow-sm hover:shadow-md">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
                        <span className="font-black text-base text-[#7A1C2D] uppercase tracking-wider font-montserrat">{s.name}</span>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={s.isExterior} 
                              onChange={(e) => updateSurface(s.id, 'isExterior', e.target.checked)}
                              className="w-5 h-5 rounded-none border-slate-300 text-[#7A1C2D] focus:ring-[#7A1C2D]" 
                            />
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Exterior</span>
                          </label>
                          {s.isExterior && (
                            <label className="flex items-center gap-2 cursor-pointer animate-in zoom-in-95 duration-200">
                              <Sun className={`w-5 h-5 ${s.sunExposed ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                              <input 
                                type="checkbox" 
                                checked={s.sunExposed} 
                                onChange={(e) => updateSurface(s.id, 'sunExposed', e.target.checked)}
                                className="w-5 h-5 rounded-none border-slate-300 text-[#7A1C2D] focus:ring-[#7A1C2D]" 
                              />
                              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Sun Exposed</span>
                            </label>
                          )}
                          {s.type === 'Floor' && (
                            <label className="flex items-center gap-2 cursor-pointer group/radiant">
                              <Flame className={`w-5 h-5 ${s.isRadiantFloor ? 'text-orange-500 fill-orange-500' : 'text-slate-300'}`} />
                              <input 
                                type="checkbox" 
                                checked={!!s.isRadiantFloor} 
                                onChange={(e) => updateSurface(s.id, 'isRadiantFloor', e.target.checked)}
                                className="w-5 h-5 rounded-none border-slate-300 text-[#7A1C2D] focus:ring-[#7A1C2D]" 
                              />
                              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest group-hover/radiant:text-orange-500 transition-colors">Radiant Heating</span>
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Floor Radiant Warning */}
                      {s.type === 'Floor' && s.isRadiantFloor && (
                        <div className="bg-orange-50 border border-orange-100 p-4 rounded-none flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                          <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
                          <p className="text-[11px] font-black uppercase tracking-widest text-orange-800">
                            Radiant floor heating significantly increases cooling load.
                          </p>
                        </div>
                      )}

                      {/* Special Handling for Vaulted Ceiling */}
                      {s.type === 'Ceiling' && (
                        <div className="bg-white p-4 border border-slate-200 mb-2">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={!!s.isVaulted} 
                              onChange={(e) => updateSurface(s.id, 'isVaulted', e.target.checked)}
                              className="w-6 h-6 rounded-none border-slate-300 text-[#7A1C2D] focus:ring-[#7A1C2D]" 
                            />
                            <span className="text-[12px] font-black text-[#7A1C2D] uppercase tracking-widest">This ceiling is vaulted or angled</span>
                          </label>
                        </div>
                      )}

                      <div className="grid grid-cols-[150px_minmax(0,1fr)] gap-4 items-end">
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
      {s.type === 'Wall' ? 'Dimensions (ft)' : 'ROOM FOOTPRINT DIMENSIONS (FT)'}
    </label>

    <div className="flex items-center gap-1.5">
      <input
        type="number"
        value={s.width === 0 ? '' : s.width}
        onChange={(e) => updateSurface(s.id, 'width', parseNumberInput(e.target.value))}
        onFocus={(e) => e.target.select()}
        className="w-[56px] bg-white border border-slate-200 rounded-none px-2 py-3 text-sm font-bold text-left text-slate-800 focus:border-[#7A1C2D] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span className="text-slate-300 font-bold">×</span>
      <input
        type="number"
        value={s.height === 0 ? '' : s.height}
        onChange={(e) => updateSurface(s.id, 'height', parseNumberInput(e.target.value))}
        onFocus={(e) => e.target.select()}
        className="w-[56px] bg-white border border-slate-200 rounded-none px-2 py-3 text-sm font-bold text-left text-slate-800 focus:border-[#7A1C2D] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  </div>

  {/* Height logic for Vaulted or Standard Ceiling */}
  <div className="space-y-2 min-w-0">
    {s.type === 'Ceiling' && s.isVaulted ? (
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Shortest Height (ft)
          </label>
          <input
            type="number"
            value={s.minHeight === 0 ? '' : s.minHeight}
            onChange={(e) => updateSurface(s.id, 'minHeight', parseNumberInput(e.target.value))}
            onFocus={(e) => e.target.select()}
            className="w-full bg-white border border-slate-200 rounded-none px-3 py-3 text-sm font-bold text-left text-slate-800 focus:border-[#7A1C2D] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Tallest Height (ft)
          </label>
          <input
            type="number"
            value={s.maxHeight === 0 ? '' : s.maxHeight}
            onChange={(e) => updateSurface(s.id, 'maxHeight', parseNumberInput(e.target.value))}
            onFocus={(e) => e.target.select()}
            className="w-full bg-white border border-slate-200 rounded-none px-3 py-3 text-sm font-bold text-left text-slate-800 focus:border-[#7A1C2D] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
    ) : (
      <div className="space-y-2">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Insulation
        </label>
        <div className="relative">
          <select
            value={s.rValue}
            onChange={(e) => updateSurface(s.id, 'rValue', Number(e.target.value))}
            className="w-full bg-white border border-slate-200 rounded-none px-4 py-3.5 text-sm font-bold text-slate-800 focus:border-[#7A1C2D] outline-none appearance-none pr-10"
          >
            {Object.values(InsulationRValue).filter(v => typeof v === 'number').map(v => (
              <option key={v} value={v}>
                {v === 0 ? 'None (No Insulation)' : `R-${v}`}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>
    )}
  </div>
</div>
                          ) : (
                            <div className="space-y-2">
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Insulation</label>
                              <div className="relative">
                                <select value={s.rValue} onChange={(e) => updateSurface(s.id, 'rValue', Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-none px-4 py-3.5 text-sm font-bold text-slate-800 focus:border-[#7A1C2D] outline-none appearance-none pr-10">
                                  {Object.values(InsulationRValue).filter(v => typeof v === 'number').map(v => (
                                    <option key={v} value={v}>
                                      {v === 0 ? 'None (No Insulation)' : `R-${v}`}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 pt-2">
                        <div className={`space-y-2 transition-all ${s.glassType !== GlassType.None ? 'opacity-100' : 'opacity-25 pointer-events-none'}`}>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Glass Dimensions (ft)</label>
                          <div className="flex items-center gap-1.5">
                            <div className="w-[64px] bg-white border border-slate-200 px-2 py-3 text-sm font-bold text-left tabular-nums text-slate-800 focus:border-[#7A1C2D] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">
                              <span className="text-[8px] font-bold text-slate-300 block mb-1">W</span>
                              <input
                                type="number"
                                value={s.glassWidth === 0 ? '' : s.glassWidth}
                                onChange={(e) => updateSurface(s.id, 'glassWidth', parseNumberInput(e.target.value))}
                                onFocus={(e) => e.target.select()}
                                className="w-[64px] bg-white border border-slate-200 rounded-none px-3 py-2.5 text-[16px] leading-none font-bold text-left text-slate-800 focus:border-[#7A1C2D] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                disabled={s.glassType === GlassType.None}
                              />
                            </div>
                            <span className="text-slate-300 font-bold mt-4">×</span>
                            <div className="flex-1 min-w-0">
                              <span className="text-[8px] font-bold text-slate-300 block mb-1">H</span>
                              <input
                                type="number"
                                value={s.glassHeight === 0 ? '' : s.glassHeight}
                                onChange={(e) => updateSurface(s.id, 'glassHeight', parseNumberInput(e.target.value))}
                                onFocus={(e) => e.target.select()}
                                className="w-full bg-white border border-slate-200 rounded-none px-3 py-2.5 text-[16px] leading-none font-bold text-left text-slate-800 focus:border-[#7A1C2D] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                disabled={s.glassType === GlassType.None}
                              />
                            </div>
                          </div>
                          {s.glassType !== GlassType.None && (
                            <div className="text-[9px] font-black text-[#7A1C2D] uppercase tracking-widest mt-1">Area: {s.glassWidth * s.glassHeight} sq ft</div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Glass Type</label>
                          <div className="relative">
                            <select value={s.glassType} onChange={(e) => updateSurface(s.id, 'glassType', e.target.value)} className="w-full bg-white border border-slate-200 rounded-none px-4 py-3.5 text-sm font-bold text-slate-800 focus:border-[#7A1C2D] outline-none appearance-none pr-10">
                              {Object.values(GlassType).map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      
                      {s.type === 'Ceiling' && s.isVaulted && (
                         <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Insulation</label>
                            <div className="relative">
                              <select value={s.rValue} onChange={(e) => updateSurface(s.id, 'rValue', Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-none px-4 py-3.5 text-sm font-bold text-slate-800 focus:border-[#7A1C2D] outline-none appearance-none pr-10">
                                {Object.values(InsulationRValue).filter(v => typeof v === 'number').map(v => (
                                  <option key={v} value={v}>
                                    {v === 0 ? 'None (No Insulation)' : `R-${v}`}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                          </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Irregular Shape Advisory */}
                <div className="mx-10 mt-6 mb-6 p-8 bg-slate-100 border-l-8 border-[#333333] flex gap-6 items-start rounded-none shadow-sm">
                  <Layout className="w-8 h-8 text-[#333333] shrink-0 mt-1" />
                  <div className="space-y-2">
                    <h4 className="text-[12px] font-black text-[#333333] uppercase tracking-[0.2em] font-montserrat">Irregular Geometry Advisory</h4>
                    <p className="text-[14px] text-slate-600 leading-relaxed font-bold">
                      For L-shaped, triangular, or irregular rooms, please contact USCS for a personalized load calculation.
                    </p>
                    <div className="pt-2">
                      <a href="tel:562-728-5700" className="inline-flex items-center gap-2 text-[#7A1C2D] font-black text-[12px] uppercase tracking-widest hover:underline">
                        <PhoneCall className="w-3.5 h-3.5" /> Technical Support: 562.728.5700
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mx-10 mb-10 p-8 bg-slate-100 border-l-8 border-[#7A1C2D] flex gap-6 items-start rounded-none">
                  <Info className="w-8 h-8 text-[#7A1C2D] shrink-0 mt-1" />
                  <div className="space-y-2">
                    <h4 className="text-[12px] font-black text-[#7A1C2D] uppercase tracking-[0.2em] font-montserrat">Glass Thermal Insulation Note</h4>
                    <p className="text-[14px] text-slate-600 leading-relaxed font-bold">
                      Single-pane glass provides poor insulation regardless of thickness. Thickness does not equal double-pane performance.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Internal Loads & Climate Specs */}
              <div className="grid md:grid-cols-2 gap-12 mt-12">
                <section className="bg-white rounded-none shadow-xl border border-slate-200 overflow-hidden">
                  <div className="bg-[#333333] px-10 py-6 flex items-center text-white rounded-none">
                    <h3 className="font-bold text-sm uppercase tracking-[0.3em] font-montserrat flex items-center gap-4">
                      <Box className="w-5 h-5 text-[#7A1C2D]" /> Internal Loads
                    </h3>
                  </div>
                  <div className="p-10 space-y-12">
                    <div>
                      <label className="flex items-center gap-3 text-[11px] font-black text-slate-600 uppercase tracking-widest mb-6 font-montserrat">
                        <Users className="w-5 h-5 text-[#7A1C2D]" /> Room Occupancy
                      </label>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-slate-500 uppercase block">People</span>
                          <input type="number" value={usage.peopleCount} onChange={e => setUsage({...usage, peopleCount: Number(e.target.value)})} className="w-full bg-slate-800 border-slate-700 border rounded-none px-5 py-4 text-sm font-bold text-white focus:border-[#7A1C2D] outline-none" />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-slate-500 uppercase block">Hrs / Day</span>
                          <input type="number" value={usage.peopleHours} onChange={e => setUsage({...usage, peopleHours: Number(e.target.value)})} className="w-full bg-slate-800 border-slate-700 border rounded-none px-5 py-4 text-sm font-bold text-white focus:border-[#7A1C2D] outline-none" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-3 text-[11px] font-black text-slate-600 uppercase tracking-widest mb-6 font-montserrat">
                        <Zap className="w-5 h-5 text-[#7A1C2D]" /> Appliances & Wattage
                      </label>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-slate-500 uppercase block">Watts</span>
                          <input type="number" value={usage.applianceWatts} onChange={e => setUsage({...usage, applianceWatts: Number(e.target.value)})} className="w-full bg-slate-800 border-slate-700 border rounded-none px-5 py-4 text-sm font-bold text-white focus:border-[#7A1C2D] outline-none" />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-slate-500 uppercase block">Hrs / Day</span>
                          <input type="number" value={usage.applianceHours} onChange={e => setUsage({...usage, applianceHours: Number(e.target.value)})} className="w-full bg-slate-800 border-slate-700 border rounded-none px-5 py-4 text-sm font-bold text-white focus:border-[#7A1C2D] outline-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-none border border-slate-100 mt-4">
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-slate-500 uppercase block">Other Equipment (Watts)</span>
                          <input type="number" value={usage.equipmentWatts} onChange={e => setUsage({...usage, equipmentWatts: Number(e.target.value)})} className="w-full bg-slate-800 border-slate-700 border rounded-none px-5 py-4 text-sm font-bold text-white focus:border-[#7A1C2D] outline-none" />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-slate-500 uppercase block">Hrs / Day</span>
                          <input type="number" value={usage.equipmentHours} onChange={e => setUsage({...usage, equipmentHours: Number(e.target.value)})} className="w-full bg-slate-800 border-slate-700 border rounded-none px-5 py-4 text-sm font-bold text-white focus:border-[#7A1C2D] outline-none" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-3 text-[11px] font-black text-slate-600 uppercase tracking-widest mb-6 font-montserrat">
                        <Lightbulb className="w-5 h-5 text-[#7A1C2D]" /> Lighting
                      </label>
                      <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-none border border-slate-100">
                        <div>
                          <span className="text-[10px] font-black text-slate-500 uppercase block mb-2">LED Watts</span>
                          <input type="number" value={usage.ledWatts} onChange={e => setUsage({...usage, ledWatts: Number(e.target.value)})} className="w-full bg-slate-800 border-slate-700 border rounded-none px-4 py-3.5 text-sm font-bold text-white focus:border-[#7A1C2D] outline-none" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-slate-500 uppercase block mb-2">Incand. Watts</span>
                          <input type="number" value={usage.incandescentWatts} onChange={e => setUsage({...usage, incandescentWatts: Number(e.target.value)})} className="w-full bg-slate-800 border-red-900 border rounded-none px-4 py-3.5 text-sm font-bold text-white focus:border-[#7A1C2D] outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-[#7A1C2D] text-white rounded-none shadow-2xl p-12 flex flex-col justify-between">
                  <div className="space-y-12">
                    <h3 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-5 font-montserrat">
                      <Thermometer className="w-10 h-10 text-white/30" /> Climate Specs
                    </h3>
                    <div className="space-y-12">
                      <div className="space-y-5">
                        <div className="flex justify-between items-baseline">
                          <label className="text-[12px] font-black text-white/60 uppercase tracking-widest font-montserrat">Ambient Adjacent Temp</label>
                          <span className="text-3xl font-black tracking-tighter font-montserrat">{usage.ambientTemp}°F</span>
                        </div>
                        <input 
                          type="range" min="60" max="110" step="1" 
                          value={usage.ambientTemp} 
                          onChange={e => {
                            if (infoConfirmed) setInfoConfirmed(false);
                            setUsage({...usage, ambientTemp: Number(e.target.value)});
                          }}
                          className="w-full h-1.5 bg-white/20 rounded-none appearance-none cursor-pointer" 
                        />
                      </div>
                      <div className="space-y-5">
                        <div className="flex justify-between items-baseline">
                          <label className="text-[12px] font-black text-white/60 uppercase tracking-widest font-montserrat">Outdoor Design Temp</label>
                          <span className="text-3xl font-black tracking-tighter font-montserrat">{usage.outdoorTemp}°F</span>
                        </div>
                        <input 
                          type="range" min="80" max="120" step="1" 
                          value={usage.outdoorTemp} 
                          onChange={e => {
                            if (infoConfirmed) setInfoConfirmed(false);
                            setUsage({...usage, outdoorTemp: Number(e.target.value)});
                          }}
                          className="w-full h-1.5 bg-white/20 rounded-none appearance-none cursor-pointer" 
                        />
                      </div>
                      <div className="space-y-5">
                        <div className="flex justify-between items-baseline">
                          <label className="text-[12px] font-black text-white/60 uppercase tracking-widest font-montserrat">Target Cellar Temp</label>
                          <span className="text-3xl font-black tracking-tighter font-montserrat">{usage.targetTemp}°F</span>
                        </div>
                        <input 
                          type="range" min="45" max="65" step="1" 
                          value={usage.targetTemp} 
                          onChange={e => {
                            if (infoConfirmed) setInfoConfirmed(false);
                            setUsage({...usage, targetTemp: Number(e.target.value)});
                          }}
                          className="w-full h-1.5 bg-white/20 rounded-none appearance-none cursor-pointer" 
                        />
                      </div>

                      <div className="pt-6 border-t border-white/10">
                        <label className="flex items-center justify-between cursor-pointer group">
                          <div className="space-y-1">
                            <span className="text-[12px] font-black text-white uppercase tracking-widest font-montserrat group-hover:text-amber-400 transition-colors">Frequent Door Opening</span>
                            <p className="text-[10px] text-white/40 font-bold italic">Adds infiltration load for high-traffic cellars</p>
                          </div>
                          <div className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={usage.frequentDoorOpening}
                              onChange={e => {
                                if (infoConfirmed) setInfoConfirmed(false);
                                setUsage({...usage, frequentDoorOpening: e.target.checked});
                              }}
                              className="sr-only peer" 
                            />
                            <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white/20 after:border-white/10 after:border after:rounded-none after:h-5 after:w-6 after:transition-all peer-checked:bg-[#b30000]"></div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="mt-12 p-8 bg-white/5 rounded-none border border-white/10 flex items-center gap-5">
                    <span className="shrink-0"><Info className="w-7 h-7 text-white/40" /></span>
                    <p className="text-[13px] text-white/70 italic font-bold leading-relaxed">Standard recommendation: 55°F / 60% Relative Humidity.</p>
                  </div>
                </section>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-10 lg:sticky lg:top-12">
            
            {/* Final Confirmation Gate */}
            {isCalculable && !infoConfirmed && (
               <section className="bg-white border-4 border-[#7A1C2D] p-10 shadow-2xl space-y-8 animate-in slide-in-from-right-10 duration-500 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transition-transform group-hover:-translate-y-2 group-hover:translate-x-2 duration-1000">
                    <CheckCircle2 className="w-24 h-24" />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <h3 className="text-xl font-black uppercase tracking-widest font-montserrat text-[#7A1C2D]">Verify Calculation</h3>
                    <p className="text-sm font-bold text-slate-500 italic leading-relaxed">Please review your inputs. Precision is required for stability.</p>
                    
                    <label className="flex items-start gap-4 cursor-pointer p-6 bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                      <div className="pt-1">
                        <input 
                          type="checkbox" 
                          checked={infoConfirmed} 
                          onChange={(e) => setInfoConfirmed(e.target.checked)}
                          className="w-6 h-6 rounded-none border-slate-300 text-[#7A1C2D] focus:ring-[#7A1C2D]" 
                        />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-700 leading-relaxed">
                        I confirm all entered information is accurate. I understand that construction changes require recalculation. USCS is not responsible for incorrect inputs.
                      </span>
                    </label>
                  </div>
               </section>
            )}

            <div className={`bg-white rounded-none shadow-2xl border-2 transition-all duration-700 ${isCalculable && infoConfirmed ? 'border-slate-100' : 'border-[#b30000] grayscale opacity-50'}`}>
               <div className="bg-[#333333] p-10 border-b border-slate-100 flex items-center justify-between rounded-none">
                  <h3 className="text-xl font-black uppercase tracking-widest text-white font-montserrat flex items-center gap-4">
                    <Zap className={`w-6 h-6 ${isCalculable && infoConfirmed ? 'text-[#7A1C2D]' : 'text-slate-500'}`} /> Analysis
                  </h3>
                  <div className="text-white text-right">
                    <div className="text-[9px] font-black text-white/40 uppercase tracking-widest">Total BTU/h</div>
                    <div className="text-3xl font-black text-[#7A1C2D] font-montserrat">
                      {isCalculable && infoConfirmed ? result.totalBtuLoad : '---'}
                    </div>
                  </div>
               </div>
               
               <div className="p-10 space-y-10">
                  {isCalculable && infoConfirmed ? (
                    <div className="grid grid-cols-2 gap-8 animate-in fade-in duration-700">
                      <div className="bg-slate-50 p-6 rounded-none border border-slate-100 shadow-sm">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-montserrat">Walls/Ceiling</div>
                        <div className="text-2xl font-black text-[#333333] tracking-tighter font-montserrat">{Math.round((result.breakdown.qWalls + result.breakdown.qCeiling) / 16)}</div>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-none border border-slate-100 shadow-sm">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-montserrat">Glazing</div>
                        <div className="text-2xl font-black text-[#b30000] tracking-tighter font-montserrat">{Math.round(result.breakdown.qGlass / 16)}</div>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-none border border-slate-100 shadow-sm">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-montserrat">Internal</div>
                        <div className="text-2xl font-black text-[#333333] tracking-tighter font-montserrat">{Math.round((result.breakdown.qLighting + result.breakdown.qPeople + result.breakdown.qAppliances + result.breakdown.qExtra) / 16)}</div>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-none border border-slate-100 shadow-sm">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-montserrat">Infiltration</div>
                        <div className="text-2xl font-black text-[#333333] tracking-tighter font-montserrat">{Math.round(result.breakdown.qAir / 16)}</div>
                      </div>
                      <div className="bg-indigo-50 p-6 rounded-none border border-indigo-100 shadow-sm">
                        <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 font-montserrat">Safety Margin (20%)</div>
                        <div className="text-2xl font-black text-indigo-900 tracking-tighter font-montserrat">{Math.round(result.breakdown.qSafety / 16)}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 space-y-4">
                       <ShieldCheck className="w-12 h-12 text-[#b30000] mx-auto opacity-20" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Validation</p>
                    </div>
                  )}

                  <div className="bg-red-50 p-8 rounded-none border border-red-100 space-y-4 shadow-inner">
                    <div className="flex items-center gap-3 text-red-800 font-black uppercase text-[12px] tracking-[0.2em] font-montserrat">
                      <AlertTriangle className="w-5 h-5" /> Load Disclaimer
                    </div>
                    <p className="text-[12px] text-red-900 leading-relaxed font-bold italic">
                      This BTU load calculation is an estimate for informational purposes only and is not a substitute for professional engineering analysis. Actual cooling requirements may vary based on construction quality, air infiltration, equipment placement, ducting, and installation conditions. Final system selection must be confirmed with a US Cellar Systems specialist.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Product Recommendations Grid */}
        <section className={`mt-40 pt-32 border-t-4 border-slate-200 transition-all duration-1000 ${isCalculable && infoConfirmed ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-10 pointer-events-none'}`}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-12 px-2">
            <div className="space-y-8">
              <h3 className="text-5xl md:text-7xl font-black text-[#333333] uppercase tracking-tighter drop-shadow-sm font-montserrat leading-none">Compatible USCS Series</h3>
              <div className="p-8 bg-slate-100 rounded-none border-l-8 border-[#333333] max-w-3xl shadow-sm">
                <h4 className="text-[13px] font-black text-[#333333] uppercase tracking-[0.2em] mb-3 font-montserrat">Selection Notice</h4>
                <p className="text-[14px] text-slate-500 leading-relaxed font-bold">
                  All systems listed below meet or exceed your calculated peak load requirement of <span className="text-[#7A1C2D] font-black">{result.totalBtuLoad} BTU/h</span>. 
                  Matches are based on the maximum capacity of the series.
                </p>
              </div>
            </div>
            <div className="bg-white border-4 border-slate-100 px-12 py-5 rounded-none text-[14px] font-black uppercase tracking-[0.4em] text-[#7A1C2D] shadow-xl flex items-center gap-6 shrink-0 h-fit font-montserrat">
              <Layers className="w-6 h-6" /> {recommendedProducts.length} Systems Qualifying
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            {recommendedProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-none overflow-hidden border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-500 group flex flex-col hover:-translate-y-2">
                <div className="h-72 relative overflow-hidden bg-slate-100">
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute top-6 left-6">
                    <span className="bg-[#7A1C2D] text-white px-5 py-2 rounded-none text-[10px] font-black uppercase tracking-widest shadow-2xl border border-white/20 font-montserrat">
                      {p.series}
                    </span>
                  </div>
                  <div className="absolute bottom-6 right-6 bg-[#333333] text-white px-8 py-4 rounded-none font-black text-xl shadow-2xl border border-white/10 flex items-center gap-4 font-montserrat">
                    <Zap className="w-5 h-5 text-amber-400" /> Up to {p.btuCapacity} BTU
                  </div>
                </div>
                <div className="p-10 flex-1 flex flex-col justify-between">
                  <div className="space-y-6 mb-8">
                    <h4 className="text-3xl font-black text-[#333333] uppercase tracking-tighter leading-none font-montserrat">{p.name}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed font-bold italic opacity-80">
                      {p.description}
                    </p>
                    <div className="pt-4 border-t border-slate-100 flex items-center gap-3 text-[10px] font-black text-[#7A1C2D] uppercase tracking-widest">
                       <MessageSquare className="w-4 h-4" /> Contact us for configuration assistance
                    </div>
                  </div>
                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-4 w-full py-5 bg-[#7A1C2D] text-white rounded-none font-black uppercase tracking-[0.3em] text-[11px] hover:bg-[#962137] transition-all shadow-xl group font-montserrat">
                    View Specifications <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </a>
                </div>
              </div>
            ))}

            {isCalculable && infoConfirmed && recommendedProducts.length === 0 && (
              <div className="col-span-full py-40 bg-slate-200/50 rounded-none border-8 border-dashed border-slate-300 text-center px-12">
                <AlertTriangle className="w-24 h-24 text-slate-400 mx-auto mb-12" />
                <h4 className="text-3xl md:text-5xl font-black text-[#333333] uppercase tracking-tighter font-montserrat leading-tight">Extreme Capacity Required</h4>
                <p className="mt-8 text-xl font-bold text-slate-500 italic uppercase tracking-widest">Please request a call for system selection.</p>
                <div className="mt-16">
                  <a href="tel:562-728-5700" className="inline-flex items-center gap-6 bg-[#7A1C2D] text-white px-20 py-8 rounded-full font-black uppercase tracking-[0.5em] text-[12px] hover:bg-[#962137] transition-all shadow-2xl font-montserrat">
                    <PhoneCall className="w-8 h-8" /> 562.728.5700 Direct Engineering
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="request-call" className="mt-24 bg-[#333333] text-white p-12 md:p-20 rounded-none shadow-2xl space-y-12 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
             <Wine className="w-64 h-64 text-white" />
          </div>
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h4 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight font-montserrat">Need Help Confirming Your System?</h4>
              <p className="text-lg md:text-xl text-slate-400 leading-relaxed font-bold italic">
                Wine cellar cooling performance depends heavily on installation design. Request a call with a US Cellar Systems expert to confirm your cooling system and design requirements.
              </p>
              <div className="flex flex-wrap gap-8 text-[#7A1C2D] font-black uppercase tracking-widest text-xs font-montserrat">
                <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-full border border-white/10">
                   <CheckCircle2 className="w-5 h-5" /> Professional Audit
                </div>
                <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-full border border-white/10">
                   <CheckCircle2 className="w-5 h-5" /> Design Validation
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 p-10 md:p-14 rounded-none border border-white/10 shadow-2xl backdrop-blur-sm">
              {!leadSubmitted ? (
                <form className="space-y-8" onSubmit={e => { e.preventDefault(); setLeadSubmitted(true); }}>
                  <div className="grid md:grid-cols-2 gap-8">
                    <input type="text" placeholder="Full Name" required className="w-full bg-white/5 border-white/10 border rounded-none px-8 py-5 text-sm outline-none focus:border-[#7A1C2D] transition-all font-bold placeholder:text-white/20" />
                    <input type="tel" placeholder="Phone Number" required className="w-full bg-white/5 border-white/10 border rounded-none px-8 py-5 text-sm outline-none focus:border-[#7A1C2D] transition-all font-bold placeholder:text-white/20" />
                  </div>
                  <input type="email" placeholder="Email Address" required className="w-full bg-white/5 border-white/10 border rounded-none px-8 py-5 text-sm outline-none focus:border-[#7A1C2D] transition-all font-bold placeholder:text-white/20" />
                  <button type="submit" className="w-full bg-[#7A1C2D] text-white py-6 rounded-none font-black uppercase tracking-[0.4em] text-[13px] hover:bg-[#962137] transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-5 font-montserrat">
                    Request a Call <ArrowRight className="w-6 h-6" />
                  </button>
                </form>
              ) : (
                <div className="py-20 text-center animate-in fade-in zoom-in duration-500">
                  <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-8" />
                  <div className="text-3xl font-black uppercase tracking-widest mb-4 font-montserrat">Request Received</div>
                  <p className="text-slate-400 text-lg font-bold">Our engineering team will contact you shortly.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-56 bg-[#333333] text-white py-32 border-t-8 border-[#7A1C2D] rounded-none">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-32">
          <div className="space-y-12">
            <div className="flex items-center gap-5">
              <img 
                src={LOGO_DATA_URI} 
                alt="US Cellar Systems" 
                className="h-12 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="text-slate-400 text-sm leading-loose max-w-md font-bold uppercase tracking-[0.4em] opacity-60">
              Split-system wine cellar refrigeration specialists. Precision stability for high-value collections globally.
            </p>
            <div className="flex gap-20">
              <div>
                <div className="text-[12px] font-black text-white/30 uppercase tracking-[0.4em] mb-4 font-montserrat">Support</div>
                <a href="mailto:info@uscellarsystems.com" className="text-sm font-black text-white hover:text-[#7A1C2D] transition-colors uppercase tracking-widest">info@uscellarsystems.com</a>
              </div>
              <div>
                <div className="text-[12px] font-black text-white/30 uppercase tracking-[0.4em] mb-4 font-montserrat">HQ</div>
                <div className="text-sm font-black text-white uppercase tracking-widest">Signal Hill, CA</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between items-end">
             <div className="text-right space-y-8">
                <div className="text-[13px] font-black text-white/20 uppercase tracking-[0.8em] mb-8 font-montserrat">Professional Grade Technology</div>
                <div className="flex justify-end gap-16 text-[12px] font-black uppercase tracking-[0.3em] text-slate-400 font-montserrat">
                  <a href="#" className="hover:text-white transition-colors">Documentation</a>
                  <a href="#" className="hover:text-white transition-colors">Safety</a>
                  <a href="#" className="hover:text-white transition-colors">Compliance</a>
                </div>
             </div>
             <div className="bg-white/5 p-10 rounded-none border border-white/10 max-w-md text-right mt-16 shadow-2xl">
                <h6 className="text-[11px] font-black text-white/40 uppercase tracking-widest mb-4 font-montserrat">Engineering Notice</h6>
                <p className="text-[10px] text-slate-400 italic leading-loose font-bold uppercase tracking-widest">
                  US Cellar Systems assumes no liability for undersizing based on unverified environmental variables.
                </p>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-32 pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 font-montserrat">
          <p className="text-[11px] text-white/20 font-black uppercase tracking-[0.5em]">© 2024 US Cellar Systems — Version 4.0 Professional Load Engine</p>
          <div className="flex gap-6">
             <div className="w-3 h-3 rounded-none bg-[#7A1C2D] shadow-[0_0_20px_#7A1C2D]"></div>
             <span className="text-[11px] font-black text-white/20 uppercase tracking-widest">Core Engine Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
