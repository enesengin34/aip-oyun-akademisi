# AİP Oyun Akademisi — v8

## Çalıştırma
`index.html` dosyasını tarayıcıda açın. Bütün site dosyalarını ve `flags/` klasörünü birlikte saklayın.

## Yeni özellikler
- Siyah dış zemini kaldırılmış, arka planı şeffaf okul logosu: `aip-logo-transparent.png`.
- Her eşleştirme oyunu için mevcut doğru bilgi eşlerinden türetilmiş 25 farklı üçlü kombinasyon; beş soruluk oturumlarda aynı kombinasyon yeniden çıkmaz.
- Güvenli Yol, Doğayı Koruyorum ve Kodlama Mantığı soru bankalarında toplam 25 özgün soru.
- Sayısal ve diğer oyunlarda 500 aday üretilerek **içeriği birbirinden farklı** en fazla 25 soru seçilir; birbirinin aynı sorular ayıklanır. Saat, ölçü, ritim ve bazı ana sınıfı oyunlarının mevcut temel içerik havuzu daha sınırlıdır.
- Öğrenci hesabı, adı, kimliği alınmaz. Sadece bu tarayıcıda görülen etkinlik indeksleri (`localStorage`) saklanır. Her oyunda kendi farklı içerik havuzu bitince tekrar başlar.

## Önemli
- İlk 49 oyunun tamamı korunur. Eşleştirme oyunlarında 25 farklı etkinlik kombinasyonu bulunur. Diğer oyunlarda içerik bakımından farklı en fazla 25 etkinlik seçilir; bazı oyunlarda henüz 20 farklı temel örnek yoktur. Bu nedenle tüm 49 oyunun 20–30 özgün soruya ulaştığı iddia edilmez.
- Yönetim (Demo) bağlantısı kaldırıldı. Site içeriği GitHub dosyaları güncellenerek, Vercel üzerinden yayımlanır.
- Yayın: GitHub depoya tüm dosyaları yükleyin, ardından Vercel → Add New → Project → GitHub deposunu Import → Deploy. Framework seçimi: Other. Root Directory: `./`, Build Command boş, Output Directory boş.
- Vercel site adresi dağıtım sonrası otomatik üretilir; özelleştirme Vercel Project → Settings → Domains ekranındadır.
- İnternet erişimi olmadan da oyunlar ve bayraklar çalışır. Bazı tarayıcılarda seslendirme desteği cihazla değişebilir.


## V9 Güncellemeleri
- Hakkında sayfası eklendi.
- Yönetim menüsü kaldırıldı; site yönetimi GitHub/Vercel üzerinden yapılacak şekilde düzenlendi.
- Enes Engin tanıtım bölümü ve fotoğrafı eklendi.
- /hakkinda yönlendirme sayfası eklendi.

## V9.1 Düzeltmesi
- Hakkında sekmesine tıklayınca ilgili içerik açılır.
- `index.html#hakkinda` ve `/hakkinda` yönlendirmesi desteklenir.


## V10 Güncellemeleri
- Ana sayfa renkli AİP Oyun Akademisi tasarımına göre yenilendi.
- Büyük sınıf seçimi düğmeleri ve renkli kategori kartları eklendi.
- Hemen Oyna, Hakkında ve oyun yönlendirmeleri bu tasarım içinde çalışır hâle getirildi.
- Mevcut 49 oyun, rozetler ve Hakkında sayfası korunmuştur.


## V11 — Akıl-Zekâ Bölümü
- Satranç (iki kişi aynı cihazda; yasal hamle, rok, geçerken alma, terfi, şah/mat/pat ve temel beraberlik kontrolleri)
- Türk daması (iki kişi aynı cihazda; zorunlu taş alma, çoklu sıçrama, dama taşı)
- Dokuz Taş (iki kişi aynı cihazda; yerleştirme, değirmen ve taş alma)
- OXO (bilgisayara karşı)
- Reversi (bilgisayara karşı)
- Koridor (iki kişi aynı cihazda; 9x9 tahta, engel yerleştirme ve yol açık kalma kontrolü)
- 49 eğitsel oyun korunur. Yeni bölümde 6 strateji oyunu vardır.
- Bunlar internete yayımlandığında web üzerinden açılır; **farklı cihazlardaki oyuncular arasında gerçek zamanlı maç veya online eşleştirme henüz yoktur.** Bunun için veritabanı, sunucu ve oyun odaları geliştirilmelidir.
