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
];
