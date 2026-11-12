import type {MatchAnswers} from './engine';
import {characters} from '../taxonomy/registry';

export const steps = [
  {
    title: 'Kenali permainan Anda.',
    description: 'Pilih kemampuan saat ini dan tujuan bermain Anda.',
    fields: [
      {key:'level',label:'Seberapa nyaman Anda bermain?',options:[
        ['beginner','Baru membangun dasar','Masih belajar kontak bola dan rally.'],
        ['intermediate','Rally mulai konsisten','Sudah bisa mengatur arah dan tempo.'],
        ['advanced','Teknik sudah terbentuk','Terbiasa dengan variasi dan strategi.'],
        ['unsure','Belum yakin','Lanjutkan dari preferensi bermain.']
      ]},
      {key:'use',label:'Biasanya bermain untuk apa?',options:[
        ['recreational','Rekreasi & latihan','Bermain santai atau latihan rutin.'],
        ['competitive','Pertandingan','Berlatih dan bermain untuk berkompetisi.']
      ]}
    ]
  },
  {
    title: 'Di mana Anda paling nyaman bermain?',
    description: 'Pilih gaya yang paling menggambarkan permainan Anda.',
    fields:[{key:'style',label:'Gaya bermain',options:[
      ['baseline','Dari belakang lapangan','Membangun rally dan menyerang dari baseline.'],
      ['net','Maju ke net','Suka volley dan mengambil bola lebih awal.'],
      ['allcourt','Menjelajah seluruh lapangan','Berganti antara baseline dan net.'],
      ['unsure','Masih mencari gaya','Sedang mencoba berbagai pola permainan.']
    ]}]
  },
  {
    title:'Apa yang paling Anda cari?',
    description:'Pilih satu atau dua karakter utama. Ini mendapat bobot terbesar.',
    fields:[{key:'priorities',label:'Prioritas karakter',options:characters.map(([id,label,description])=>[id,label,description])}]
  },
  {
    title:'Apa yang ingin lebih mudah?',
    description:'Pilih satu tantangan yang paling sering Anda rasakan.',
    fields:[{key:'challenge',label:'Tantangan pukulan',options:[
      ['mishits','Kontak bola lebih konsisten','Sering mengenai area di luar tengah senar.'],
      ['late','Lebih cepat menyiapkan raket','Sering terlambat mengayun atau bereaksi.'],
      ['short','Bola lebih dalam','Pukulan sering terlalu pendek.'],
      ['long','Arah dan panjang lebih terjaga','Bola sering melewati sasaran.'],
      ['none','Belum ada yang spesifik','Ingin mencari pilihan berdasarkan preferensi utama.']
    ]}]
  },
  {
    title:'Respons seperti apa yang Anda sukai?',
    description:'Gunakan pengalaman pribadi Anda saat mencoba raket.',
    fields:[{key:'response',label:'Preferensi respons',options:[
      ['soft','Lebih lembut','Mengutamakan karakter comfort.'],
      ['crisp','Lebih terasa kontak bolanya','Mengutamakan feel dan kontrol.'],
      ['balanced','Seimbang','Tidak perlu memberi bobot tambahan pada respons.'],
      ['unsure','Belum tahu','Saya ingin mencoba beberapa pilihan dahulu.']
    ]}]
  },
  {
    title:'Berapa berat yang nyaman Anda ayun?',
    description:'Rentang mengacu pada berat utama yang tercatat di katalog. Kondisi senar dapat berbeda antar-sumber.',
    fields:[{key:'weight',label:'Preferensi berat',options:[
      ['light','Ringan','Di bawah 295 g.'],
      ['medium','Sedang','295–305 g.'],
      ['heavy','Lebih berbobot','Di atas 305 g.'],
      ['any','Belum ada preferensi','Pertimbangkan seluruh rentang berat.']
    ]}]
  }
] satisfies {title:string;description:string;fields:{key:keyof MatchAnswers;label:string;options:(readonly string[])[]}[]}[];
