# AİP Oyun Akademisi V12.4 — Korumalı Bilgi Yarışması + Ramazan Toplu Soru

Bu sürüm bir **test sürümüdür**. Canlı site otomatik olarak değiştirilmedi.

## Neler var?
- 60 mevcut oyun, tasarım, satranç saati ve Sudoku düzenlemeleri korunur.
- **Ramazan Köşesi** herkese açıktır. `ramazan-ek-sorular.js` içinde ` - ` kullanarak toplu soru eklenir.
- **Bilgi Yarışması** artık 8 haneli giriş kodu ister. Kod doğrulaması `/api/quiz/login` üzerinden Vercel'de yapılır.
- Özel sorular **statik dosyada bulunmaz**. Sadece geçerli oturumla `/api/quiz/questions` yanıtında sağlanır.
- Şıkların başlangıçta gösterilip gösterilmeyeceği, takım sayısı, süre ve puan işlemleri korunur.

## 1. ÖNEMLİ: Yerel ZIP ile korumalı giriş yapılamaz

`index.html` dosyasına çift tıklayarak oyunlar ve Ramazan Köşesi çalışabilir, **ama Bilgi Yarışması girişinin çalışması için Vercel sunucusuna dağıtım gerekir**. `/api` dosyaları sıradan yerel dosya olarak çalışmaz.

**Güvenli yayımlama sırası:** GitHub'da `v12-4-test` isimli ayrı dal açın ve paketin içindeki dosyaları bu dala yükleyin. Vercel'deki Preview Deployment adresinde doğrulayın. Test ve Vercel gizli ayarları tamamlanmadan `main` dalına birleştirmeyin.

## 2. Vercel'de GİZLİ ayarlar

Vercel → Project `aip-oyun-akademisi` → Settings → Environment Variables bölümünden **Preview** ve **Production** için ayrı değerlerle şu değişkenleri ekleyin:

**QUIZ_CODES:** Her satıra bir 8 haneli kod, en çok istediğiniz kadar (100 kod desteklenir):

```text
12345678
87654321
...
```

*Bunlar yalnızca şema örneğidir, gerçek kullanımda rastgele ve benzersiz kodlar seçin.* İsterseniz kendi bilgisayarınızda `node scripts/kod-olustur.mjs` çalıştırarak 100 rastgele kod üretebilirsiniz. **Kodları `GitHub` deposuna, `quiz-bank.js` içine veya öğrencilere açık bir dosyaya koymayın.** Vercel ortam değişkenini yalnızca yetkili yöneticiler görür. Kodları ayrıca güvenli bir yönetici listesinde saklayın, öğretmenlere ayrı ayrı iletin.

**QUIZ_SESSION_SECRET:** 32 bayttan uzun, tahmin edilemez bir rastgele değer (ör. terminalinizde `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` ile üretilir). Bu değeri de **GitHub'a koymayın**.

**QUIZ_BANK_TEXT:** Özel yarışma sorularını her satıra bir soru olarak yazın:

```text
Türkiye'nin başkenti neresidir? - Ankara - İstanbul - İzmir - Bursa - A
Bir yılda kaç mevsim vardır? - 2 - 3 - 4 - 5 - C
```

Bu soruları **yalnızca Vercel ortam değişkenine** yapıştırın. Kodları veya gizli soru bankasını GitHub'daki herkese açık `quiz-bank.js` dosyasına koymayın. `QUIZ_BANK_TEXT` gizli soruları içeren bir ortam değişkenidir ve dağıtımın sunucu tarafında okunur.

Vercel'in ortam değişkenleri **toplam 64 KB** ile sınırlıdır. Büyük soru bankalarında bir sonraki adım özel veritabanıdır. Değişkenler güncellendikten sonra yeni dağıtım yapılmalıdır.

### Yanlış giriş sınırı — üretim için tavsiye edilen ek adım

Üretimde dağıtık ve dayanıklı deneme sınırlaması için **Upstash Redis** gerekir. Upstash REST URL ve token'ı Vercel ortam değişkenlerine `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` olarak eklerseniz sunucu IP başına 15 dakika içinde 5 hatalı denemeyi sınırlamaya çalışır. Redis bağlantısı hata verirse yeni giriş denemesi engellenir. Bu değişkenler yoksa yalnızca sunucu örneği bazında koruma bulunur ve çoklu sunucu durumunda yeterli güvenlik sağlamayabilir. Vercel WAF/rate-limiting de ayrıca önerilir. Kodu paylaşan bir öğretmen veya ekran görüntüsü alan kişi yine soruları yayabilir.

**Giriş süresi:** başarılı doğrulamadan sonra 3 saat. Çıkış düğmesi cookie'yi siler. Geçerli kodu iptal etmek için `QUIZ_CODES` listesinden kaldırıp yeniden dağıtım yapın. Önceden açılmış oturumlar en çok 3 saat devam edebilir. Acil tüm oturum iptali için `QUIZ_SESSION_SECRET` değiştirilip yeniden dağıtılmalıdır.

## 3. Ramazan Köşesi'ne toplu soru

GitHub'da `ramazan-ek-sorular.js` dosyasını açıp aşağıdaki biçimde her satıra soru ekleyin:

```text
oruc - 2 - İftar vaktinde ne yapılır? - Oruç açılır - Sahura kalkılır - Uykuya yatılır - A - İftar, orucun akşam vakti açılmasıdır.
```

Konu kodları: `hayat`, `kuran`, `namaz`, `oruc`, `kultur`, `ahlak`. Sınıf: `0` ana sınıfı, `1`-`4` ilkokul. Bu sorular **herkese açık** olduğu için gizli yarışma sorularını bu dosyaya koymayın.

## 4. Test

`npm test` komutuyla kimlik doğrulama ve erişim kontrollerini çalıştırabilirsiniz. Ayrıca Vercel **Preview** üzerinde şu testleri mutlaka yapın:

1. Kod olmadan `https://.../api/quiz/questions` sayfası **401** dönmeli, sorular görünmemeli.
2. Yanlış 8 haneli kod reddedilmeli; art arda yanlış denemeler sınırlanmalı.
3. Doğru kodla giriş yapılıp yarışma açılmalı.
4. Şıkları başlangıçta gizle/göster ve takım puanı çalışmalı.
5. Çıkıştan sonra soru bankasına yeniden giriş olmadan erişilmemeli.
6. Ramazan Köşesi herkese açık kalmalı; yeni sorular görünmeli.

## 5. Güvenlik sınırları

- 8 haneli kodlar bir **erişim anahtarıdır**; öğretmen kodunu öğrenciye verirse erişim engellenemez.
- Kimliği doğrulanmış öğretmen tarayıcısına sorular ve cevaplar gönderilir; ekran görüntüsü / kopyalama tümüyle engellenemez.
- GitHub herkese açıksa geçmişte yayımlanmış `quiz-bank.js` soruları Git geçmişinden de okunabilir. Bunları artık **gizli** kabul etmeyin; yeni ve ayrı bir soru bankası oluşturun.
- Ortam değişkenlerinin yönetici erişimi olan Vercel kullanıcıları tarafından görülebileceğini unutmayın.
- Sunucu kaynaklarını kontrol etmeden `main` dalına yüklemeyin. Önce Preview aşamasında test edin.
