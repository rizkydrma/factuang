---
name: tailwind-guidelines
description: Standar penggunaan Tailwind CSS, styling arbitrer, dan pedoman linter. Gunakan ini setiap mendesain atau merefaktor Tailwind.
---

# Antigravity Tailwind Guidelines

Setiap kali Anda menggunakan atau memodifikasi kode berbasis Tailwind CSS di aplikasi ini, pastikan aturan berikut ditegakkan.

## Aturan Jarak & Spacing (Hindari Arbitrary Values)

1. **Dilarang keras memakai nilai `[rem]` bebas** (contoh: `h-[3.25rem]`, `w-[2.75rem]`) apabila nilainya adalah kelipatan basis `0.25rem`.
2. Tailwind berjalan dengan _grid_ skala `0.25rem` (4px). Lakukan pembagian sederhana:
   - Target: `3.25rem` $\rightarrow$ `3.25 / 0.25 = 13`. Gunakan `13` (`h-13`, `w-13`, dll.)
   - Target: `3.75rem` $\rightarrow$ `3.75 / 0.25 = 15`. Gunakan `15` (`h-15`)
   - Target: `2.75rem` $\rightarrow$ `2.75 / 0.25 = 11`. Gunakan `11` (`h-11`)

## Kepatuhan Pada Linter (Auto-Fix)

Secara proaktif pantau peringatan (IDE feedback / _warnings_) yang memunculkan saran untuk membenahi class Tailwind. Secara reaktif lakukan penyederhanaan class Tailwind selama kode itu diubah, tidak perlu menunggu intruksi _user_.

## Elemen Premium UI

1. **Dilarang memakai `transition-all`.** Gunakan deklarasi animasi eksplisit (contoh `transition-colors duration-200` atau `transition-transform`).
2. **Kestabilan Tipografi/Nominal.** Teks yang memuat data moneter uang / berubah-ubah HARUS menggunakan ekstensi `tabular-nums` atau `font-mono` bergantung preferensi layout, guna menjaga struktur tidak berkedip.
