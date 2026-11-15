# AİP Oyun Akademisi V13 — Kitap Arkadaşım Sınav Merkezi

## Durum
Bu paket yüklenen **aip-oyun-akademisi-main.zip** kaynaklarına eklenmiştir. Var olan 61 oyun, korumalı öğretmen Bilgi Yarışması, Ramazan Köşesi ve Tangram/ Hedef 5 dosyaları korunur. **Canlı siteye yüklenmedi.**

## Yeni özellikler
- Ana sayfa **Kitap Arkadaşım** kategori kartı ve üst menü bağlantısı (şimdilik 📚 simgesi; gerçek Kitap Arkadaşım logosu kaynak ZIP'te olmadığı için eklenmedi).
- Mevcut Kitap Arkadaşım 8 karakterli öğrenci kodu için sunucudan sunucuya doğrulama.
- HMAC-SHA256 imzalı, 60 saniyelik belge doğrulaması; Redis `SET ... EX 120 NX` tek kullanım denetimi; AİP'e özgü HttpOnly Secure SameSite=Strict öğrenci oturumu.
- Sınavı aktif olan kitaplar; kitap başına en az 100 sorudan rastgele 10 soru.
- Çoktan seçmeli ve 1–2 kelimelik boşluk doldurma; yalnızca sunucuda puan hesaplama; öğrenciye cevap anahtarı gönderilmez.
- Kitap başına bir tamamlanmış sınav, sonuçların Redis'de kaydı.
- Ayrı yönetici parolası ile kitap oluşturma, soru havuzunu toplu yükleme veya tamamen değiştirme, aktif/pasif yapma, son 200 sonucu görme, CSV indirme ve kitap/soru yedeği alma.

## Zorunlu Vercel Production değişkenleri
Önceden kaydedilenler:
- `KITAP_ARKADASIM_API_URL` = `https://kitaparkadasim.com/api/integrations/aip/student-login`
- `KITAP_ARKADASIM_INTEGRATION_ID` = `aip-oyun-akademisi-prod`
- `KITAP_ARKADASIM_INTEGRATION_SECRET` = Replit Production ile **aynı** gizli anahtar.
- Upstash bağlantısı: `KV_REST_API_URL` ve `KV_REST_API_TOKEN` (Vercel tarafından eklendi).

**Yeni eklenmesi gereken tek değişken:**
- `BOOK_EXAM_ADMIN_PASSWORD` = yalnızca sizin bildiğiniz, en az **16 karakter** uzunluğunda rastgele güçlü yönetici parolası. Tür **Secret**, ortam **Production**. Öğretmen kodu veya öğrenci kodu olarak kullanmayın; GitHub'a koymayın.

Değişkeni ekledikten sonra yeni GitHub `main` dağıtımı yapılmalıdır. Kaydedilmiş Secret değerlerini ekran görüntüsünde göstermeyin.

## GitHub'a yükleme
Bu paketin dosyalarını depoda en üst düzeye yükleyin (ZIP'in kendisini ya da üst klasörü değil). Değiştirilen dosyalar: `index.html`, `app.js`, `v12-theme.css`, `package.json`. Yeni dosyalar: `book-exams.js`, `api/books/*`, `V13_KURULUM.md`. Var olan `api/quiz` dosyalarına dokunulmaz.

## Toplu soru formatı
Yönetim panelinde tek bir kitap seçiliyken aşağıdaki gibi her satıra soru yazılır:

```
TEST - Hikâyede kahramanın bulduğu eşya hangisidir? - Defter - Anahtar - Top - Kalem - B
BOSLUK - Hikâyedeki köpeğin adı nedir? - Karabaş
BOSLUK - Kahramanın çantasının rengi nedir? - kırmızı / al
```

- Test soruları tam **4 şıklı** olmalı; son alan doğru şık harfi (`A`, `B`, `C`, `D`).
- Boşluk doldurma cevapları **en çok 2 kelime** olmalı. `/` ile birden fazla doğru cevap alternatifi girilebilir.
- Ayırıcı ` - ` (iki yanında boşluklu kısa çizgi). 100 soruluk dosya tek seferde yapıştırılabilir. Hatalı satır bulunursa **hiçbir soru eklenmez** ve sorunlu satırlar bildirilir.
- Kitap oluşturulunca **pasif** başlar. Havuzda 100 veya daha fazla geçerli soru varsa yönetici **Aktif yap** diyebilir.
- Eski soruları silmek/değiştirmek için toplu yüklemedeki **Bu kitabın eski sorularını tamamen değiştir** kutusu seçilir. Önce soru bankası JSON yedeğini alın.

## Önemli entegrasyon notu
Replit raporunda doğrulama belgesinin biçimi, HMAC türetimi ve `iss`, `aud`, `exp`, `sub`, `jti` alanları tarif edilmişti. API'nin JSON yanıtında imzalı belgenin bulunduğu alanın **kesin ismi** raporda verilmemiştir. İstemci tarafı yaygın `assertion`, `token`, `verification`, `proof` ve `data.assertion` alanlarını deniyor. Replit farklı isim kullanıyorsa `api/books/login.mjs` içindeki alan eşlemesi düzenlenmelidir. Bu, **gerçek entegrasyon testine kadar doğrulanmamış** bir nokta. **Gizli anahtarı veya gerçek öğrenci kodunu sohbette paylaşmayın.**

## Güvenlik ve işletim sınırları
- Uygulama ilk kurulumda boş soru havuzuyla gelir. Hiçbir hayalî kitap veya soru eklenmez.
- Öğrencilerin isimleri saklanmaz; Replit'ten gelen uygulamaya özel takma `sub` kimliği sonuçlarda kullanılır.
- Yönetici erişimi ve öğrenci erişimi farklı oturumlarla yönetilir.
- Öğrenci aynı kitaba tamamlanmış bir sınavdan sonra yeniden giremez. Sonuç sıfırlama, kitap silme, rol ve genişletilmiş analitik özellikleri bu sürümde yoktur.
- Soru ve sonuç kayıtları Upstash Redis içinde kalıcı anahtarlarla saklanır (TTL yok). Ücretsiz hizmetin kapasitesi ve veri saklama koşulları izlenmeli, düzenli JSON yedek alınmalıdır.
- Upstash kesintisinde sistem güvenli şekilde giriş ya da sınav işlemini reddeder; sonuçlar tarayıcıda tutulmaz.
- Tarayıcıda güvenli öğrenci giriş testi ve gerçek Replit API yanıtı henüz doğrulanmamıştır. Canlıya aktarınca sınırlı erişimle kontrol edilmelidir.
- Bu sürüm, Replit API'sinde tanımlanan 15 dakikalık giriş sınırları yanında AİP tarafında ayrıca IP bazlı giriş sınırları uygular.
- Gerçek Kitap Arkadaşım logosu kaynak dosyalarda bulunmadığı için şimdilik emoji kullanılır; logo dosyası geldiğinde değiştirilir.

## Yerel test
`npm test` ile mevcut güvenlik testleri ve yeni soru / doğrulama-belgesi testleri çalıştırılır. İndirilmiş `index.html` dosyasında sunucu işlevleri çalışmaz; bu sürüm Vercel üzerinde kullanılmak üzere hazırlanmıştır.
