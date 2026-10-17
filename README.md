# 🎓 YDS & YÖKDİL & YDT Başarı Kampı (18 Gün)

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.11-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.15-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Dexie.js](https://img.shields.io/badge/IndexedDB-Dexie.js-orange.svg)](https://dexie.org/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest-yellow.svg?logo=vitest)](https://vitest.dev/)
[![Theme](https://img.shields.io/badge/Palette-%23F1A400%20%7C%20%23131B1E-F1A400.svg)](#-tema-ve-tasarım-sistemi)

**YDS Camping**, YDS, YÖKDİL ve YDT sınavlarına hazırlanan öğrenciler için tasarlanmış; **18 Günlük Yoğun Gramer ve Sınav Kampı** müfredatını oyunlaştırılmış, çevrimdışı (offline-first) ve modern bir web arayüzü ile sunan kapsamlı bir çalışma platformudur.

Platform, **Dilci Burak Hoca**'nın 18 Günde YDS/YÖKDİL kamp serisiyle tam uyumlu çalışır; interaktif video oynatıcı, zaman damgalı alt bölüm atlama, sinema modu, bölüm bazlı ilerleme takibi, ders notları, sınav taktikleri ve konu quizleri içerir.

---

## 🌟 Öne Çıkan Özellikler

### 1. 🎬 Gelişmiş Gramer Video Oynatıcısı & Kamp Serisi
- **37 Kapsamlı Video Dersi**: 18 güne dağıtılmış konu anlatımları ve soru çözüm videoları.
- **Bölüm Bazlı Tamamlama (Granular Tracking)**: Bir gün birden fazla video bölümü içeriyorsa (örn. Gün 1 Bölüm 1, Bölüm 2, Bölüm 3), her bölüm bağımsız olarak tamamlanabilir. Günün tüm bölümleri bittiğinde gün otomatik olarak tamamlandı işaretlenir.
- **İlerleme Sıfırlama (Reset / Undo)**: Tamamlanan her bölümün veya tüm günün ilerlemesi istendiğinde tek tıkla sıfırlanabilir.
- **Zaman Damgalı Atlama (Chapter Seeking)**: Videoların alt başlıkları ve süre aralıkları (`startSeconds` - `endSeconds`) entegre edilmiştir. Başlığa tıklandığında video doğrudan o konunun anlatıldığı saniyeye sarar.
- **Sinema Modu (Theater / Widescreen Mode)**:
  - Video oynatıcıyı 1440px genişliğinde tam ekran sinematik görünüme genişletir.
  - Sağ taraftaki gün listesi otomatik olarak gizlenir.
  - Sinema modundayken diğer günlere göz atmak için sağdan açılan **yan çekmece (drawer)** veya yüzen buton kullanılabilir.
  - Klavye kısayolu: <kbd>T</kbd> tuşu ile anında sinema moduna geçilir / çıkılır. <kbd>Esc</kbd> tuşu ile çekmece kapatılır.
  - Kullanıcı tercihi `localStorage` ile hatırlanır.

### 2. 📝 Ders Notları, Formüller & Konu Quizleri
- Her dersin altında detaylı **dilbilgisi formülleri**, **zaman zarfları tablosu** ve **sınav ipuçları**.
- Videodaki kurallara göre hazırlanmış **interaktif çoktan seçmeli quizler**.
- Yanıtlar ve çözümler anında değerlendirilir, IndexedDB'ye kaydedilir.

### 3. 📅 18 Günlük Kamp Takvimi & Çalışma Planlayıcı
- Günlük tahmini çalışma süreleri ve zorunlu/seçmeli görev hedefleri.
- Gün gün filtreleme, modül kartları ve ilerleme yüzdeleri.
- Tamamlanan günler ve bölümler belirgin **yeşil (emerald)** rozetlerle vurgulanır.

### 4. 📚 Diğer Çalışma Modülleri
- **Vocabulary (Kelime Havuzu)**: Akademik kelime setleri, eş anlamlılar, bağlam içi cümleler ve aralıklı tekrar (spaced repetition / flashcards).
- **Reading (Okuma Parçaları)**: Sınav düzeyinde akademik metinler ve anlama soruları.
- **Skills (Soru Tipleri & Beceriler)**: Paragraf tamamlama, çeviri, diyalog ve anlam bütünlüğünü bozan cümleyi bulma taktikleri.
- **Review (Tekrar Havuzu)**: Yanlış yapılan soruların biriktiği ve periyodik tekrar edildiği özel modül.
- **Analytics & Dashboard**: Çalışma serisi (streak), başarı grafikleri (Recharts) ve detaylı performans istatistikleri.

### 5. 🎨 Özel Tema ve Tasarım Sistemi
Platform, yüksek kontrastlı ve modern bir renk paleti üzerine inşa edilmiştir:
- **Ana Renk (Primary)**: `#F1A400` *(Canlı Altın / Kehribar)*
- **İkinci Renk (Secondary)**: `#131B1E` *(Derin Antrasit / Arduvaz)*
- **Tamamlandı Durumu (Success)**: Zümrüt Yeşili *(Emerald / WCAG AAA kontrastlı)*
- **Koyu (Dark) ve Açık (Light) Mod**: Sistem tercihine göre veya elle değiştirilebilir akıcı tema desteği.

### 6. 💾 %100 Yerel ve Çevrimdışı (Offline-First)
- Tüm kullanıcı ilerlemesi, quiz yanıtları, görev durumları ve ayarlar tarayıcının **IndexedDB** veritabanında (Dexie.js) saklanır.
- İnternet bağlantınız kopsa bile verileriniz kaybolmaz.
- Ayarlar sayfasından verilerinizi **JSON olarak yedekleyebilir** ve dilediğiniz zaman geri yükleyebilirsiniz.

---

## ⌨️ Klavye Kısayolları

| Tuş | İşlev |
| :--- | :--- |
| <kbd>T</kbd> | Video detay sayfasında **Sinema Modunu** açar / kapatır |
| <kbd>Esc</kbd> | Açık olan gün listesi çekmecesini veya sinema modunu kapatır |

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Arayüz Kütüphanesi** | React 18.3 | Bileşen tabanlı modern UI mimarisi |
| **Programlama Dili** | TypeScript 5.6 | Güvenli tip kontrolü ve geliştirici deneyimi |
| **Derleyici / Sunucu** | Vite 5.4 | Yıldırım hızında HMR ve optimize edilmiş build |
| **Stil & CSS** | Tailwind CSS 3.4 | Özel CSS değişkenleri ve responsive tasarım sistemi |
| **İkonlar** | Lucide React | Modern, temiz SVG ikon seti |
| **Yerel Veritabanı** | Dexie.js 4.0 | IndexedDB üzerinde reaktif veri katmanı |
| **Durum Yönetimi** | Zustand 5.0 | Hızlı ve hafif küresel durum yönetimi |
| **Grafikler** | Recharts 2.13 | Performans ve başarı analitiği görselleştirme |
| **Yönlendirme** | React Router v6 | İstemci tarafı sayfa yönlendirmesi |
| **Test Kütüphanesi** | Vitest & Testing Library | Birim ve entegrasyon testleri |

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- **Node.js**: v18.0.0 veya üzeri
- **npm** veya **pnpm** / **yarn**

### 1. Depoyu İndirin ve Bağımlılıkları Kurun
```bash
# Proje dizinine gidin
cd YDS_Camping

# Bağımlılıkları yükleyin
npm install
```

### 2. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```
Sunucu başlatıldıktan sonra tarayıcınızda `http://localhost:5173/` adresine gidin.

### 3. Testleri Çalıştırın
```bash
# Birim testlerini çalıştır
npm run test

# TypeScript tip kontrolü
npm run typecheck
```

### 4. Canlı Sürüm Derlemesi (Production Build)
```bash
npm run build
npm run preview
```

---

## 🌐 GitHub Pages Canlı Yayınlama (Deployment)

Proje, GitHub Pages üzerinde **sıfır yapılandırma ile sorunsuz çalışacak şekilde** hazırlanmıştır:
- **HashRouter Mimarisi**: GitHub Pages'in SPA (Single Page App) sayfalarında sayfa yenilendiğinde (F5) 404 hatası vermesini engeller.
- **`public/404.html` SPA Yönlendiricisi**: Doğrudan URL ile girilen sayfalarda otomatik olarak doğru rotaya yönlendirir.
- **Vite Göreli Base Yolu (`./`)**: Repository adı (`/English_Camp/`) veya özel domain fark etmeksizin tüm asset'lerin eksiksiz yüklenmesini sağlar.

### Yöntem 1: GitHub Actions ile Otomatik Dağıtım (Önerilen)

Projeye eklenmiş olan [`.github/workflows/deploy.yml`](file:///.github/workflows/deploy.yml) iş akışı sayesinde, koda her `git push` yapıldığında site otomatik olarak derlenir ve yayınlanır.

1. GitHub deponuzun ayarlarına gidin: **Settings** -> **Pages**.
2. **Build and deployment** başlığı altındaki **Source** seçeneğini **GitHub Actions** olarak seçin.
3. Değişiklikleri `master` veya `main` branch'ine push edin:
   ```bash
   git add .
   git commit -m "feat: configure github pages deployment"
   git push origin master
   ```
4. GitHub Actions sekmesinden yayınlanma sürecini izleyin. Birkaç dakika içinde siteniz canlıya alınacaktır:
   👉 **`https://efecanaltay.github.io/English_Camp/`**

### Yöntem 2: Terminalden Manuel Dağıtım (`gh-pages`)

İsterseniz terminalden tek bir komutla derleyip doğrudan `gh-pages` branch'ine gönderebilirsiniz:
```bash
npm run deploy
```
Bu komut önce `npm run build` çalıştırarak en güncel `dist/` klasörünü üretir, ardından `gh-pages` branch'ine yükler. (Bu yöntemi kullanırken GitHub Pages ayarlarında Source: **Deploy from a branch** ve Branch: **`gh-pages`** seçili olmalıdır).

---

## 📂 Proje Dizin Yapısı

```text
YDS_Camping/
├── content/
│   └── curriculum/
│       └── sample-camp.json          # 18 günlük kamp müfredatı ve görev şablonu
├── src/
│   ├── app/
│   │   ├── layouts/                  # MainLayout, Sidebar, Header
│   │   ├── providers/                # ThemeProvider vb.
│   │   ├── App.tsx                   # Ana React bileşeni
│   │   └── router.tsx                # React Router v6 rota tanımları
│   ├── components/
│   │   └── ui/                       # Button, Badge, Card, YouTubeEmbed vb.
│   ├── core/
│   │   ├── content/                  # Gramer JSON verileri ve ders tanımları
│   │   ├── database/                 # Dexie.js IndexedDB şeması ve repository'ler
│   │   ├── domain/                   # TypeScript veri modelleri ve tipler
│   │   ├── engines/                  # İlerleme, planlayıcı ve tekrar algoritmaları
│   │   └── storage/                  # Yedekleme ve JSON export/import servisleri
│   ├── features/
│   │   ├── dashboard/                # Karşılama, metrikler ve günlük hedefler
│   │   ├── grammar/                  # Video listesi, detay sayfası, sinema modu, quiz
│   │   ├── study-planner/            # 18 günlük takvim ve günlük görev listesi
│   │   ├── vocabulary/               # Akademik kelime listeleri ve flashcard'lar
│   │   ├── reading/                  # Okuma metinleri ve analizler
│   │   ├── skills/                   # Soru çözüm becerileri
│   │   ├── review/                   # Hata havuzu ve aralıklı tekrar
│   │   ├── progress/                 # Detaylı grafikler ve analitik
│   │   └── settings/                 # Veri yedekleme, sıfırlama ve ayarlar
│   ├── hooks/                        # useCampProgress, useTheme vb.
│   ├── lib/                          # utils (cn / clsx / tailwind-merge)
│   ├── styles/                       # index.css (Tema token'ları, değişkenler)
│   └── main.tsx                      # Uygulama giriş noktası
├── package.json
├── tailwind.config.js                # #F1A400 ve #131B1E tema konfigürasyonu
├── tsconfig.json
└── vite.config.ts
```

---

## 📋 Görev Akışı ve Tamamlama Mantığı

1. **Günün Bölümleri**: Birden fazla videosu olan günlerde her video `grammar-part-${lessonId}` ID'si ile bağımsız olarak takip edilir.
2. **Gün Tamamlanması**: Bir güne ait tüm video bölümleri tamamlandığında `d${day}-t1-grammar` ana görevi otomatik olarak bitmiş sayılır ve takvimde gün yeşil olarak işaretlenir.
3. **Puanlama**: Quiz çözüldüğünde alınan başarı puanı ilgili göreve işlenir ve analitik sayfasına yansıtılır.
4. **Sıfırlama**: İstenirse bölüm bazında veya gün bazında sıfırlama yapılarak dersler tekrar çalışılabilir.

---

## 📄 Lisans

Bu proje kişisel eğitim ve sınav hazırlığı amacıyla geliştirilmiştir. Ders içerikleri ve anlatımlar **Dilci Burak Hoca**'nın açık video eğitim serisine dayanmaktadır.
