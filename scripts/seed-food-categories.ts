import { prisma } from '../src/lib/prisma';

const mappings: Record<string, string> = {
  'Nasi': 'makanan_pokok',
  'Nasi Daun Jeruk': 'makanan_pokok',
  'Lontong': 'makanan_pokok',
  'Mie': 'makanan_pokok',
  'Kwetiaw': 'makanan_pokok',
  'Roti': 'makanan_pokok',
  'Jagung': 'makanan_pokok',
  'Kacang Merah': 'makanan_pokok',
  'Ayam Goreng': 'lauk_pauk',
  'Ayam Serundeng': 'lauk_pauk',
  'Chicken Katsu': 'lauk_pauk',
  'Bakso Saus BBQ': 'lauk_pauk',
  'Lele Crispy': 'lauk_pauk',
  'Semur Ayam Kecap': 'lauk_pauk',
  'Telur': 'lauk_pauk',
  'Telur Semur': 'lauk_pauk',
  'Rolade Asam Manis': 'lauk_pauk',
  'Gudeg': 'lauk_pauk',
  'Tahu': 'lauk_nabati',
  'Tahu Crispy': 'lauk_nabati',
  'Tempe Goreng': 'lauk_nabati',
  'Tempe Sagu': 'lauk_nabati',
  'Pepes Tahu': 'lauk_nabati',
  'Keju': 'lauk_nabati',
  'Capcay': 'sayur',
  'Sawi': 'sayur',
  'Tumis Keciwis': 'sayur',
  'Tumis Koll Wortel': 'sayur',
  'Ketimun dan Selada': 'sayur',
  'Sayur Isi Pepaya': 'sayur',
  'Apel': 'buah',
  'Jeruk': 'buah',
  'Pisang': 'buah',
  'Pisang Lampung': 'buah',
  'Anggur': 'buah',
  'Kelengkeng': 'buah',
  'Salad Buah': 'buah',
  'Fla Susu': 'lainnya',
  'Acar Timun Wortel': 'lainnya',
};

async function main() {
  let total = 0;
  for (const [name, category] of Object.entries(mappings)) {
    const result = await prisma.food.updateMany({ where: { name }, data: { category } });
    if (result.count > 0) {
      total += result.count;
      console.log('Updated: ' + name + ' -> ' + category);
    }
  }
  console.log('Total updated: ' + total);
  const cats = await prisma.food.groupBy({ by: ['category'], _count: { id: true } });
  console.log(JSON.stringify(cats, null, 2));
}

main().catch(e => { console.error(e.message); process.exit(1); }).finally(() => { prisma.$disconnect(); });
