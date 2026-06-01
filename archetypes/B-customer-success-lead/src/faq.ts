// Tiny static knowledge stub. Replace or extend in your brain.
// (Archetype B is the only one that does not consume market mocks —
//  its "data source" is this FAQ + the LLM.)

export interface FaqEntry {
  intent: "onboarding" | "education" | "troubleshooting" | "fees" | "kyc";
  question: string;
  answer: string;
}

export const FAQ: FaqEntry[] = [
  {
    intent: "onboarding",
    question: "How do I start trading on Indodax?",
    answer:
      "Buat akun, selesaikan KYC, deposit IDR via bank transfer atau e-wallet, lalu pilih pasangan trading dari market list.",
  },
  {
    intent: "kyc",
    question: "Why is KYC required?",
    answer:
      "KYC dipakai untuk memenuhi regulasi BAPPEBTI dan AML. Tanpa KYC level dasar, deposit dan trading dibatasi.",
  },
  {
    intent: "fees",
    question: "What are the trading fees?",
    answer:
      "Maker/taker fee standar Indodax (cek halaman Fees terbaru). Volume tinggi dapat tier diskon.",
  },
  {
    intent: "education",
    question: "What's the difference between market and limit orders?",
    answer:
      "Market order eksekusi langsung pada harga terbaik. Limit order eksekusi hanya jika harga mencapai level yang kamu tentukan.",
  },
  {
    intent: "troubleshooting",
    question: "My deposit hasn't arrived",
    answer:
      "Cek status via halaman Deposit History. Transfer bank bisa butuh 1-3 jam kerja. Jika >24 jam, hubungi support dengan TX hash atau bukti transfer.",
  },
  {
    intent: "onboarding",
    question: "How do I withdraw IDR to my Indonesian bank?",
    answer:
      "Buka halaman Withdraw → pilih IDR, masukkan rekening bank tujuan dan nominal, konfirmasi pakai 2FA. Penarikan biasanya proses 1-2 jam kerja, paling lambat 24 jam. Pastikan nama rekening sama dengan nama di akun KYC.",
  },
  {
    intent: "onboarding",
    question: "How do I enable 2FA on my account?",
    answer:
      "Buka Settings → Security → Two-Factor Authentication. Scan QR pakai Google Authenticator atau Authy. Simpan backup code di tempat aman (cetak atau simpan offline) — kamu butuh ini kalau HP hilang atau ganti device.",
  },
  {
    intent: "troubleshooting",
    question: "I lost my phone with my 2FA — how do I recover access?",
    answer:
      "Pakai backup code 2FA yang kamu simpan saat setup. Kalau backup code juga hilang, ajukan reset 2FA via support dengan verifikasi identitas (KTP + selfie + bukti kepemilikan akun). Proses biasanya 1-3 hari kerja.",
  },
  {
    intent: "troubleshooting",
    question: "Someone logged into my account — what should I do?",
    answer:
      "Langkah cepat: 1) Reset password sekarang. 2) Disable semua API key aktif di Settings → API. 3) Cek halaman Withdrawal History — kalau ada transfer yang bukan kamu, hubungi support segera dengan bukti. Akun bisa di-freeze sementara investigasi.",
  },
  {
    intent: "troubleshooting",
    question: "My IDR withdrawal hasn't arrived after 24 hours",
    answer:
      "Cek status di Withdrawal History — kalau masih 'Processing' >24 jam kerja, hubungi support dengan Withdrawal ID. Kalau status 'Done' tapi belum masuk rekening, tanya bank kamu — kadang ada hold internal antar-bank. Untuk withdrawal crypto, paste TX hash di explorer chain terkait.",
  },
  {
    intent: "education",
    question: "Do I need to report my crypto gains for tax in Indonesia?",
    answer:
      "Indodax bukan kantor pajak — tapi yes, transaksi crypto di Indonesia kena PPN final 0.11% dan PPh final 0.1% pada saat eksekusi (otomatis terpotong di sisi exchange). Untuk laporan tahunan, cek halaman Tax Report di akun kamu — ada ringkasan transaksi yang siap dipakai konsultasi dengan pajak.",
  },
  {
    intent: "education",
    question: "What is a stop-loss order?",
    answer:
      "Order otomatis yang jual posisi kamu kalau harga jatuh ke level tertentu — fungsinya membatasi rugi. Contoh: beli ETH di 3500, pasang stop-loss di 3400 berarti kalau harga turun sampai 3400, order jual otomatis tereksekusi. Cocok untuk yang nggak bisa pantau market full-time.",
  },
  {
    intent: "education",
    question: "What is slippage and why does my fill price differ from what I clicked?",
    answer:
      "Slippage = selisih antara harga yang kamu lihat saat klik dengan harga eksekusi sebenarnya. Sering muncul di market order saat likuiditas tipis atau volatilitas tinggi — order kamu kena beberapa level harga sekaligus. Pakai limit order kalau mau lock harga eksaknya.",
  },
  {
    intent: "education",
    question: "What is a trading pair?",
    answer:
      "Pasangan dua aset yang ditukar — kiri = aset yang kamu beli/jual, kanan = aset yang kamu pakai bayar. Contoh: ETH/IDR berarti kamu beli atau jual ETH pakai IDR. BTC/USDT artinya pakai USDT untuk BTC. Pilih pair sesuai aset modal yang kamu punya.",
  },
  {
    intent: "education",
    question: "What's the difference between a Web3 wallet and an exchange account?",
    answer:
      "Beda banget. Web3 wallet = self-custody — kamu sendiri yang pegang seed phrase (contoh: MetaMask, Phantom, Rabby, Trust Wallet). Nggak ada email/password/KYC; kamu generate wallet sendiri dan kamu adalah pemilik kunci. Exchange account (seperti Indodax) = custodial — exchange yang pegang kunci dan saldo IDR/crypto kamu, kamu login pakai email + 2FA. Setup wallet Web3 di luar scope dukungan Indodax. Mayoritas trader baru mulai dari exchange dulu sebelum pindah ke self-custody.",
  },
  {
    intent: "onboarding",
    question: "Where do I see my past orders and trade history?",
    answer:
      "Web: Account → History → Trade History. App: tab Profile → Order History. Bisa filter by pair atau tanggal. Untuk export CSV (buat keperluan pajak atau bookkeeping), hanya tersedia di versi web.",
  },
];
