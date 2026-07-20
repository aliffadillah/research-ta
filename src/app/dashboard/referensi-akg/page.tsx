"use client";

import { useEffect, useState } from "react";
import { BookOpen, Users, Scale, Ruler, ChevronDown } from "lucide-react";

interface NutritionStandard {
  id: string;
  gender: string;
  ageGroup: string;
  bodyWeight: number;
  bodyHeight: number;
  energy: number;
  fat: number;
  protein: number;
  carbs: number;
  fiber: number;
}

interface GroupedData {
  gender: string;
  genderLabel: string;
  porsiKecil: NutritionStandard[];
  porsiBesar: NutritionStandard[];
}

export default function ReferensiAKGPage() {
  const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGender, setExpandedGender] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/all");
        if (res.ok) {
          const data = await res.json();
          const standards = data.nutritionStandards.data as NutritionStandard[];
          processData(standards);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const processData = (standards: NutritionStandard[]) => {
    // Small portion age groups
    const porsiKecilAges = [
      "0-5 Bulan",
      "6-11 Bulan",
      "1-3 Tahun",
    ];

    // Large portion age groups
    const porsiBesarAges = [
      "4-6 Tahun",
      "7-9 Tahun",
      "10-12 Tahun",
      "13-15 Tahun",
      "16-18 Tahun",
      "19-29 Tahun",
      "30-49 Tahun",
    ];

    // Group by gender
    const genderGroups: Record<string, NutritionStandard[]> = {};

    standards.forEach((std) => {
      if (!genderGroups[std.gender]) {
        genderGroups[std.gender] = [];
      }
      genderGroups[std.gender].push(std);
    });

    // Convert to grouped structure
    const result: GroupedData[] = [
      {
        gender: "bayi_anak",
        genderLabel: "Bayi & Anak",
        porsiKecil: genderGroups["bayi_anak"]?.filter((s) => porsiKecilAges.includes(s.ageGroup)) || [],
        porsiBesar: genderGroups["bayi_anak"]?.filter((s) => porsiBesarAges.includes(s.ageGroup)) || [],
      },
      {
        gender: "laki_laki",
        genderLabel: "Laki-Laki",
        porsiKecil: [],
        porsiBesar: genderGroups["laki_laki"] || [],
      },
      {
        gender: "perempuan",
        genderLabel: "Perempuan",
        porsiKecil: [],
        porsiBesar: genderGroups["perempuan"] || [],
      },
    ];

    // Filter out empty groups
    setGroupedData(result.filter((g) => g.porsiKecil.length > 0 || g.porsiBesar.length > 0));
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 w-48 bg-border rounded" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-border rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-sans font-bold mb-1 sm:mb-2">Referensi AKG</h1>
        <p className="text-text-muted text-xs sm:text-sm">
          Angka Kecukupan Gizi yang Dianjurkan per Hari
        </p>
      </div>

      {/* Info Banner */}
      <div className="card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base mb-1">Tentang AKG</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Angka Kecukupan Gizi (AKG) adalah rata-rata kebutuhan zat gizi harian yang
              memenuhi kebutuhan hampir semua ({`<`}97,5%) populasi sehat menurut jenis kelamin
              dan kelompok usia.
            </p>
            <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row gap-1.5 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full flex-shrink-0" />
                <span className="truncate"><strong>PK:</strong> 0-5 Bulan, 6-11 Bulan, 1-3 Th</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full flex-shrink-0" />
                <span className="truncate"><strong>PB:</strong> 4-6 Th sd 30-49 Th</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Tables */}
      <div className="space-y-4 sm:space-y-6">
        {groupedData.map((group) => (
          <div key={group.gender} className="card-static">
            {/* Gender Header */}
            <button
              onClick={() => setExpandedGender(expandedGender === group.gender ? null : group.gender)}
              className="w-full flex items-center justify-between p-3 sm:p-4 bg-bg rounded-lg sm:rounded-xl mb-3 sm:mb-4 hover:bg-border transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${
                  group.gender === "bayi_anak" ? "bg-purple-100" :
                  group.gender === "laki_laki" ? "bg-blue-100" : "bg-pink-100"
                }`}>
                  <span className={`text-sm sm:text-lg ${
                    group.gender === "bayi_anak" ? "text-purple-600" :
                    group.gender === "laki_laki" ? "text-blue-600" : "text-pink-600"
                  }`}>♂</span>
                </div>
                <div className="text-left min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base truncate">{group.genderLabel}</h3>
                  <p className="text-[10px] sm:text-sm text-text-muted truncate">
                    {group.porsiKecil.length + group.porsiBesar.length} kelompok usia
                  </p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-text-muted transition-transform flex-shrink-0 ${expandedGender === group.gender ? "rotate-180" : ""}`} />
            </button>

            {/* Expanded Content */}
            {expandedGender === group.gender && (
              <div className="space-y-4 sm:space-y-6">
                {/* Porsi Kecil Section */}
                {group.porsiKecil.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full flex-shrink-0" />
                      <h4 className="font-medium text-blue-600 text-xs sm:text-sm">Porsi Kecil</h4>
                    </div>

                    {/* Mobile: Card Layout */}
                    <div className="sm:hidden space-y-2">
                      {group.porsiKecil.map((std) => (
                        <div key={std.id} className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-blue-700 text-sm">{std.ageGroup}</span>
                            <span className="text-[10px] text-blue-500">BB: {std.bodyWeight}kg | TB: {std.bodyHeight}cm</span>
                          </div>
                          <div className="grid grid-cols-5 gap-1 text-center">
                            <div className="bg-white/60 rounded py-1 px-0.5">
                              <p className="text-[10px] font-bold text-orange-600">{std.energy}</p>
                              <p className="text-[8px] text-blue-500">kkal</p>
                            </div>
                            <div className="bg-white/60 rounded py-1 px-0.5">
                              <p className="text-[10px] font-bold">{std.protein}</p>
                              <p className="text-[8px] text-blue-500">Prot</p>
                            </div>
                            <div className="bg-white/60 rounded py-1 px-0.5">
                              <p className="text-[10px] font-bold">{std.carbs}</p>
                              <p className="text-[8px] text-blue-500">Karbo</p>
                            </div>
                            <div className="bg-white/60 rounded py-1 px-0.5">
                              <p className="text-[10px] font-bold">{std.fat}</p>
                              <p className="text-[8px] text-blue-500">Lemak</p>
                            </div>
                            <div className="bg-white/60 rounded py-1 px-0.5">
                              <p className="text-[10px] font-bold">{std.fiber}</p>
                              <p className="text-[8px] text-blue-500">Serat</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop: Table Layout */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Kelompok Usia</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">BB (kg)</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">TB (cm)</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">Energi (kkal)</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">Protein (g)</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">Karbo (g)</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">Lemak (g)</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">Serat (g)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.porsiKecil.map((std) => (
                            <tr key={std.id} className="border-b border-border hover:bg-bg">
                              <td className="py-3 px-4 font-medium">{std.ageGroup}</td>
                              <td className="py-3 px-4 text-right">{std.bodyWeight}</td>
                              <td className="py-3 px-4 text-right">{std.bodyHeight}</td>
                              <td className="py-3 px-4 text-right font-semibold text-orange-600">{std.energy}</td>
                              <td className="py-3 px-4 text-right">{std.protein}</td>
                              <td className="py-3 px-4 text-right">{std.carbs}</td>
                              <td className="py-3 px-4 text-right">{std.fat}</td>
                              <td className="py-3 px-4 text-right">{std.fiber}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Porsi Besar Section */}
                {group.porsiBesar.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full flex-shrink-0" />
                      <h4 className="font-medium text-green-600 text-xs sm:text-sm">Porsi Besar</h4>
                    </div>

                    {/* Mobile: Card Layout */}
                    <div className="sm:hidden space-y-2">
                      {group.porsiBesar.map((std) => (
                        <div key={std.id} className="bg-green-50/50 rounded-lg p-3 border border-green-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-green-700 text-sm">{std.ageGroup}</span>
                            <span className="text-[10px] text-green-500">BB: {std.bodyWeight}kg | TB: {std.bodyHeight}cm</span>
                          </div>
                          <div className="grid grid-cols-5 gap-1 text-center">
                            <div className="bg-white/60 rounded py-1 px-0.5">
                              <p className="text-[10px] font-bold text-orange-600">{std.energy}</p>
                              <p className="text-[8px] text-green-500">kkal</p>
                            </div>
                            <div className="bg-white/60 rounded py-1 px-0.5">
                              <p className="text-[10px] font-bold">{std.protein}</p>
                              <p className="text-[8px] text-green-500">Prot</p>
                            </div>
                            <div className="bg-white/60 rounded py-1 px-0.5">
                              <p className="text-[10px] font-bold">{std.carbs}</p>
                              <p className="text-[8px] text-green-500">Karbo</p>
                            </div>
                            <div className="bg-white/60 rounded py-1 px-0.5">
                              <p className="text-[10px] font-bold">{std.fat}</p>
                              <p className="text-[8px] text-green-500">Lemak</p>
                            </div>
                            <div className="bg-white/60 rounded py-1 px-0.5">
                              <p className="text-[10px] font-bold">{std.fiber}</p>
                              <p className="text-[8px] text-green-500">Serat</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop: Table Layout */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Kelompok Usia</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">BB (kg)</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">TB (cm)</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">Energi (kkal)</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">Protein (g)</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">Karbo (g)</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">Lemak (g)</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">Serat (g)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.porsiBesar.map((std) => (
                            <tr key={std.id} className="border-b border-border hover:bg-bg">
                              <td className="py-3 px-4 font-medium">{std.ageGroup}</td>
                              <td className="py-3 px-4 text-right">{std.bodyWeight}</td>
                              <td className="py-3 px-4 text-right">{std.bodyHeight}</td>
                              <td className="py-3 px-4 text-right font-semibold text-orange-600">{std.energy}</td>
                              <td className="py-3 px-4 text-right">{std.protein}</td>
                              <td className="py-3 px-4 text-right">{std.carbs}</td>
                              <td className="py-3 px-4 text-right">{std.fat}</td>
                              <td className="py-3 px-4 text-right">{std.fiber}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="card-static">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Keterangan</h3>
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
              S
            </div>
            <div>
              <h4 className="font-medium text-blue-800 text-xs sm:text-sm">Porsi Kecil (Small)</h4>
              <p className="text-[10px] sm:text-sm text-blue-600 mt-0.5 sm:mt-1">
                Usia: 0-5 Bulan, 6-11 Bulan, 1-3 Tahun
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-green-50 rounded-lg sm:rounded-xl border border-green-200">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
              L
            </div>
            <div>
              <h4 className="font-medium text-green-800 text-xs sm:text-sm">Porsi Besar (Large)</h4>
              <p className="text-[10px] sm:text-sm text-green-600 mt-0.5 sm:mt-1">
                Usia: 4-6 Th, 7-9 Th, 10-12 Th, 13-15 Th, 16-18 Th, 19-29 Th, 30-49 Th
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}