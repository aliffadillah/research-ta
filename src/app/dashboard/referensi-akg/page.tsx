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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-sans mb-2">Referensi AKG</h1>
        <p className="text-text-muted">
          Angka Kecukupan Gizi yang Dianjurkan per Hari
        </p>
      </div>

      {/* Info Banner */}
      <div className="card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Tentang AKG</h3>
            <p className="text-sm text-text-muted">
              Angka Kecukupan Gizi (AKG) adalah rata-rata kebutuhan zat gizi harian yang
              memenuhi kebutuhan hampir semua ({`<`}97,5%) populasi sehat menurut jenis kelamin
              dan kelompok usia.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span><strong>Porsi Kecil:</strong> Usia 0-5 Bulan, 6-11 Bulan, 1-3 Tahun</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span><strong>Porsi Besar:</strong> Usia 4-6 Tahun hingga 30-49 Tahun</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Tables */}
      <div className="space-y-6">
        {groupedData.map((group) => (
          <div key={group.gender} className="card-static">
            {/* Gender Header */}
            <button
              onClick={() => setExpandedGender(expandedGender === group.gender ? null : group.gender)}
              className="w-full flex items-center justify-between p-4 bg-bg rounded-xl mb-4 hover:bg-border transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  group.gender === "bayi_anak" ? "bg-purple-100" :
                  group.gender === "laki_laki" ? "bg-blue-100" : "bg-pink-100"
                }`}>
                  <span className={`text-lg ${
                    group.gender === "bayi_anak" ? "text-purple-600" :
                    group.gender === "laki_laki" ? "text-blue-600" : "text-pink-600"
                  }`}>♂</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">{group.genderLabel}</h3>
                  <p className="text-sm text-text-muted">
                    {group.porsiKecil.length + group.porsiBesar.length} kelompok usia
                  </p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-text-muted transition-transform ${expandedGender === group.gender ? "rotate-180" : ""}`} />
            </button>

            {/* Expanded Content */}
            {expandedGender === group.gender && (
              <div className="space-y-6">
                {/* Porsi Kecil Section */}
                {group.porsiKecil.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-4 h-4 bg-blue-500 rounded-full" />
                      <h4 className="font-medium text-blue-600">Porsi Kecil</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Kelompok Usia</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">
                              <div className="flex items-center justify-end gap-1">
                                <Scale className="w-4 h-4" />
                                Berat (kg)
                              </div>
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">
                              <div className="flex items-center justify-end gap-1">
                                <Ruler className="w-4 h-4" />
                                Tinggi (cm)
                              </div>
                            </th>
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
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full" />
                      <h4 className="font-medium text-green-600">Porsi Besar</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Kelompok Usia</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">
                              <div className="flex items-center justify-end gap-1">
                                <Scale className="w-4 h-4" />
                                Berat (kg)
                              </div>
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">
                              <div className="flex items-center justify-end gap-1">
                                <Ruler className="w-4 h-4" />
                                Tinggi (cm)
                              </div>
                            </th>
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
        <h3 className="text-lg font-semibold mb-4">Keterangan Kategori Porsi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            <div>
              <h4 className="font-medium text-blue-800">Porsi Kecil (Small)</h4>
              <p className="text-sm text-blue-600 mt-1">
                Untuk kelompok usia: 0-5 Bulan, 6-11 Bulan, 1-3 Tahun
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              L
            </div>
            <div>
              <h4 className="font-medium text-green-800">Porsi Besar (Large)</h4>
              <p className="text-sm text-green-600 mt-1">
                Untuk kelompok usia: 4-6 Tahun, 7-9 Tahun, 10-12 Tahun, 13-15 Tahun, 16-18 Tahun, 19-29 Tahun, 30-49 Tahun
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}