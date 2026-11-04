'use strict';
// Öğrenci bilgisi istemeyen, tarayıcıda çalışan özgün eğitsel oyun başlangıç sürümü.
const categories={visual:['🎨','Renk ve Görsel'],sound:['🔊','Ses ve Ritim'],logic:['🔢','Sayı ve Mantık'],ethics:['🤝','Dijital Etik'],code:['🧩','Kodlama'],country:['🇹🇷','Ülkemiz'],social:['🌍','Sosyal Bilgiler']};
const definitions=[
['robot-color','Robotu Renklendir','visual',1,'🤖','Robotun istediği rengi seç.'],
['same-diff','Aynı mı Farklı mı?','visual',1,'🔍','Görselleri karşılaştır.'],
['shape-box','Şekil Dedektifi','visual',1,'📦','Şekilleri doğru tanı.'],
['count','Nesneleri Say','visual',1,'🍎','Nesneleri dikkatle say.'],
['mix','Renk Laboratuvarı','visual',2,'🌈','Renkleri karıştır.'],
['animal','Hayvanı Dinle','sound',1,'🐶','Ses taklidinden hayvanı bul.'],
['instrument','Minik Müzisyen','sound',2,'🎹','Çalınan sesin çalgısını tanı.'],
['tempo','Ritmi Yakala','sound',1,'🥁','Ritmin hızını ayırt et.'],
['pattern','Örüntü Ustası','logic',1,'🔁','Sıradaki şekli bul.'],
['odd','Farklı Olanı Bul','logic',1,'🎯','Gruba uymayanı seç.'],
['order','Sayıları Sırala','logic',2,'📏','Sayıları büyükten küçüğe diz.'],
['pair','Sayı Eşleştir','logic',1,'🔗','Nesne sayısıyla rakamı eşleştir.'],
['weight','Hangisi Ağır?','logic',2,'⚖️','Terazi kefelerindeki ağırlıkları karşılaştır.'],
['decision','İyi Robot Kararları','ethics',1,'🤖','Doğru davranışı seç.'],
['truefalse','Dijital Doğru Yanlış','ethics',2,'✅','Güvenli davranışları ayırt et.'],
['help','Yardımcı Robot','ethics',1,'💛','Yardımsever kararlar ver.'],
['path','Robotun Rotası','code',2,'🧭','Komutlarla hedefe ilerle.'],
['steps','Algoritma Sırası','code',2,'📋','Adımları sıraya diz.'],
['loop','Tekrar Et Robot!','code',3,'🔄','Engelli yolda robotu komutlarla hedefe ulaştır.'] ];

// Ana sınıfındaki mevcut 19 oyun korunur; sınıf 1–4 için 20 yeni oyun.
const primaryDefinitions=[
['g1-syllable','Hece Avcısı','visual',1,'📚','Kelimelerin hece sayısını bul.'],
['g1-add','Toplama Treni','logic',1,'🚂','20 içinde toplama işlemleri yap.'],
['g1-sub','Çıkarma Bahçesi','logic',1,'🍏','20 içinde çıkarma işlemleri çöz.'],
['g1-time','Saat Kaç?','logic',1,'🕒','Akrep ve yelkovanı gösteren analog saatleri oku.'],
['g1-safe','Güvenli Yol','ethics',1,'🚦','Trafikte güvenli seçimler yap.'],
['g2-spelling','Doğru Yazım','visual',2,'✏️','Doğru yazılan kelimeyi bul.'],
['g2-multiply','Çarpım Şampiyonu','logic',2,'✖️','Çarpma işlemleriyle puan kazan.'],
['g2-money','Alışveriş Matematiği','logic',2,'🛒','Para üstünü ve toplam fiyatı hesapla.'],
['g2-pattern','Sayı Örüntüsü','logic',2,'🔢','Artan ve azalan dizileri tamamla.'],
['g2-nature','Doğayı Koruyorum','ethics',2,'🌱','Çevreyle ilgili doğru kararları seç.'],
['g3-meaning','Cümlede Anlam','visual',3,'📖','Okuduğun cümle hakkında çıkarım yap.'],
['g3-division','Bölme Dedektifi','logic',3,'➗','Eşit paylaşma problemleri çöz.'],
['g3-fractions','Kesir Pastanesi','logic',0,'🍰','Birim ve basit kesirleri tanı.'],
['g3-measure','Ölçü Ustası','logic',2,'📏','Metre, santimetre ve kilogramı kullan.'],
['g3-science','Bilim Kaşifi','ethics',3,'🔬','Madde, duyu ve doğa sorularını çöz.'],
['g4-proverb','Atasözü ve Deyim','visual',4,'💬','Sözlerin anlamını keşfet.'],
['g4-problems','Problem Maratonu','logic',4,'🧠','Çok adımlı işlemler yap.'],
['g4-fractions','Kesir Karşılaştırma','logic',4,'🥧','Kesirleri karşılaştır.'],
['g4-science','Fen Laboratuvarı','ethics',4,'⚡','Kuvvet, madde ve çevreyi keşfet.'],
['g4-algorithm','Kodlama Mantığı','code',4,'🤖','Döngüleri ve koşulları yorumla.']
];
// V6: her yeni oyun bağımsız, sınıf ve kategori seçimiyle filtrelenir.
const extraDefinitions=[
 ['g1-science-new','Duyularım ve Çevrem','visual',1,'👀','Duyu organlarını görsellerle eşleştir.'],
 ['g2-science-new','Maddeyi Tanıyorum','visual',2,'🧪','Maddeleri ve özelliklerini eşleştir.'],
 ['g1-country','Türkiye’yi Tanıyorum','country',1,'🇹🇷','Bayrağımızı ve başkentimizi keşfet.'],
 ['g2-country','Türkiye’nin Simgeleri','country',2,'🏛️','Doğal ve kültürel simgelerimizi öğren.'],
 ['g3-country','Türkiye’nin Coğrafyası','country',3,'🗺️','Denizleri, yönleri ve bölgeleri keşfet.'],
 ['g4-country','Türkiye Bilgi Yarışması','country',4,'🧭','Coğrafya, kültür ve tarih bilgilerini kullan.'],
 ['g4-flags','Ülke Bayrakları','social',4,'🏳️','Bayrakları ülke adlarıyla eşleştir.'],
 ['g4-capitals','Ülke Başkentleri','social',4,'🌐','Ülkelerle başkentlerini eşleştir.'],
 ['g4-turk-history','Türk Devletleri','social',4,'🏹','Tarihteki Türk devletlerini tanı.'],
 ['g4-turk-history-plus','Türk Devletleri · İleri Düzey','social',4,'📜','Meraklı öğrenciler için ortaokula hazırlık soruları.']
];
const questionBanks={
'g1-syllable':[['Kalem kelimesi kaç hecelidir?','✏️',['1','2','3','4'],'2'],['Araba kelimesi kaç hecelidir?','🚗',['1','2','3','4'],'3'],['Kuş kelimesi kaç hecelidir?','🐦',['1','2','3','4'],'1'],['Okul kelimesi kaç hecelidir?','🏫',['1','2','3','4'],'2'],['Papatya kelimesi kaç hecelidir?','🌼',['1','2','3','4'],'3'],['Kitaplık kelimesi kaç hecelidir?','📚',['1','2','3','4'],'3']],
'g1-safe':[['Yaya geçidinden geçmeden önce ne yapmalıyız?','🚶',['Sağa sola bakmalıyız','Koşarak geçmeliyiz','Telefonla oynamalıyız'],'Sağa sola bakmalıyız'],['Kırmızı trafik ışığında ne yaparız?','🚦',['Bekleriz','Koşarız','Karşıya geçeriz'],'Bekleriz'],['Araçta emniyet kemeri ne zaman takılır?','🚗',['Yolculuk boyunca','Sadece yağmurda','Yalnızca uzun yolda'],'Yolculuk boyunca'],['Kaldırım varsa nerede yürümeliyiz?','🛣️',['Kaldırımda','Yol ortasında','Bisiklet şeridinde'],'Kaldırımda'],['Okul servisine nasıl binmeliyiz?','🚌',['Araç tamamen durunca','Araç hareket ederken','Kapıya koşarak'],'Araç tamamen durunca']],
'g2-spelling':[['Hangi kelimenin yazımı doğrudur?','✍️',['Herkes','Herkez','Herkess'],'Herkes'],['Hangi kelimenin yazımı doğrudur?','✍️',['Yanlış','Yalnış','Yanlız'],'Yanlış'],['Hangi kelimenin yazımı doğrudur?','✍️',['Kirpik','Kiprik','Kirbik'],'Kirpik'],['Hangi kelimenin yazımı doğrudur?','✍️',['Sürpriz','Süpriz','Sürpüriz'],'Sürpriz'],['Hangi kelimenin yazımı doğrudur?','✍️',['Egzersiz','Eksersiz','Egzersis'],'Egzersiz']],
'g2-nature':[['Atık kâğıdı hangi kutuya atmalıyız?','♻️',['Kâğıt geri dönüşüm kutusuna','Pil kutusuna','Yere'],'Kâğıt geri dönüşüm kutusuna'],['Diş fırçalarken suyu nasıl kullanmalıyız?','💧',['Gerektiğinde açmalıyız','Sürekli açık bırakmalıyız','Suyu boşa akıtmalıyız'],'Gerektiğinde açmalıyız'],['Ormanda piknikten sonra ne yapmalıyız?','🌲',['Çöplerimizi toplamalıyız','Çöpleri bırakmalıyız','Plastikleri yakmalıyız'],'Çöplerimizi toplamalıyız'],['Bitkilerin yaşaması için hangisi önemlidir?','🌿',['Su ve ışık','Plastik atık','Duman'],'Su ve ışık'],['Kullanılmış pili nereye koymalıyız?','🔋',['Atık pil toplama kutusuna','Lavaboya','Toprağa'],'Atık pil toplama kutusuna']],
'g3-meaning':[['Ece şemsiyesini aldı çünkü hava kapalıydı. Ece ne bekliyor olabilir?','☁️',['Yağmur','Karne','Güneş tutulması'],'Yağmur'],['Mert kitabını her akşam okuyor. Bu cümleden ne çıkarılır?','📚',['Düzenli okuma alışkanlığı var','Kitaplarını kaybetti','Okumayı sevmiyor'],'Düzenli okuma alışkanlığı var'],['Ali yavaşça konuştu; bebek uyuyordu. Ali neden yavaş konuştu?','👶',['Bebeği uyandırmamak için','Şarkı söylemek için','Koşmak için'],'Bebeği uyandırmamak için'],['Zeynep çantasına matara koydu. En olası amacı nedir?','💧',['Susadığında su içmek','Kalemini silmek','Top oynamak'],'Susadığında su içmek'],['Öğrenciler fidanları suladı. Bu hangi davranıştır?','🌳',['Doğayı koruma','İsraf','Kirlilik'],'Doğayı koruma']],
'g3-science':[['Sesleri hangi duyu organımızla algılarız?','👂',['Kulak','Göz','Dil'],'Kulak'],['Hangisi doğal ışık kaynağıdır?','☀️',['Güneş','Ay','Ayna'],'Güneş'],['Mıknatıs en çok hangisini çeker?','🧲',['Demir ataş','Tahta kaşık','Plastik kap'],'Demir ataş'],['Hangisi gaz hâlindeki maddeye örnektir?','💨',['Hava','Taş','Buz'],'Hava'],['Bitkiler büyümek için hangisine ihtiyaç duyar?','🌿',['Su','Plastik','Duman'],'Su']],
'g4-proverb':[['“Damlaya damlaya göl olur.” atasözünün anlamı nedir?','💧',['Küçük birikimler zamanla büyür','Hep yağmur yağar','Göller küçülür'],'Küçük birikimler zamanla büyür'],['“Etekleri zil çalmak” deyimi ne demektir?','🔔',['Çok sevinmek','Çok yorulmak','Korkmak'],'Çok sevinmek'],['“Bir elin nesi var, iki elin sesi var.” neyi vurgular?','🤝',['İş birliğini','Yalnızlığı','Sessizliği'],'İş birliğini'],['“Kulak vermek” deyimi hangi anlamdadır?','👂',['Dikkatle dinlemek','Bağırmak','Uyumak'],'Dikkatle dinlemek'],['“Sakla samanı, gelir zamanı.” atasözü ne öğütler?','📦',['İşe yarayabilecek şeyleri korumayı','Her şeyi atmayı','Hiçbir şey kullanmamayı'],'İşe yarayabilecek şeyleri korumayı']],
'g4-science':[['Hangi durumda sürtünme genellikle artar?','🛞',['Pürüzlü yüzeyde','Çok kaygan yüzeyde','Havasız ortamda'],'Pürüzlü yüzeyde'],['Hangisi elektrik iletkenidir?','⚡',['Bakır tel','Plastik cetvel','Tahta kaşık'],'Bakır tel'],['Buz eridiğinde hangi hâle geçer?','🧊',['Sıvı','Gaz','Plazma'],'Sıvı'],['Pusula neyi bulmamıza yardımcı olur?','🧭',['Yön','Sıcaklık','Ağırlık'],'Yön'],['Hangi davranış enerji tasarrufu sağlar?','💡',['Gereksiz lambaları kapatmak','Işıkları tüm gün açık tutmak','Boş odada televizyonu açık bırakmak'],'Gereksiz lambaları kapatmak']],
'g4-algorithm':[['3 kez tekrarla: 2 adım ileri. Toplam kaç adım olur?','🤖',['4','6','8'],'6'],['“Eğer yağmur yağıyorsa şemsiye al.” ifadesi nedir?','☔',['Koşul','Rastgele sayı','Renk'],'Koşul'],['Robot 4 kez sağa bir adım atıyor. Toplam kaç adım atar?','➡️',['2','4','8'],'4'],['Hangi sıra bir algoritmadır?','🧩',['Başla → İşlem yap → Bitir','Bitir → Başla → İşlem yap','İşlem yap → Bitir → Başla'],'Başla → İşlem yap → Bitir'],['İki komut 5 kez tekrar edilirse toplam kaç komut çalışır?','🔁',['7','10','5'],'10']]
};

// V8: ilave, özenle yazılmış sabit soru havuzları (bir oyun turunda yine 5 soru gösterilir).
const additionalBanks={
 'g1-safe':[
 ['Bisiklet sürerken başımızı korumak için ne takarız?','🚲',['Kask','Şapka','Kulaklık'],'Kask'],
 ['Karşıya geçerken öncelikle hangi yeri kullanmalıyız?','🚶',['Yaya geçidi','Yolun ortası','Viraj'],'Yaya geçidi'],
 ['Otobüste ayakta dururken neye tutunuruz?','🚌',['Tutunma koluna','Pencereye','Kapı koluna'],'Tutunma koluna'],
 ['Yol kenarında oyun oynamak güvenli midir?','⚽',['Hayır','Evet','Her zaman'],'Hayır'],
 ['Okul servisinden indikten sonra nasıl davranmalıyız?','🚌',['Güvenli yaya yolunu kullanmalıyız','Aracın önünden koşmalıyız','Yola atlamalıyız'],'Güvenli yaya yolunu kullanmalıyız'],
 ['Yeşil yaya ışığı yanınca ne yapmalıyız?','🚦',['Yolu kontrol ederek geçmeliyiz','Gözümüzü kapatıp koşmalıyız','Trafiğe bakmamalıyız'],'Yolu kontrol ederek geçmeliyiz'],
 ['Araç hareket ederken camdan sarkmak doğru mudur?','🚗',['Hayır','Evet','Bazen'],'Hayır'],
 ['Yaya kaldırımında hangisine dikkat etmeliyiz?','🚶',['Çevremize ve yolumuza','Yalnızca telefona','Gökyüzüne'],'Çevremize ve yolumuza'],
 ['Trafik işaretlerinin amacı nedir?','🚸',['Güvenliği sağlamak','Oyun başlatmak','Yolu süslemek'],'Güvenliği sağlamak'],
 ['Yolda topumuz kaçarsa ne yapmalıyız?','⚽',['Yola koşmadan yetişkinden yardım istemeliyiz','Hemen peşinden koşmalıyız','Araçları durdurmalıyız'],'Yola koşmadan yetişkinden yardım istemeliyiz'],
 ['Bisikletle dönüş yaparken ne yapmalıyız?','🚲',['Çevreyi kontrol etmeliyiz','Gözümüzü kapatmalıyız','Hızlanmalıyız'],'Çevreyi kontrol etmeliyiz'],
 ['Araçta çocuklar nerede oturmalıdır?','🚗',['Yaş ve boyuna uygun güvenli koltukta','Sürücünün kucağında','Bagajda'],'Yaş ve boyuna uygun güvenli koltukta'],
 ['Gece yürürken görünürlüğü artıran nedir?','🌙',['Yansıtıcı kıyafet','Koyu renkte görünmez kıyafet','Gözleri kapatmak'],'Yansıtıcı kıyafet'],
 ['Yaya geçidine yaklaşan sürücü ne yapmalıdır?','🚙',['Yayalara dikkat edip gerekirse durmalıdır','Hızlanmalıdır','Korna çalıp geçmelidir'],'Yayalara dikkat edip gerekirse durmalıdır'],
 ['Yolculukta emniyet kemerini kimler takmalıdır?','🚗',['Tüm yolcular','Sadece sürücü','Yalnızca ön koltuktakiler'],'Tüm yolcular'],
 ['Trafik polisinin işaretlerine ne yapmalıyız?','👮',['Uymalıyız','Dikkat etmemeliyiz','Kendimiz karar vermeliyiz'],'Uymalıyız'],
 ['Servis beklerken nerede durmalıyız?','🚌',['Güvenli bekleme alanında','Yolun ortasında','Aracın arkasında'],'Güvenli bekleme alanında'],
 ['Karşıdan karşıya geçerken kulaklık sesini ne yapmalıyız?','🎧',['Çevreyi duyabileceğimiz kadar azaltmalıyız','Sonuna kadar açmalıyız','Trafiği dinlememeliyiz'],'Çevreyi duyabileceğimiz kadar azaltmalıyız'],
 ['Yaya ışığı kırmızı olduğunda ne yaparız?','🔴',['Bekleriz','Hızlanırız','Yola çıkarız'],'Bekleriz'],
 ['Oyun oynamak için en güvenli yer hangisidir?','🛝',['Oyun parkı','Araç yolu','Otopark giriş yolu'],'Oyun parkı']
 ],
 'g2-nature':[
 ['Cam şişeyi uygun şekilde nereye bırakmalıyız?','♻️',['Cam atık kutusuna','Yere','Dere yatağına'],'Cam atık kutusuna'],
 ['Ağaç dikmek çevreye nasıl katkı sağlar?','🌳',['Yeşil alanı artırır','Havayı kirletir','Suyu boşa harcar'],'Yeşil alanı artırır'],
 ['Gereksiz yanan ışığa ne yapmalıyız?','💡',['Kapatmalıyız','Açık bırakmalıyız','Bir ışık daha açmalıyız'],'Kapatmalıyız'],
 ['Tekrar kullanılabilen su şişesi neden iyidir?','🚰',['Atığı azaltır','Plastiği artırır','Suyu kirletir'],'Atığı azaltır'],
 ['Çöpleri yere atmak neden yanlıştır?','🗑️',['Çevreyi kirletir','Toprağı temizler','Ağaçları büyütür'],'Çevreyi kirletir'],
 ['Yağmur suyu birikintisinde yaşayan canlılara neden dikkat etmeliyiz?','🐸',['Yaşam alanları zarar görebilir','Her şey oyuncaktır','Önemli değildir'],'Yaşam alanları zarar görebilir'],
 ['Kullanılmayan musluğu ne yapmalıyız?','🚰',['Kapatmalıyız','Açık bırakmalıyız','Daha çok açmalıyız'],'Kapatmalıyız'],
 ['Kâğıdın iki yüzünü kullanmak neyi azaltır?','📄',['Kâğıt tüketimini','Ağaç sayısını','Güneş ışığını'],'Kâğıt tüketimini'],
 ['Doğada gördüğümüz yabani hayvanlara nasıl davranmalıyız?','🦔',['Uzaktan ve rahatsız etmeden izlemeliyiz','Kovalamalıyız','Yuvalarını bozmalıyız'],'Uzaktan ve rahatsız etmeden izlemeliyiz'],
 ['Parkta piknik sonrası ne yapmalıyız?','🌿',['Atıkları toplamalıyız','Çöpleri bırakmalıyız','Şişeleri kırmalıyız'],'Atıkları toplamalıyız'],
 ['Organik atıkların bazıları neye dönüştürülebilir?','🍌',['Kompost gübreye','Pil atığına','Cam şişeye'],'Kompost gübreye'],
 ['Arıtılmamış atık suyu nehre bırakmak doğru mudur?','🌊',['Hayır','Evet','Her zaman'],'Hayır'],
 ['Toplu taşıma kullanmak neyi azaltmaya yardımcı olabilir?','🚌',['Araç kaynaklı emisyonları','Hava kalitesini','Yeşil alanları'],'Araç kaynaklı emisyonları'],
 ['Kırılmış camı toplarken çocuk ne yapmalıdır?','🧤',['Bir yetişkinden yardım istemelidir','Çıplak elle tutmalıdır','Yere saçmalıdır'],'Bir yetişkinden yardım istemelidir'],
 ['Pili çöpe değil nereye atmalıyız?','🔋',['Atık pil toplama noktasına','Denize','Parkın toprağına'],'Atık pil toplama noktasına'],
 ['Ekmek israfını azaltmak için ne yapabiliriz?','🍞',['Yiyebileceğimiz kadar alabiliriz','İhtiyacımızdan çok alırız','Hepsini çöpe atarız'],'Yiyebileceğimiz kadar alabiliriz'],
 ['Hava kirliliğini azaltmak için hangisi yararlıdır?','🌍',['Yürümek ve bisiklete binmek','Çöp yakmak','Gereksiz araç kullanmak'],'Yürümek ve bisiklete binmek'],
 ['Su sızıntısı fark edersek ne yapmalıyız?','💧',['Bir yetişkine haber vermeliyiz','Görmezden gelmeliyiz','Musluğu daha çok açmalıyız'],'Bir yetişkine haber vermeliyiz'],
 ['Geri dönüşümün amacı nedir?','♻️',['Kaynakları yeniden değerlendirmek','Her şeyi yakmak','Atığı artırmak'],'Kaynakları yeniden değerlendirmek'],
 ['Çöpleri türlerine göre ayırmak ne sağlar?','🗂️',['Geri dönüşümü kolaylaştırır','Çevreyi kirletir','Su tüketimini artırır'],'Geri dönüşümü kolaylaştırır']
 ],
 'g4-algorithm':[
 ...Array.from({length:20},(_,i)=>{let repeats=2+i%5, steps=2+Math.floor(i/5);let total=repeats*steps;return [`Robot ${repeats} kez ${steps} adım ileri giderse toplam kaç adım ilerler?`,'🤖',[String(total-1),String(total),String(total+2)],String(total)]})
 ]
};
for(const [id,extra] of Object.entries(additionalBanks)){questionBanks[id]=[...questionBanks[id],...extra];}

function numericQ(prompt,correct,unit=''){
 const answer=String(correct)+unit;
 let distractors=[correct-2,correct-1,correct+1,correct+2,correct+3].filter(x=>x>=0&&x!==correct);
 return {prompt,visual:'🧮',options:shuffle([answer,...shuffle(distractors).slice(0,3).map(x=>String(x)+unit)]),answer};
}
function primaryQuestion(id){
 if(questionBanks[id]){let b=questionBanks[id][activeVariant % questionBanks[id].length];return {prompt:b[0],visual:b[1],options:b[2],answer:b[3]}}
 let a,b,c,n,den,step;
 switch(id){
 case 'g1-add': a=rand(11)+2;b=rand(20-a)+1;return {prompt:`Trene ${a} yolcu bindi. ${b} yolcu daha ekle. Toplamı nesneleri taşıyarak bul.`,visual:'',type:'counters',start:a,add:b,answer:String(a+b)};
 case 'g1-sub': a=rand(14)+6;b=rand(a)+1;return {prompt:`Bahçede ${a} elma vardı. ${b} elmayı sepete taşı. Kaç elma kaldı?`,visual:'',type:'subtract',start:a,remove:b,answer:String(a-b)};
 case 'g1-time': n=rand(12)+1;return {prompt:'Resimdeki saat kaçı gösteriyor?',visual:'',type:'clock',hour:n,minute:0,options:shuffle([`${n}:00`,`${n}:30`,`${(n%12)+1}:00`,`${n}:15`]),answer:`${n}:00`};
 case 'g2-multiply':a=rand(5)+2;b=rand(5)+2;return {prompt:`${a} sırada ${b} nesne var. Diziyi incele, çarpımı oluştur.`,visual:'',type:'array',rows:a,cols:b,answer:String(a*b)};
 case 'g2-money':a=rand(15)+5;b=rand(12)+3;return {prompt:`Alışveriş sepetini oluştur: ${a} TL + ${b} TL. Madeni paraları sürükleyerek veya dokunarak toplamı öde.`,visual:'',type:'money',answer:String(a+b),target:a+b};
 case 'g2-pattern':a=rand(15)+2;step=rand(5)+2;return {prompt:'Sayıları doğru sıraya koyarak örüntüyü tamamla.',visual:'',type:'numberPattern',numbers:[a,a+step,a+2*step,a+3*step],answer:String(a+3*step)};
 case 'g3-division':b=rand(3)+2;c=rand(4)+2;return {prompt:`${b*c} kalemi ${b} öğrenciye eşit paylaştır. Her birine kaç kalem düşer?`,visual:'',type:'divide',groups:b,per:c,total:b*c,answer:String(c)};
 case 'g3-fractions':den=sample([4,6,8]);n=rand(den)+1;return {prompt:`${den} eş parçadan ${n} tanesini boyamak için parçalara dokun veya renk kutusunu üzerlerine sürükle.`,visual:'',type:'fractions',parts:den,target:n,answer:String(n)};
 case 'g3-measure': a=rand(8)+1;return {prompt:`${a} metreyi santimetreye çevir. Cetvelde doğru değeri seç.`,visual:'',type:'measure',metres:a,answer:String(a*100)};
 case 'g4-problems': a=rand(20)+12;b=rand(8)+2;c=rand(8)+2;return {prompt:`Kütüphanede ${a} kitap vardı. ${b} kitap alındı, ${c} yeni kitap geldi. İki adımda sonucu bul.`,visual:'',type:'twoStep',initial:a,removed:b,added:c,answer:String(a-b+c)};
 case 'g4-fractions':den=sample([4,6,8,10]);a=rand(den-1)+1;b=rand(den-1)+1;if(a===b)b=b===den-1?b-1:b+1;return {prompt:'Boyalı kesir modellerini karşılaştır. Hangisi daha büyüktür?',visual:'',type:'fractionCompare',parts:den,left:a,right:b,options:[`${a}/${den}`,`${b}/${den}`],answer:`${Math.max(a,b)}/${den}`};
 }
 return {prompt:'Doğru seçeneği seç.',visual:'⭐',options:['Evet','Hayır'],answer:'Evet'};
}

const defaults=[...definitions.map(d=>({...{id:d[0],title:d[1],category:d[2],grade:({'order':1,'help':1,'decision':1,'steps':2}[d[0]]??0),emoji:d[4],desc:d[5],enabled:true}})),...primaryDefinitions.map(d=>({id:d[0],title:d[1],category:d[2],grade:d[3],emoji:d[4],desc:d[5],enabled:true})),...extraDefinitions.map(d=>({id:d[0],title:d[1],category:d[2],grade:d[3],emoji:d[4],desc:d[5],enabled:true}))];
// const defaults=definitions.map(d=>({id:d[0],title:d[1],category:d[2],grade:d[3],emoji:d[4],desc:d[5],enabled:true}));
const store=(key,val)=>localStorage.setItem('ismetpasa_'+key,JSON.stringify(val));
const load=(key,fallback)=>{try{return JSON.parse(localStorage.getItem('ismetpasa_'+key))??fallback}catch{return fallback}};
let catalog=load('catalog',defaults);if(!Array.isArray(catalog)) catalog=defaults;catalog=defaults.map(g=>{const old=catalog.find(x=>x.id===g.id)||{};return {...g,title:old.title??g.title,enabled:old.enabled??g.enabled};});
let questionQueues={};

// V8: Sorunun tam içeriğinin imzasını dikkate alan tekrar önleme.
// Aynı tarayıcıda saklanır. Bir havuz bittiğinde yeni bir döngü başlar.
const HISTORY_LIMIT=25;
let seenQuestions=load('seen_questions_v8',{});
let activeVariant=0;
let activeDeckSize=25;
let decks={};
function smartPickIndex(id,poolSize=25,limit=HISTORY_LIMIT){
 const max=Math.min(limit,poolSize);if(max<=0)return 0;
 let seen=Array.isArray(seenQuestions[id])?seenQuestions[id].filter(x=>Number.isInteger(x)&&x>=0&&x<max):[];
 let fresh=Array.from({length:max},(_,i)=>i).filter(i=>!seen.includes(i));
 if(!fresh.length){seen=[];fresh=Array.from({length:max},(_,i)=>i);}
 const pick=fresh[Math.floor(Math.random()*fresh.length)];seen.push(pick);
 seenQuestions[id]=seen;store('seen_questions_v8',seenQuestions);activeVariant=pick;activeDeckSize=max;
 return pick;
}
function seeded(seed){let x=(seed>>>0)||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;}}
function questionFingerprint(q){return JSON.stringify(q,(key,val)=>key==='sound'?undefined:val)}
function getDeck(id){
 if(decks[id])return decks[id];
 const output=[],known=new Set();
 for(let seed=0;seed<500&&output.length<HISTORY_LIMIT;seed++){
  const q=deterministicQuestion(id,seed);
  const sig=questionFingerprint(q);
  if(!known.has(sig)){known.add(sig);output.push(q);}
 }
 decks[id]=output;return output;
}
const scenarioLabels={"robot-color": ["Robotun boyasını seç", "Robotun şapkasını boya", "Robotun ayakkabısını boya", "Robotun çantasını boya", "Robotun antenini boya"], "same-diff": ["Şekil kartları", "Oyuncak kutuları", "Sınıf panosu", "Bulmaca kartları", "Resim defteri"], "shape-box": ["Geometri avı", "Sınıf panosu", "Şekil kartı", "Robot çizimi", "Boyama sayfası"], "count": ["Bahçedeki nesneler", "Sınıftaki nesneler", "Parktaki nesneler", "Pazardaki nesneler", "Oyun alanı"], "mix": ["Resim atölyesi", "Renk fabrikası", "Ressamın paleti", "Robotun boya seti", "Sanat masası"], "animal": ["Çiftlikteki ses", "Ormandaki ses", "Hayvanat bahçesindeki ses", "Masal kahramanının sesi", "Bahçedeki ses"], "instrument": ["Okul konseri", "Müzik atölyesi", "Orkestra", "Konser provası", "Müzik sınıfı"], "tempo": ["Müzik dersindeki ritim", "Robotun ritmi", "Davul çalışması", "Yürüyüş ritmi", "Alkış ritmi"], "pattern": ["Oyuncak örüntüsü", "Şekil yolu", "Renkli zincir", "Sınıf süslemesi", "Robot şifresi"], "odd": ["Karışık şekiller", "Oyuncak kartları", "Şekil avı", "Sınıf panosu", "Görsel dikkat"], "order": ["Sayı treni", "Sayı kartları", "Sayı merdiveni", "Uzay sayıları", "Sınıf yarışması"], "pair": ["Çiçek bahçesi", "Çiçek pazarı", "Parktaki çiçekler", "Saksıdaki çiçekler", "Çiçek sergisi"], "weight": ["Terazi tahmini", "Pazar terazisi", "Denge deneyi", "Ağırlık oyunu", "Fen köşesi"], "decision": ["Sınıfta", "Bahçede", "Okul yolunda", "Evde", "Oyun alanında"], "truefalse": ["İnternet güvenliği", "Dijital vatandaşlık", "Sosyal paylaşım", "Dijital iz", "Güvenli oyun"], "help": ["Okulda", "Parkta", "Evde", "Kütüphanede", "Bahçede"], "path": ["Robot labirenti A", "Robot labirenti B", "Robot labirenti C", "Robot labirenti D", "Robot labirenti E"], "steps": ["Fidan dikme planı", "Bahçe çalışması", "Okul bahçesi", "Doğa etkinliği", "Fidan günü"], "loop": ["Kodlama parkuru A", "Kodlama parkuru B", "Kodlama parkuru C", "Kodlama parkuru D", "Kodlama parkuru E"]};
function deterministicQuestion(id,variant){
 let hash=2166136261;for(const ch of id){hash=Math.imul(hash^ch.charCodeAt(0),16777619);}
 const original=Math.random;Math.random=seeded((hash^Math.imul(variant+1,2654435761))>>>0);
 try {
   const q=originalMakeQ(id);
   // Combine distinct instructional contexts with the deterministic game state.
   if(scenarioLabels[id])q.prompt=scenarioLabels[id][Math.floor(variant/5)%5]+' — '+q.prompt;
   return q;
 } finally {Math.random=original;}
}

let progress=load('progress',{}),page=(location.hash==='#hakkinda'?'about':'home'),selected=null,round=0,score=0,blocked=false,current=null,sequence=[],position=0,gradeFilter='all',categoryFilter='all';
const app=document.getElementById('app');const el=(html)=>{app.innerHTML=html};const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const rand=n=>Math.floor(Math.random()*n);const sample=a=>a[rand(a.length)];const shuffle=a=>[...a].sort(()=>Math.random()-.5);const btn=(text,fn,cls='primary')=>`<button class="${cls}" onclick="${fn}">${text}</button>`;
function route(p){page=p;selected=null;const hash=p==='about'?'#hakkinda':'';if(location.hash!==hash)history.replaceState(null,'',location.pathname+location.search+hash);render();window.scrollTo(0,0)}document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>route(b.dataset.page)));window.addEventListener('hashchange',()=>{page=location.hash==='#hakkinda'?'about':'home';selected=null;render();});
function openFiltered(grade,category){gradeFilter=String(grade);categoryFilter=category;route('games')}
function categoryCount(id){return catalog.filter(g=>g.enabled&&g.category===id).length}
function render(){document.querySelectorAll('nav [data-page]').forEach(b=>{const active=b.dataset.page===page;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});if(page==='home')home();if(page==='games')games();if(page==='brain')Brain.list();if(page==='ramadan')Ramadan.landing();if(page==='quiz')Quiz.landing();if(page==='badges')badges();if(page==='info')info();if(page==='about')about();if(page==='play')play()}
function home(){
  const played=Object.keys(progress).filter(k=>progress[k]?.wins>0).length;
  const educational=catalog.filter(g=>g.enabled).length;
  const subjects=[
    ['logic','➕','Matematik ve Mantık','Sayılarla düşün, problem çöz.','peach'],
    ['visual','🎨','Renk ve Görsel','Görsel dikkatini geliştir.','lilac'],
    ['sound','🎵','Ses ve Ritim','Dinle, ayırt et, keşfet.','sky'],
    ['country','🇹🇷','Ülkemiz','Türkiye’yi daha yakından tanı.','mint'],
    ['social','🌍','Sosyal Bilgiler','Dünyayı ve tarihimizi keşfet.','lavender'],
    ['code','🧩','Kodlama','Algoritmalarla düşün.','lemon'],
    ['ethics','🤝','Dijital Etik','Güvenli ve iyi kararlar ver.','coral']
  ];
  el(`<div class="v12-home">
    <section class="v12-hero" aria-labelledby="hero-title">
      <div class="v12-hero-copy">
        <span class="v12-kicker"><span class="v12-kicker-dot"></span> ATIŞALANI İSMETPAŞA İLKOKULU</span>
        <h1 id="hero-title">Oyunla keşfet.<br><em>Merakla büyü!</em></h1>
        <p>Her sınıfa özel eğitici oyunlar, akıl-zekâ etkinlikleri ve keşfedilecek yepyeni bilgiler. Öğrenmenin en eğlenceli hâline hoş geldin!</p>
        <div class="v12-hero-actions">
          <button class="v12-btn v12-btn-accent" onclick="openFiltered('all','all')">🎮 Oyunları keşfet <span aria-hidden="true">↗</span></button>
          <button class="v12-btn v12-btn-ghost" onclick="route('brain')">♟️ Akıl-Zekâ Oyunları</button>
        </div>
        <div class="v12-hero-numbers"><span><b>${educational+11}</b> toplam oyun</span><i></i><span><b>5</b> sınıf düzeyi</span><i></i><span><b>${played}</b> tamamlanan oyun</span></div>
      </div>
      <div class="v12-hero-graphic" aria-hidden="true">
        <div class="v12-orbit v12-orbit-one"></div><div class="v12-orbit v12-orbit-two"></div>
        <div class="v12-float v12-float-star">⭐</div>
        <div class="v12-float v12-float-book">📚</div>
        <div class="v12-float v12-float-rocket">🚀</div>
        <div class="v12-main-illustration"><div class="v12-screen-top"><span></span><span></span><span></span></div><div class="v12-screen-face">🧠<span>+</span>🎮</div><div class="v12-screen-bottom"><span>● ● ●</span><span>✦</span></div></div>
        <div class="v12-illustration-pill">✨ Haydi, birlikte öğrenelim!</div>
      </div>
    </section>
    <section class="v12-section v12-grade-section" aria-labelledby="grade-title">
      <div class="v12-section-heading"><div><span class="v12-eyebrow">İLK ADIM</span><h2 id="grade-title">Hangi sınıftasın?</h2><p>Sınıfını seç, tam sana uygun oyunları bul.</p></div><button class="v12-text-link" onclick="openFiltered('all','all')">Tüm oyunlar <span aria-hidden="true">↗</span></button></div>
      <div class="v12-grades">
        <button class="v12-grade v12-grade-0" onclick="openFiltered(0,'all')"><span class="v12-grade-icon">🧸</span><span class="v12-grade-name">Ana sınıfı</span><span class="v12-grade-link">Oyunları aç ↗</span></button>
        ${[1,2,3,4].map(n=>`<button class="v12-grade v12-grade-${n}" onclick="openFiltered(${n},'all')"><span class="v12-grade-icon">${['','✏️','📗','📘','🎓'][n]}</span><span class="v12-grade-name">${n}. sınıf</span><span class="v12-grade-link">Oyunları aç ↗</span></button>`).join('')}
      </div>
    </section>
    <section class="v12-section" aria-labelledby="subject-title">
      <div class="v12-section-heading"><div><span class="v12-eyebrow">KEŞİF ALANLARI</span><h2 id="subject-title">Oyun dünyasını keşfet</h2><p>İlgini çeken konuyu seç, yeni bir maceraya başla.</p></div><span class="v12-bubble-label">9 öğrenme alanı</span></div>
      <div class="v12-subjects">
        ${subjects.map(([id,ico,name,description,color])=>`<button class="v12-subject v12-tone-${color}" onclick="openFiltered('all','${id}')"><span class="v12-subject-icon">${ico}</span><span class="v12-subject-title">${name}</span><span class="v12-subject-desc">${description}</span><span class="v12-subject-bottom">${categoryCount(id)} oyun <b>↗</b></span></button>`).join('')}
        <button class="v12-subject v12-subject-ramadan" onclick="route('ramadan')"><span class="v12-subject-icon">🌙</span><span class="v12-subject-title">Ramazan Köşesi</span><span class="v12-subject-desc">Ramazan, değerler ve dinî kültür.</span><span class="v12-subject-bottom">500 soru <b>↗</b></span></button><button class="v12-subject v12-subject-quiz" onclick="route('quiz')"><span class="v12-subject-icon">🏆</span><span class="v12-subject-title">Bilgi Yarışması</span><span class="v12-subject-desc">Öğretmenler için takımlı sınıf yarışması.</span><span class="v12-subject-bottom">Takımlar · Puan · Süre <b>↗</b></span></button><button class="v12-subject v12-subject-brain" onclick="route('brain')"><span class="v12-subject-icon">♟️</span><span class="v12-subject-title">Akıl-Zekâ</span><span class="v12-subject-desc">Satranç, dama ve daha fazlası.</span><span class="v12-subject-bottom">12 strateji ve mantık oyunu <b>↗</b></span></button>
      </div>
    </section>
    <section class="v12-callout"><div class="v12-callout-icon">🏆</div><div><span class="v12-eyebrow">HER ADIM BİR BAŞARI</span><h2>Oyna, öğren, rozet kazan!</h2><p>Oyunları tamamlayarak başarı rozetlerini aç. Gelişimini bu cihazda takip et.</p></div><button class="v12-btn v12-btn-dark" onclick="route('badges')">Rozetlerim ↗</button></section>
  </div>`);
}
function games(){
  let filtered=catalog.filter(g=>g.enabled&&(categoryFilter==='all'||g.category===categoryFilter)&&(gradeFilter==='all'||g.grade===Number(gradeFilter)));
  el(`<section class="v12-library-head"><span class="v12-eyebrow">OYUN KÜTÜPHANESİ</span><h1>Senin oyun alanın 🎮</h1><p>Sınıfını ve istediğin konuyu seç. Kartların üzerine dokunarak oynamaya başlayabilirsin.</p></section>
    <div class="v12-library-filters"><label>Sınıf düzeyi<select aria-label="Sınıf düzeyi" onchange="gradeFilter=this.value;render()"><option value="all" ${gradeFilter==='all'?'selected':''}>Tüm sınıflar</option><option value="0" ${gradeFilter==='0'?'selected':''}>Ana sınıfı</option>${[1,2,3,4].map(n=>`<option ${gradeFilter==n?'selected':''} value="${n}">${n}. sınıf</option>`).join('')}</select></label>
    <label>Kategori<select aria-label="Kategori" onchange="categoryFilter=this.value;render()"><option value="all">Tüm kategoriler</option>${Object.entries(categories).map(([k,v])=>`<option value="${k}" ${categoryFilter===k?'selected':''}>${v[1]}</option>`).join('')}</select></label>
    <label class="v12-search-label">Oyun ara<input type="search" aria-label="Oyun ara" placeholder="Oyun adı veya konu..." oninput="filterLibrary(this.value)"></label></div>
    <div class="v12-library-result" id="library-result">${filtered.length} oyun bulundu</div>
    <div class="cards v12-game-cards">${filtered.map(g=>`<button class="card v12-game-card" data-search="${esc((g.title+' '+g.desc).toLocaleLowerCase('tr-TR'))}" onclick="start('${g.id}')"><span class="v12-game-emoji">${g.emoji}</span><span class="v12-game-grade">${g.grade===0?'Ana sınıfı':g.grade+'. sınıf'}</span><h3>${esc(g.title)}</h3><p>${esc(g.desc)}</p><span class="v12-game-play">Oynamaya başla <span aria-hidden="true">↗</span></span>${progress[g.id]?.wins?'<span class="v12-won">🏅 Tamamlandı</span>':''}</button>`).join('')}</div>
    <p id="library-empty" class="v12-empty" ${filtered.length?'hidden':''}>Bu seçimde oyun bulunamadı. Başka bir sınıf veya kategori seçebilirsin.</p>`)
}
function filterLibrary(value){
 const needle=value.toLocaleLowerCase('tr-TR').trim();let count=0;
 document.querySelectorAll('.v12-game-card').forEach(card=>{const show=card.dataset.search.includes(needle);card.hidden=!show;if(show)count++});
 document.getElementById('library-result').textContent=count+' oyun bulundu';
 document.getElementById('library-empty').hidden=count!==0;
}
function start(id){selected=catalog.find(g=>g.id===id);round=0;score=0;blocked=false;position=0;sequence=[];page='play';questionQueues[id]=[];nextQuestion()}
function originalMakeQ(id){if(id.startsWith('g1-')||id.startsWith('g2-')||id.startsWith('g3-')||id.startsWith('g4-'))return primaryQuestion(id);let shapes=['🔵','🟩','🔺','⭐','❤️','🌙'],animals=[['🐶','hav hav'],['🐱','miyav'],['🐮','möö'],['🐑','mee']],colors=[['Kırmızı','🔴'],['Mavi','🔵'],['Sarı','🟡'],['Yeşil','🟢']],a,b,n;
const q=(prompt,visual,options,answer,extra={})=>({prompt,visual,options,answer,...extra});
switch(id){
case 'robot-color': a=sample(colors);return q(`Robot ${a[0].toLocaleLowerCase('tr-TR')} renk istiyor!`,'🤖',colors.map(x=>x[1]),a[1]);
case 'same-diff':a=sample(shapes);b=Math.random()<.5?a:sample(shapes.filter(x=>x!==a));return q('İki şekil aynı mı?',a+'   '+b,['Aynı','Farklı'],a===b?'Aynı':'Farklı');
case 'shape-box':a=sample([['🔴','Daire'],['🔺','Üçgen'],['🟦','Kare'],['⭐','Yıldız']]);return q('Bu şeklin adı nedir?',a[0],['Daire','Üçgen','Kare','Yıldız'],a[1]);
case 'count':n=rand(5)+2;a=sample(['🍎','⭐','🐟','🌸']);return q('Kaç tane nesne var?',Array(n).fill(a).join(' '),[2,3,4,5,6,7].map(String),String(n));
case 'mix':a=sample([['🔴 + 🟡','Turuncu'],['🔵 + 🟡','Yeşil'],['🔴 + 🔵','Mor']]);return q('Bu iki boya karışınca hangi renk oluşur?',a[0],['Turuncu','Yeşil','Mor'],a[1]);
case 'animal':a=sample(animals);return q('Ses taklidini dinle ve hayvanı seç.','🔊',animals.map(x=>x[0]),a[0],{sound:()=>say(a[1])});
case 'instrument':a=sample([['Piyano',0],['Davul',1],['Flüt',2]]);return q('Kısa melodiyi dinle. Hangi çalgı taklit ediliyor?','🎼',['Piyano','Davul','Flüt'],a[0],{sound:()=>instrument(a[1])});
case 'tempo':a=sample(['Hızlı','Yavaş']);return q('Vuruşları dinle. Ritim nasıl?','🥁',['Hızlı','Yavaş'],a,{sound:()=>tempo(a==='Hızlı')});
case 'pattern':a=sample(shapes);b=sample(shapes.filter(x=>x!==a));return q('Örüntüde sıradaki hangisi?',`${a} ${b} ${a} ${b} ${a} ?`,[a,b,...shapes.filter(x=>x!==a&&x!==b).slice(0,2)],b);
case 'odd':a=sample(shapes);b=sample(shapes.filter(x=>x!==a));return q('Hangisi diğerlerinden farklı?',`${a} ${a} ${b} ${a}`,[a,b],b);
case 'order':a=shuffle([rand(7)+2,rand(7)+10,rand(7)+20]);return q('Büyükten küçüğe doğru sıra hangisi?',a.join('  •  '),shuffle([a.slice().sort((x,y)=>y-x).join(' > '),a.slice().sort((x,y)=>x-y).join(' < '),a.join(' - ')]),a.slice().sort((x,y)=>y-x).join(' > '));
case 'pair':n=rand(5)+2;return q('Bu çiçekler hangi sayıyla eşleşir?',Array(n).fill('🌼').join(' '),[2,3,4,5,6,7].map(String),String(n));
case 'weight':a=rand(8)+1;b=rand(8)+1;return q('Terazide hangi kefe daha ağır?', '', ['Sol','Sağ','Eşit'],a>b?'Sol':a<b?'Sağ':'Eşit',{type:'scale',left:a,right:b});
case 'decision':a=sample([['Robot yerde çöp buldu. Ne yapmalı?','Çöpe atmalı',['Çöpe atmalı','Yere bırakmalı','Saklamalı']],['Bir arkadaş üzgün. Robot ne yapmalı?','Yardım teklif etmeli',['Alay etmeli','Yardım teklif etmeli','Görmezden gelmeli']],['Robot birinin eşyasını buldu. Ne yapmalı?','Sahibine ulaştırmalı',['Sahibine ulaştırmalı','Kendine almalı','Atmalı']]]);return q(a[0],'🤖',a[2],a[1]);
case 'truefalse':a=sample([['İnternette tanımadığım kişiye adresimi vermemeliyim.','Doğru'],['Arkadaşımın fotoğrafını izin almadan paylaşabilirim.','Yanlış'],['Şifremi başkalarıyla paylaşmamalıyım.','Doğru'],['İnternette gördüğüm her bilgi mutlaka doğrudur.','Yanlış']]);return q(a[0],'🔐',['Doğru','Yanlış'],a[1]);
case 'help':a=sample([['Robot yaşlı bir kişinin çantasını taşımak için ne yapmalı?','Önce izin istemeli',['Önce izin istemeli','Çantayı çekip almalı']],['Bir arkadaş oyunun kurallarını anlamadı. Ne yapmalıyız?','Sakinlikle anlatmalıyız',['Sakinlikle anlatmalıyız','Oyun dışına çıkarmalıyız']],['Robot küçük bir çocuğun kaybolduğunu görüyor. Ne yapmalı?','Güvenilir bir yetişkinden yardım istemeli',['Görmezden gelmeli','Güvenilir bir yetişkinden yardım istemeli']]]);return q(a[0],'💛',a[2],a[1]);
case 'path':return q('Robotu yıldızın olduğu kareye götür. Okları sırayla seç.','',[],null,{type:'path'});
case 'steps':return q('Bir fidan dikmenin adımlarını doğru sıraya koy.','🌱',[],null,{type:'steps'});
case 'loop':return q('Robotu engellerden geçirerek yıldızlara ulaştır. Komutları sıralayıp robotu çalıştır.','',[],null,{type:'loopgrid'});
}}
// Eşleştirme motoru: fareyle sürükleme ve telefonda iki dokunuşla oynama.
const richBanks={
'g1-syllable':[
 [['At','1 hece'],['Kalem','2 hece'],['Araba','3 hece']],
 [['Kuş','1 hece'],['Okul','2 hece'],['Papatya','3 hece']],
 [['Gül','1 hece'],['Masa','2 hece'],['Bilgisayar','4 hece']]
],
'g2-spelling':[
 [['herkez','herkes'],['yalnış','yanlış'],['kiprik','kirpik']],
 [['süpriz','sürpriz'],['eksersiz','egzersiz'],['herkez','herkes']],
 [['yalnış','yanlış'],['kiprik','kirpik'],['süpriz','sürpriz']]
],
'g3-meaning':[
 [['Yağmur yağdı.','Neden'],['Şemsiyesini açtı.','Sonuç'],['Hava bulutlu.','Gözlem']],
 [['Çünkü','Neden bildirir'],['Bu yüzden','Sonuç bildirir'],['Ama','Karşıtlık bildirir']],
 [['Gözlem','Doğrudan görülen'],['Tahmin','Olabilir diye düşünülen'],['Duygu','Hissedilen']]
],
'g4-proverb':[
 [['Damlaya damlaya göl olur.','Birikim'],['Bir elin nesi var, iki elin sesi var.','İş birliği'],['Sakla samanı, gelir zamanı.','Tutumluluk']],
 [['Etekleri zil çalmak','Çok sevinmek'],['Kulak vermek','Dikkatle dinlemek'],['Göz kulak olmak','Korumak, gözetmek']]
],
'g1-science-new':[
 [['👀 Göz','Görme'],['👂 Kulak','İşitme'],['👃 Burun','Koklama']],
 [['👅 Dil','Tatma'],['✋ Deri','Dokunma'],['👂 Kulak','İşitme']],
 [['🌞 Güneş','Işık'],['🌧️ Yağmur','Su'],['🌱 Fidan','Bitki']]
],
'g2-science-new':[
 [['🧊 Buz','Katı'],['💧 Su','Sıvı'],['💨 Hava','Gaz']],
 [['🪵 Tahta','Doğal malzeme'],['🧴 Plastik','İşlenmiş malzeme'],['🥛 Süt','Sıvı']],
 [['🪨 Taş','Sert'],['🧽 Sünger','Yumuşak'],['🪟 Cam','Saydam']]
],
'g3-science':[
 [['☀️ Güneş','Doğal ışık'],['🔦 El feneri','Yapay ışık'],['🌙 Ay','Işığı yansıtır']],
 [['🧲 Mıknatıs','Demiri çeker'],['👂 Kulak','Sesi algılar'],['👀 Göz','Işığı algılar']]
],
'g4-science':[
 [['🧊 Buz','Erirse sıvı olur'],['💧 Su','Donarsa katı olur'],['💨 Su buharı','Yoğuşursa sıvı olur']],
 [['🔌 Bakır','İletken'],['📏 Plastik','Yalıtkan'],['🧭 Pusula','Yön bulma']]
],
'g1-country':[[["🇹🇷 Bayrağımız", "Ay ve yıldız"], ["🗣️ Resmî dil", "Türkçe"], ["🎵 İstiklâl Marşı", "Millî marşımız"]], [["🌹 Isparta", "Gül"], ["⛴️ İstanbul", "Boğaz"], ["🍊 Antalya", "Portakal"]], [["🫖 Rize", "Çay"], ["🍇 Manisa", "Üzüm"], ["🍒 Giresun", "Kiraz"]], [["🥜 Gaziantep", "Antep fıstığı"], ["🧀 Kars", "Kaşar peyniri"], ["🍑 Malatya", "Kayısı"]], [["🌲 Orman", "Ağaçlarla kaplı alan"], ["🌊 Deniz", "Tuzlu su kütlesi"], ["⛰️ Dağ", "Yüksek yeryüzü şekli"]]],
'g2-country':[[["🏛️ Anıtkabir", "Ankara"], ["🎈 Peribacaları", "Kapadokya"], ["♨️ Pamukkale", "Denizli"]], [["🧱 Truva Antik Kenti", "Çanakkale"], ["🏔️ Uludağ", "Bursa"], ["🏰 Sümela Manastırı", "Trabzon"]], [["🕌 Selimiye Camii", "Edirne"], ["🏛️ Efes Antik Kenti", "İzmir"], ["🏞️ Uzungöl", "Trabzon"]], [["🏰 İshak Paşa Sarayı", "Ağrı"], ["🧱 Göbeklitepe", "Şanlıurfa"], ["🌊 Düden Şelalesi", "Antalya"]], [["🪨 Nemrut Dağı heykelleri", "Adıyaman"], ["🎨 Zeugma Mozaik Müzesi", "Gaziantep"], ["🏘️ Safranbolu Evleri", "Karabük"]]],
'g3-country':[[["🌊 Karadeniz", "Kuzey"], ["🌊 Akdeniz", "Güney"], ["🌊 Ege Denizi", "Batı"]], [["🧭 Doğu", "Güneşin doğduğu yön"], ["🧭 Batı", "Güneşin battığı yön"], ["🧭 Kuzey", "Haritanın üstü"]], [["🌊 Marmara Denizi", "İç deniz"], ["⛰️ Toros Dağları", "Güney Anadolu"], ["🏞️ Tuz Gölü", "İç Anadolu"]], [["🌳 Karadeniz Bölgesi", "Bol yağış"], ["🌾 İç Anadolu Bölgesi", "Bozkır"], ["🍊 Akdeniz Bölgesi", "Turunçgil"]], [["🌅 Gün doğumu", "Doğu yönü"], ["🌇 Gün batımı", "Batı yönü"], ["🗺️ Türkiye", "Asya ve Avrupa arasında"]]],
'g4-country':[[["🌊 Van Gölü", "Türkiye’nin en büyük gölü"], ["🌉 İstanbul", "İki kıtada yer alır"], ["⛰️ Ağrı Dağı", "Türkiye’nin en yüksek dağı"]], [["🎈 Nevşehir", "Kapadokya"], ["♨️ Denizli", "Pamukkale"], ["🌧️ Rize", "Karadeniz Bölgesi"]], [["🏔️ Toros Dağları", "Akdeniz Bölgesi"], ["🌾 Konya Ovası", "İç Anadolu"], ["🏝️ Gökçeada", "Çanakkale"]], [["🏞️ Fırat Nehri", "Doğu Anadolu’dan doğar"], ["🏜️ Harran Ovası", "Şanlıurfa"], ["🌊 Sakarya Nehri", "Karadeniz’e dökülür"]], [["🏛️ Efes", "İzmir"], ["🧱 Göbeklitepe", "Şanlıurfa"], ["🏘️ Safranbolu", "Karabük"]]],
'g4-flags':[[["🇹🇷", "Türkiye"], ["🇦🇿", "Azerbaycan"], ["🇯🇵", "Japonya"]], [["🇫🇷", "Fransa"], ["🇩🇪", "Almanya"], ["🇮🇹", "İtalya"]], [["🇬🇧", "Birleşik Krallık"], ["🇧🇷", "Brezilya"], ["🇨🇦", "Kanada"]], [["🇰🇿", "Kazakistan"], ["🇰🇬", "Kırgızistan"], ["🇺🇿", "Özbekistan"]], [["🇹🇲", "Türkmenistan"], ["🇺🇸", "Amerika Birleşik Devletleri"], ["🇮🇳", "Hindistan"]]],
'g4-capitals':[
 [['Türkiye','Ankara'],['Azerbaycan','Bakü'],['Japonya','Tokyo']],
 [['Fransa','Paris'],['Almanya','Berlin'],['İtalya','Roma']],
 [['Birleşik Krallık','Londra'],['Kazakistan','Astana'],['Özbekistan','Taşkent']],
 [['Kırgızistan','Bişkek'],['Türkmenistan','Aşkabat'],['Türkiye','Ankara']],
 [['Brezilya','Brasília'],['Kanada','Ottawa'],['Gürcistan','Tiflis']]
],
'g4-turk-history':[[["Asya Hun Devleti", "Bilinen ilk Türk devleti"], ["Göktürk Devleti", "Türk adını kullanan ilk devlet"], ["Uygur Kağanlığı", "Yerleşik yaşama önem verdi"]], [["Mete Han", "Asya Hun hükümdarı"], ["Bumin Kağan", "I. Göktürk kurucusu"], ["Bilge Kağan", "II. Göktürk hükümdarı"]], [["Karahanlılar", "Türk-İslam devleti"], ["Büyük Selçuklu Devleti", "1040 Dandanakan Savaşı"], ["Osmanlı Devleti", "1299 geleneksel kuruluş yılı"]], [["Orhun Yazıtları", "Göktürk dönemi"], ["İpek Yolu", "Tarihî ticaret yolu"], ["Kut anlayışı", "Hükümdarlık yetkisine dair inanç"]], [["Kül Tigin", "Göktürk komutanı"], ["Tonyukuk", "Göktürk devlet adamı"], ["Alp Arslan", "Malazgirt Zaferi"]]],
'g4-turk-history-plus':[[["552", "I. Göktürk kuruluşu"], ["745", "II. Göktürk egemenliğinin sonu"], ["840", "Uygur Kağanlığı egemenliğinin sonu"]], [["Kutluk (İlteriş) Kağan", "II. Göktürk kuruluşu"], ["Tonyukuk", "Göktürk devlet adamı"], ["Kül Tigin", "Orhun Yazıtları"]], [["Orhun Yazıtları", "Eski Türk yazısı"], ["Bumin Kağan", "I. Göktürk Devleti"], ["Mete Han", "Asya Hun Devleti"]], [["751 Talas Savaşı", "Abbâsîler ve Tang Çin’i"], ["1040 Dandanakan", "Büyük Selçuklu kuruluşu"], ["1071 Malazgirt", "Anadolu’ya Türk yerleşimi için dönüm noktası"]], [["Satuk Buğra Han", "Karahanlı hükümdarı"], ["Tuğrul Bey", "Büyük Selçuklu kurucusu"], ["Osman Gazi", "Osmanlı hanedanı kurucusu"]]]
};
function enrichedQuestion(id){
 if(!richBanks[id])return null;
 const pool=richBanks[id].flat();
 // Do not pair the same left or right twice in one three-card activity.
 const combos=[];
 for(let a=0;a<pool.length;a++)for(let b=a+1;b<pool.length;b++)for(let c=b+1;c<pool.length;c++){
  const set=[pool[a],pool[b],pool[c]];
  if(new Set(set.map(x=>x[0])).size!==3||new Set(set.map(x=>x[1])).size!==3)continue;
  combos.push(set);
 }
 const idx=smartPickIndex(id,combos.length,25);
 return {type:'pairMatch',prompt:(id==='g4-turk-history-plus'?'İleri düzey: ':'')+'Soldaki kartlarla sağdaki doğru bilgileri eşleştir.',visual:'',pairs:combos[idx]};
}
const flagCodes={'🇹🇷':'tr','🇦🇿':'az','🇯🇵':'jp','🇫🇷':'fr','🇩🇪':'de','🇮🇹':'it','🇬🇧':'gb','🇧🇷':'br','🇨🇦':'ca','🇰🇿':'kz','🇰🇬':'kg','🇺🇿':'uz','🇹🇲':'tm','🇺🇸':'us','🇮🇳':'in'};
function pairLabel(label){const code=flagCodes[label];return code?`<img class="flag-image" src="flags/${code}.svg" alt="Bayrak görseli" loading="eager" draggable="false">`:esc(label)}
function pairMatchUI(){const ui=document.getElementById('interaction'),pairs=current.pairs;activity={matched:[],chosen:null};const left=pairs.map((p,i)=>({i,label:p[0]}));const right=shuffle(pairs.map((p,i)=>({i,label:p[1]})));
 ui.innerHTML='<div class="activity-guide">İki kartı eşleştir: Önce soldakine, ardından sağdakine dokun. Bilgisayarda soldaki kartı sağdaki eşinin üzerine sürükleyebilirsin.</div><div class="pair-board"><div class="pair-column"><h3>1. Kart</h3>'+left.map(p=>`<button class="pair-card" id="left-${p.i}" aria-label="${selected.id==='g4-flags'?'Bayrak '+(p.i+1):esc(p.label)}" draggable="true" ondragstart="event.dataTransfer.setData('text/plain','${p.i}')" onclick="pickPair(${p.i})">${pairLabel(p.label)}</button>`).join('')+'</div><div class="pair-column"><h3>2. Kart</h3>'+right.map(p=>`<button class="pair-card" id="right-${p.i}" ondragover="event.preventDefault()" ondrop="event.preventDefault();matchPair(Number(event.dataTransfer.getData('text/plain')),${p.i})" onclick="matchPair(activity.chosen,${p.i})">${pairLabel(p.label)}</button>`).join('')+'</div></div><div id="match-status" class="activity-guide" aria-live="polite">0 / '+pairs.length+' eşleşme</div>';
}
function pickPair(i){if(blocked||activity.matched.includes(i))return;activity.chosen=i;say(current.pairs[i][0]);document.querySelectorAll('.pair-card').forEach(e=>e.classList.remove('pair-active'));document.getElementById('left-'+i)?.classList.add('pair-active');}
function matchPair(from,to){if(blocked||from===null||from===undefined||!Number.isInteger(from)||activity.matched.includes(from)||activity.matched.includes(to))return;if(from!==to){feedback(false,'Bu kartlar eşleşmiyor. Yeniden dene.');playSound(false);return;}activity.matched.push(to);say(current.pairs[to][1]);['left-','right-'].forEach(prefix=>{const node=document.getElementById(prefix+to);if(node){node.classList.add('pair-done');node.disabled=true;}});activity.chosen=null;document.getElementById('match-status').textContent=`${activity.matched.length} / ${current.pairs.length} eşleşme`;document.getElementById('feedback').innerHTML='';tone(620,.1);if(activity.matched.length===current.pairs.length)finishSpecial('Tüm kartları doğru eşleştirdin!');}
function nextQuestion(){
 blocked=false;position=0;sequence=[];
 const id=selected.id;
 if(richBanks[id])current=enrichedQuestion(id);
 else {const deck=getDeck(id);const index=smartPickIndex(id,deck.length);current=deck[index];}
 play();
}
function play(){if(!selected){route('games');return}let c=current;el(`<div class="game-head">${btn('← Oyunlar',"route('games')",'secondary')}<span class="tag">${esc(selected.title)} • Soru ${Math.min(round+1,5)}/5</span></div><section class="panel" style="margin-top:20px"><h2>${selected.emoji} ${esc(selected.title)}</h2><p>${esc(selected.desc)}</p><div class="question">${esc(c.prompt)}</div><div class="visual">${esc(c.visual||'')}</div><div class="history-note">🧠 <strong>Akıllı soru seçimi:</strong> Bu cihazda aynı içerik, mevcut etkinlik havuzu bitene kadar yeniden seçilmez. <span>Etkinlik ${activeVariant+1}/${activeDeckSize}</span></div><div class="voice-bar"><button class="secondary" onclick="say(current.prompt)">🔊 Soruyu Seslendir</button></div><div id="interaction"></div><div id="feedback" aria-live="polite"></div><p class="muted">Puan: ${score} / ${round*20} • Yanlış cevapta tekrar deneyebilirsin.</p></section>`);let ui=document.getElementById('interaction');if(c.type==='path'){pathUI();return}if(c.type==='steps'){stepsUI();return}if(c.type==='pairMatch'){pairMatchUI();return}if(['clock','scale','loopgrid','counters','subtract','money','fractions','array','numberPattern','divide','measure','twoStep','fractionCompare','pairMatch','sceneChoice'].includes(c.type)){specialUI();return}ui.innerHTML=`${c.sound?btn('🔊 Sesi Çal','current.sound()','secondary'):''}<div class="choices">${shuffle([...new Set(c.options.map(String))]).map(o=>`<button class="choice" data-answer="${esc(o)}"></button>`).join('')}</div>`;ui.querySelectorAll('[data-answer]').forEach(b=>{b.textContent=b.dataset.answer;b.addEventListener('click',()=>answer(b.dataset.answer))})}
function answer(v){if(blocked)return;if(String(v)!==String(current.answer)){feedback(false,'Bir daha dene! Dikkatlice düşün.');playSound(false);return}blocked=true;score+=20;feedback(true,'Harika! Doğru cevap. ⭐');playSound(true);document.querySelectorAll('.choice').forEach(b=>b.disabled=true);advanceButton()}
function feedback(ok,msg){document.getElementById('feedback').innerHTML=`<div class="answer ${ok?'ok':'no'}">${msg}</div>`}function advanceButton(){document.getElementById('feedback').insertAdjacentHTML('beforeend',btn(round===4?'🏆 Oyunu Bitir':'Sonraki Soru →','advance()'))}
function advance(){round++;if(round>=5){let rec=progress[selected.id]||{wins:0,best:0};rec.wins++;rec.best=Math.max(rec.best,score);progress[selected.id]=rec;store('progress',progress);el(`<section class="panel" style="text-align:center"><div style="font-size:85px">🏆</div><h1>Tebrikler!</h1><p><b>${esc(selected.title)}</b> oyununu tamamladın.</p><h2>⭐ ${score}/100 puan</h2>${btn('Başka Oyun Seç',"route('games')")}</section>`)}else nextQuestion()}
function pathUI(){let board=Array(16).fill('');board[position]='🤖';board[15]='⭐';document.getElementById('interaction').innerHTML=`<div class="gridpath">${board.map((e,i)=>`<div class="cell ${i===15?'goal':''}">${e}</div>`).join('')}</div><p style="text-align:center">${sequence.map(s=>s==='R'?'➡️':'⬇️').join(' ')||'Henüz komut yok'} (${sequence.length}/6)</p><div class="choices"><button class="choice" onclick="move('R')">➡️ Sağ</button><button class="choice" onclick="move('D')">⬇️ Aşağı</button><button class="choice" onclick="position=0;sequence=[];pathUI()">🔄 Sıfırla</button></div>`}
function move(dir){if(blocked)return;let x=position%4,y=Math.floor(position/4);if((dir==='R'&&x===3)||(dir==='D'&&y===3)){feedback(false,'Bu yönde ilerleyemezsin.');return}position+=dir==='R'?1:4;sequence.push(dir);pathUI();if(position===15){blocked=true;score+=20;feedback(true,'Robot yıldızı buldu! ⭐');playSound(true);advanceButton()}}
const stepNames=['Çukur aç','Fidanı yerleştir','Toprağı kapat','Can suyu ver'];function stepsUI(){document.getElementById('interaction').innerHTML=`<p>Bir sonraki doğru adımı seç.</p><div class="steps">${sequence.map(i=>`<span class="step">${i+1}. ${stepNames[i]}</span>`).join('')}</div><div class="choices">${shuffle(stepNames.map((name,i)=>({name,i})).filter(x=>!sequence.includes(x.i))).map(x=>`<button class="choice" onclick="chooseStep(${x.i})">${esc(x.name)}</button>`).join('')}</div>`}
function chooseStep(i){if(i!==sequence.length){feedback(false,'Bu adımdan önce yapılması gereken bir şey var.');return}sequence.push(i);stepsUI();if(sequence.length===4){blocked=true;score+=20;feedback(true,'Algoritmayı doğru tamamladın!');playSound(true);advanceButton()}}

// Etkileşimli oyun motoru: sürükle-bırak ve dokunarak seçme aynı sonucu üretir.
let activity={};
function playSound(success){try{tone(success?660:240,.14,'sine');if(success)tone(880,.17,'sine',.17)}catch(_){}}
function finishSpecial(message){if(blocked)return;blocked=true;score+=20;feedback(true,message+' ⭐');playSound(true);advanceButton()}
function clockSvg(hour,minute){
 const cx=150,cy=150,r=114;
 const tick=Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;const x=cx+Math.sin(a)*95,y=cy-Math.cos(a)*95;return `<text x="${x}" y="${y}" dominant-baseline="middle" text-anchor="middle" font-size="19" font-weight="800" fill="#1e3a8a">${i||12}</text>`}).join('');
 const h=(hour%12+minute/60)*30,m=minute*6;
 return `<svg class="clock-svg" viewBox="0 0 300 300" role="img" aria-label="Saat ${hour}:${String(minute).padStart(2,'0')}"><circle cx="150" cy="150" r="137" fill="#dbeafe"/><circle cx="150" cy="150" r="120" fill="white" stroke="#4073c6" stroke-width="7"/>${tick}<line x1="150" y1="150" x2="150" y2="90" stroke="#172554" stroke-width="11" stroke-linecap="round" transform="rotate(${h} 150 150)"/><line x1="150" y1="150" x2="150" y2="55" stroke="#f97316" stroke-width="7" stroke-linecap="round" transform="rotate(${m} 150 150)"/><circle cx="150" cy="150" r="9" fill="#172554"/></svg>`;
}
// İlk görünüm: kollar ve kefeler yatay; kütleler kefenin ÜSTÜNDE bekler.
// Yanıt verildiğinde kütleler kefelere iner, ağır kefe aşağı hareket eder.
function scaleSvg(left,right,revealed=false){
 const tilt=revealed?Math.sign(right-left)*11:0;
 const block=(x,n)=>`<g class="scale-weight ${revealed?'weight-drop':''}" style="transform:translate(${x-31}px, ${revealed?135:103}px)"><rect x="0" y="0" width="62" height="36" rx="7" fill="#fbbf24" stroke="#c77d18" stroke-width="2"/><text x="31" y="24" font-size="20" text-anchor="middle" font-weight="800" fill="#653c08">${n} kg</text></g>`;
 return `<svg class="scale-svg" viewBox="0 0 520 320" role="img" aria-label="Sol ağırlık ${left} kilogram, sağ ağırlık ${right} kilogram. ${revealed?(left===right?'Terazi dengede':left>right?'Sol kefe aşağı indi':'Sağ kefe aşağı indi'):'Terazi başlangıçta dengede'}"><rect x="227" y="261" width="66" height="14" rx="7" fill="#64748b"/><path d="M260 261V65" stroke="#334155" stroke-width="13" stroke-linecap="round"/><g class="scale-arm ${revealed?'scale-arm-revealed':''}" style="transform:rotate(${tilt}deg);transform-origin:260px 75px"><path d="M100 75 H420" stroke="#475569" stroke-width="12" stroke-linecap="round"/><circle cx="260" cy="75" r="11" fill="#f59e0b"/><path d="M110 75 L85 177 M110 75 L135 177 M410 75 L385 177 M410 75 L435 177" stroke="#64748b" stroke-width="4"/><path d="M67 177Q110 217 153 177Z M367 177Q410 217 453 177Z" fill="#93c5fd" stroke="#2563eb" stroke-width="3"/>${block(110,left)}${block(410,right)}</g><text x="110" y="310" text-anchor="middle" font-size="19" font-weight="800" fill="#1e3a8a">SOL</text><text x="410" y="310" text-anchor="middle" font-size="19" font-weight="800" fill="#1e3a8a">SAĞ</text></svg>`;
}
function scaleAnswer(v){if(blocked)return;blocked=true;const correct=v===current.answer;
 const scale=document.querySelector('.scale-svg');const arm=scale?.querySelector('.scale-arm');const weights=scale?.querySelectorAll('.scale-weight');
 const tilt=Math.sign(current.right-current.left)*11;
 if(arm)arm.style.transform=`rotate(${tilt}deg)`;
 weights?.forEach((weight,i)=>{const x=i===0?79:379;weight.style.transform=`translate(${x}px, 135px)`});
 scale?.setAttribute('aria-label',`Cevap: ${current.answer}. Terazi sonucu gösterildi.`);
 document.querySelectorAll('.choice').forEach(b=>{b.disabled=true;b.classList.toggle('selected-answer',b.dataset.answer===current.answer)});
 if(correct)score+=20;
 feedback(correct,correct?`Doğru! ${current.answer==='Eşit'?'İki kefe dengede.':current.answer+' kefe daha ağır.'}`:`Doğru cevap: ${current.answer}. Ağır kefe aşağı iner.`);
 playSound(correct);say(`Doğru cevap: ${current.answer}.`);advanceButton();
}
function specialUI(){const c=current,ui=document.getElementById('interaction');activity={chosen:[],sum:0,robot:0,commands:[],colored:new Set()};
 if(c.type==='clock'){document.querySelector('.visual').innerHTML=clockSvg(c.hour,c.minute);showOptions(ui,c.options);return}
 if(c.type==='scale'){document.querySelector('.visual').innerHTML=scaleSvg(c.left,c.right,false);ui.innerHTML=`<div class="activity-guide">Önce iki kefe de dengede. Tahminini seçince ağırlıklar kefelere inecek ve sonuç görünecek.</div><div class="choices">${c.options.map(o=>`<button class="choice" data-answer="${o}" onclick="scaleAnswer('${o}')">${o}</button>`).join('')}</div>`;return}
 if(c.type==='counters'||c.type==='subtract'){
   activity.type=c.type;activity.total=c.start;activity.moved=0;
   ui.innerHTML=`<div class="activity-guide">🍎 Nesneyi sürükle veya dokun. Ardından hedef kutusuna dokunarak da taşıyabilirsin.</div><div class="math-work"><div><b>${c.type==='counters'?'Trene eklenecek yolcular':'Bahçedeki elmalar'}</b><div class="token-zone" id="tokens"></div></div><div><b>${c.type==='counters'?'Tren 🚂':'Sepet 🧺'}</b><div class="drop-zone" id="drop-zone" tabindex="0" role="button" aria-label="Nesne bırakma alanı" onclick="transferToken()" ondragover="event.preventDefault()" ondrop="event.preventDefault();transferToken()"></div></div></div><p class="activity-status" id="activity-status"></p><button class="secondary" onclick="say(current.prompt)">🔊 Yönergeyi Dinle</button>`;
   updateTokens();return;
 }
 if(c.type==='money'){
   ui.innerHTML=`<div class="activity-guide">Paraları kasaya sürükle veya bir paraya dokunarak ekle. Gerektiğinde sıfırla.</div><div class="money-choice">${[1,2,5,10].map(n=>`<button class="coin" draggable="true" ondragstart="event.dataTransfer.setData('text/plain','${n}')" onclick="addMoney(${n})">${n} TL</button>`).join('')}</div><div class="drop-zone" ondragover="event.preventDefault()" ondrop="event.preventDefault();addMoney(Number(event.dataTransfer.getData('text/plain')))" id="cash-drop">🛒 Kasa: <b id="money-value">0</b> TL</div><p>Hedef: <b>${c.target} TL</b></p><button class="secondary" onclick="activity.sum=0;document.getElementById('money-value').textContent=0;feedback(false,'Yeniden deneyebilirsin.')">↺ Sıfırla</button>`;return;
 }
 if(c.type==='fractions'){
 ui.innerHTML=`<div class="activity-guide">🖌️ Her bir bölmeye dokun veya fırçayı kutulara sürükle.</div><div class="paint-tool" draggable="true" ondragstart="event.dataTransfer.setData('text/plain','paint')">🎨 Renk fırçası</div><div class="fraction-board" style="grid-template-columns:repeat(${Math.min(c.parts,4)},1fr)">${Array.from({length:c.parts},(_,i)=>`<button class="fraction-tile" id="fraction-${i}" ondragover="event.preventDefault()" ondrop="event.preventDefault();colorPart(${i})" onclick="colorPart(${i})" aria-label="${i+1}. parçayı boya"></button>`).join('')}</div><p class="activity-status" id="activity-status">Boyanan: 0 / ${c.target}</p><button class="secondary" onclick="activity.colored.clear();document.querySelectorAll('.fraction-tile').forEach(x=>x.classList.remove('painted'));document.getElementById('activity-status').textContent='Boyanan: 0 / '+current.target">↺ Temizle</button>`;return;
 }
 if(['array','numberPattern','divide','measure','twoStep','fractionCompare','pairMatch','sceneChoice'].includes(c.type)){mathActivityUI();return;}
 if(c.type==='loopgrid'){
 const paths=[[0,1,2,6,10,11,15],[0,4,8,9,10,14,15],[0,1,5,9,10,11,15]];
 activity.path=sample(paths);activity.robot=0;activity.commands=[];
 ui.innerHTML=`<div class="activity-guide">Robotu yıldızlı kareye ulaştırmak için yön komutlarını sırayla ekle. Engel karelere gidemezsin. En fazla 8 komut kullanabilirsin.</div><div id="loop-board"></div><div class="command-row">${[['R','➡️ Sağ'],['D','⬇️ Aşağı'],['L','⬅️ Sol'],['U','⬆️ Yukarı']].map(([k,v])=>`<button class="choice" onclick="queueMove('${k}')">${v}</button>`).join('')}</div><div id="command-display"></div><div class="tools"><button class="primary" onclick="runRobot()">▶️ Robotu Çalıştır</button><button class="secondary" onclick="activity.commands=[];renderRobot()">↺ Komutları Sil</button></div>`;
 renderRobot();return;
 }
}
function showOptions(ui,options){ui.innerHTML=`<button class="secondary" onclick="say(current.prompt)">🔊 Soruyu Dinle</button><div class="choices">${shuffle(options).map(v=>`<button class="choice" data-answer="${esc(v)}">${esc(v)}</button>`).join('')}</div>`;ui.querySelectorAll('[data-answer]').forEach(b=>b.addEventListener('click',()=>answer(b.dataset.answer)))}
function updateTokens(){const c=current,remaining=c.type==='subtract'?c.start-activity.moved:c.add-activity.moved;
 document.getElementById('tokens').innerHTML=Array.from({length:Math.max(0,remaining)},(_,i)=>`<button draggable="true" class="math-token" ondragstart="event.dataTransfer.setData('text/plain','apple')" onclick="transferToken()">🍎</button>`).join('')||'✅';
 document.getElementById('drop-zone').innerHTML=Array.from({length:activity.moved},()=>'<span class="placed-token">🍎</span>').join('')||'Buraya bırak';
 document.getElementById('activity-status').textContent=`Taşınan: ${activity.moved} / ${c.type==='subtract'?c.remove:c.add} • ${c.type==='subtract'?'Kalan':'Toplam'}: ${c.type==='subtract'?c.start-activity.moved:c.start+activity.moved}`;
}
function transferToken(){if(blocked)return;const c=current,goal=c.type==='subtract'?c.remove:c.add;if(activity.moved>=goal)return;activity.moved++;updateTokens();if(activity.moved===goal)finishSpecial('Nesneleri doğru taşıdın!')}
function addMoney(n){if(blocked||![1,2,5,10].includes(n))return;activity.sum+=n;document.getElementById('money-value').textContent=activity.sum;if(activity.sum===current.target)finishSpecial('Doğru miktarı ödedin!');else if(activity.sum>current.target)feedback(false,'Fazla para koydun. Sıfırla ve yeniden dene.')}
function colorPart(i){if(blocked)return;if(activity.colored.has(i)){activity.colored.delete(i);document.getElementById('fraction-'+i).classList.remove('painted')}else{activity.colored.add(i);document.getElementById('fraction-'+i).classList.add('painted')};let count=activity.colored.size;document.getElementById('activity-status').textContent=`Boyanan: ${count} / ${current.target}`;if(count===current.target)finishSpecial('Kesrin parçalarını doğru boyadın!')}
function renderRobot(){const path=activity.path;const obstacles=Array.from({length:16},(_,i)=>i).filter(i=>!path.includes(i));let grid=Array.from({length:16},(_,i)=>`<div class="robot-cell ${obstacles.includes(i)?'obstacle':''}">${activity.robot===i?'🤖':i===15?'⭐':obstacles.includes(i)?'🪨':''}</div>`).join('');document.getElementById('loop-board').innerHTML=`<div class="robot-grid">${grid}</div>`;document.getElementById('command-display').textContent=activity.commands.length?activity.commands.map(k=>({R:'➡️',D:'⬇️',L:'⬅️',U:'⬆️'})[k]).join(' '):'Komut eklemedin.'}
function queueMove(k){if(blocked||activity.commands.length>=8)return;activity.commands.push(k);renderRobot()}
function runRobot(){if(blocked)return;let pos=0;const deltas={R:1,L:-1,D:4,U:-4};for(const k of activity.commands){let next=pos+deltas[k];if(next<0||next>15||(k==='R'&&pos%4===3)||(k==='L'&&pos%4===0)||!activity.path.includes(next)){feedback(false,'Robot engele çarptı. Komutları düzeltip tekrar dene.');playSound(false);return}pos=next}activity.robot=pos;renderRobot();if(pos===15)finishSpecial('Harika! Robot engelleri aştı!');else feedback(false,'Robot hedefe henüz ulaşmadı. Komutlarını gözden geçir.')}


// Diğer matematik oyunları: görsel model, dokun-sürükle, geri bildirim.
function mathActivityUI(){const c=current,ui=document.getElementById('interaction');activity={sum:0,selected:[],placed:[],stage:0,groups:Array.from({length:c.groups||0},()=>0)};
 const guide=(t)=>`<div class="activity-guide">${t}</div>`;
 if(c.type==='array'){
  ui.innerHTML=guide('Satır ve sütunları incele. Alttaki sayı kartını doğru kutuya taşı veya dokun.')+`<div class="array-grid" style="grid-template-columns:repeat(${c.cols},1fr)">${Array.from({length:c.rows*c.cols},()=>'<span class="array-dot">🍎</span>').join('')}</div><p class="activity-status">${c.rows} sıra × ${c.cols} nesne</p><div class="math-target" id="math-target" ondragover="event.preventDefault()" ondrop="mathDrop(event)">Toplam kaç nesne?</div><div class="math-pieces">${shuffle([c.rows*c.cols,c.rows+c.cols,c.rows*c.cols+c.cols,c.rows*c.cols-c.cols]).filter((v,i,a)=>v>0&&a.indexOf(v)===i).map(n=>`<button class="number-piece" draggable="true" ondragstart="event.dataTransfer.setData('text/plain','${n}')" onclick="mathChoose(${n})">${n}</button>`).join('')}</div>`;return;
 }
 if(c.type==='numberPattern'){
  const items=c.numbers.slice(0,3);ui.innerHTML=guide('Eksik sayıyı sürükle veya dokunarak yerleştir.')+`<div class="math-pieces">${items.map(n=>`<span class="number-static">${n}</span>`).join('')}<span class="math-target" id="math-target" ondragover="event.preventDefault()" ondrop="mathDrop(event)">?</span></div><div class="math-pieces">${shuffle([c.numbers[3],c.numbers[3]+1,c.numbers[3]-1,c.numbers[3]+5]).map(n=>`<button class="number-piece" draggable="true" ondragstart="event.dataTransfer.setData('text/plain','${n}')" onclick="mathChoose(${n})">${n}</button>`).join('')}</div>`;return;
 }
 if(c.type==='divide'){
  ui.innerHTML=guide('Kalemleri öğrenci kutularına sürükle veya bir öğrenci kutusuna dokun. Her öğrenci eşit sayıda kalem almalı.')+`<p class="activity-status" id="activity-status">Kalan kalem: ${c.total}</p><div id="divide-source" class="token-zone">${Array.from({length:c.total},()=>'<button class="math-token" draggable="true" ondragstart="event.dataTransfer.setData(\'text/plain\',\'pen\')" onclick="activity.selected=[\'pen\']">✏️</button>').join('')}</div><div id="divide-groups" class="divide-groups">${Array.from({length:c.groups},(_,i)=>`<button class="student-box" ondragover="event.preventDefault()" ondrop="event.preventDefault();givePen(${i})" onclick="givePen(${i})">🧑‍🎓 ${i+1}. öğrenci<div id="student-${i}"></div></button>`).join('')}</div><button class="secondary" onclick="mathActivityUI()">↺ Baştan Başla</button>`;return;
 }
 if(c.type==='measure'){
  const values=shuffle([c.metres*100,c.metres*100+100,c.metres*100-100,c.metres*100+200].filter(v=>v>0));
  ui.innerHTML=guide('Cetvelde doğru uzunluğu gösteren kartı seç veya kutuya sürükle.')+`<div class="ruler">${Array.from({length:c.metres},()=>'<div class="metre-segment">100 cm</div>').join('')}</div><p class="activity-status">${c.metres} metre = ? santimetre</p><div class="math-target" id="math-target" ondragover="event.preventDefault()" ondrop="mathDrop(event)">Cevabı buraya bırak</div><div class="math-pieces">${values.map(n=>`<button class="number-piece" draggable="true" ondragstart="event.dataTransfer.setData('text/plain','${n}')" onclick="mathChoose(${n})">${n} cm</button>`).join('')}</div>`;return;
 }
 if(c.type==='twoStep'){
  ui.innerHTML=guide('Önce çıkarma işlemini, sonra ekleme işlemini çöz. Her aşamada doğru kartı kutuya yerleştir.')+`<div class="book-model">📚 <strong>${c.initial}</strong> <span>− ${c.removed} 📕</span> <span>+ ${c.added} 📗</span></div><p class="activity-status" id="activity-status">1. adım: ${c.initial} − ${c.removed} = ?</p><div class="math-target" id="math-target" ondragover="event.preventDefault()" ondrop="mathDrop(event)">Birinci işlemin sonucu</div><div class="math-pieces" id="two-step-choices"></div>`;renderTwoStep();return;
 }
 if(c.type==='fractionCompare'){
  const model=(n)=>`<div class="fraction-strip">${Array.from({length:c.parts},(_,i)=>`<span class="${i<n?'filled':''}"></span>`).join('')}</div>`;
  ui.innerHTML=guide('Boyalı bölmeleri karşılaştır. Daha büyük kesir modeline dokun veya kartı kutuya sürükle.')+`<div class="fraction-compare">${[[c.left,'Sol'],[c.right,'Sağ']].map(([n,side])=>`<button class="fraction-option" draggable="true" ondragstart="event.dataTransfer.setData('text/plain','${n}/${c.parts}')" onclick="mathChoose('${n}/${c.parts}')">${side} model ${model(n)}<b>${n}/${c.parts}</b></button>`).join('')}</div><div class="math-target" id="math-target" ondragover="event.preventDefault()" ondrop="mathDrop(event)">Büyük kesri buraya bırak</div>`;return;
 }
}
function renderTwoStep(){let c=current,first=c.initial-c.removed,target=activity.stage===0?first:first+c.added;
 let vals=shuffle([...new Set([target,target+2,target-2,target+5])].filter(x=>x>=0));
 const container=document.getElementById('two-step-choices');if(container)container.innerHTML=vals.map(n=>`<button class="number-piece" draggable="true" ondragstart="event.dataTransfer.setData('text/plain','${n}')" onclick="mathChoose(${n})">${n}</button>`).join('');
}
function mathDrop(event){event.preventDefault();const v=event.dataTransfer?.getData('text/plain');if(v!==undefined&&v!=='')mathChoose(v)}
function mathChoose(v){if(blocked)return;const c=current;
 const target=c.type==='twoStep'?(activity.stage===0?c.initial-c.removed:Number(c.answer)):c.answer;
 if(String(v)!==String(target)){feedback(false,'Tekrar dene. Görseli dikkatle incele.');playSound(false);return;}
 if(c.type==='twoStep'&&activity.stage===0){activity.stage=1;document.getElementById('activity-status').textContent=`✅ 1. adım: ${c.initial} − ${c.removed} = ${target}. Şimdi ${target} + ${c.added} = ?`;document.getElementById('math-target').textContent='İkinci işlemin sonucu';renderTwoStep();feedback(true,'İlk işlemi buldun! İkinci adıma geç.');tone(560,.13);return;}
 const destination=document.getElementById('math-target');if(destination){destination.textContent=String(v)+(c.type==='measure'?' cm':'');destination.classList.add('success-pulse')}
 finishSpecial('Harika, görsel işlemi doğru tamamladın!');
}
function givePen(i){if(blocked)return;const c=current,allocated=activity.groups.reduce((a,b)=>a+b,0);if(allocated>=c.total)return;
 activity.groups[i]++;document.getElementById('student-'+i).textContent='✏️'.repeat(activity.groups[i]);
 const rem=c.total-allocated-1;document.getElementById('activity-status').textContent='Kalan kalem: '+rem;
 document.getElementById('divide-source').innerHTML=Array.from({length:rem},()=>'<span class="placed-token">✏️</span>').join('')||'✅ Hepsi dağıtıldı';
 if(rem===0){if(activity.groups.every(x=>x===c.per)){finishSpecial(`Eşit dağıttın! Her öğrenci ${c.per} kalem aldı.`)}else{feedback(false,'Kalemler eşit dağılmadı. Baştan deneyebilirsin.');playSound(false)}}
}
const versionHistory = [{"version": "V12.6", "title":"Hedef 5 oyunu", "desc":"Akıl-Zekâ kategorisine 8×7 dikey tahtalı, iki kişilik Hedef 5 oyunu eklendi. Taş düşürme, otomatik beşli kontrolü, kazananı gösterme ve beraberlik kuralları hazırlandı.", "tag":"Yeni oyun"}, {"version": "V12.5", "title": "Tangram atölyesi yenilemesi", "desc": "Tek renkli bütün silüet, standart yedi parçayla geometrik doğrulanan figür yerleşimleri, kolay/orta/zor seviyeler, sürükleme, 45 derece döndürme, yansıtma, ipuçları ve süre seçenekleri eklendi.", "tag": "Oyun geliştirme"}, {"version": "V12.4.3", "title": "Sürüm geçmişi sayfası", "desc": "Hakkında sayfasına, bugüne kadar gerçekleştirilen geliştirmeleri anlatan açılır-kapanır sürüm geçmişi eklendi.", "tag": "Yeni"}, {"version": "V12.4.2", "title": "Bilgi Yarışması cevap görünümü", "desc": "Şıklar gizliyken doğru cevap gösterildiğinde diğer seçeneklerin otomatik açılmaması için arayüz düzeltmesi hazırlandı.", "tag": "Düzeltme"}, {"version": "V12.4.1", "title": "Harf ve rakamla öğretmen girişi", "desc": "Öğretmen kodlarının 8 karakterlik büyük/küçük harf ve rakam birleşimlerini kabul etmesi sağlandı.", "tag": "Düzeltme"}, {"version": "V12.4", "title": "Korumalı Bilgi Yarışması", "desc": "Öğretmenlere özel kodla giriş, sunucuda kod doğrulama, oturum yönetimi ve korumalı yarışma soruları eklendi. Ramazan Köşesi için toplu soru dosyası korundu.", "tag": "Güvenlik"}, {"version": "V12.3", "title": "Soru bankalarının yönetimi", "desc": "Bilgi Yarışması soruları için GitHub üzerinden düzenlenebilen soru dosyası ve kısa çizgi ile toplu ekleme biçimi hazırlandı. Ramazan Köşesi için ayrıca toplu soru ekleme desteği geliştirildi.", "tag": "İçerik"}, {"version": "V12.2", "title": "Sudoku ve yarışma iyileştirmeleri", "desc": "Sudoku kutularını ayıran koyu çizgiler, kare boyutu düzeltmesi, yarışma şıklarını gizleme seçeneği ve toplu soru hazırlama kolaylıkları eklendi.", "tag": "İyileştirme"}, {"version": "V12.1", "title": "Süreler ve sınıf yarışması", "desc": "Ramazan soru tekrarlarını azaltan gruplama; Tangram siluet ve sürükle-bırak; Tangram/Sudoku süreleri; satranç saati; Sudoku zorlukları ve takımlı Bilgi Yarışması oluşturuldu.", "tag": "Büyük güncelleme"}, {"version": "V12", "title": "Yeni tasarım, Ramazan ve yeni oyunlar", "desc": "Daha modern ana sayfa, sınıf ve kategori kartları, oyun araması; Ramazan Köşesi (500 soru kaydı hedefi) ve Tangram, Sudoku, Mangala, Pentago, Desen Küpleri ile 60 oyunluk yapı geliştirildi.", "tag": "Büyük güncelleme"}, {"version": "V11", "title": "Akıl-Zekâ bölümü", "desc": "Satranç, dama, dokuz taş, OXO, reversi ve koridor oyunlarıyla ayrı Akıl-Zekâ kategorisi oluşturuldu.", "tag": "Yeni kategori"}, {"version": "V10", "title": "Renkli ana sayfa", "desc": "Ana sayfanın görsel dili, renkleri, gezinme ve kategori sunumu yenilendi.", "tag": "Tasarım"}, {"version": "V9.1", "title": "Hakkında bağlantısı düzeltmesi", "desc": "Hakkında sayfasına erişim ve menü bağlantısı düzeltildi.", "tag": "Düzeltme"}, {"version": "V9", "title": "Hakkında ve site yönetimi", "desc": "Hakkında sayfası, hazırlayanın tanıtımı ve fotoğrafı eklendi; herkese açık demo yönetim menüsü kaldırıldı.", "tag": "Kurumsal"}, {"version": "V8", "title": "Daha zengin soru çeşitliliği", "desc": "Şeffaf okul logosu, oyunlarda farklı soru kombinasyonları ve aynı sorunun daha az tekrarlanmasını hedefleyen yerel soru geçmişi eklendi.", "tag": "İçerik"}, {"version": "V7", "title": "Bayraklar ve konu ayrımı", "desc": "Bayrak oyunlarında SVG görseller kullanıldı; Ülkemiz ve Sosyal Bilgiler soru havuzları ayrıştırıldı.", "tag": "İçerik"}, {"version": "V6", "title": "49 oyuna genişleme", "desc": "Ülkemiz ve Sosyal Bilgiler kategorileri ile Türkçe, fen ve kodlama alanlarında yeni oyunlar eklendi; toplam 49 oyuna ulaşıldı.", "tag": "Genişleme"}, {"version": "V5", "title": "Etkileşim ve seslendirme", "desc": "Terazi, matematik modelleri, sayı oyunları ve görsel etkileşimler geliştirildi; yönergeler için seslendirme ve iletişim bilgisi eklendi.", "tag": "İyileştirme"}, {"version": "V4", "title": "Oyun mekaniği geliştirmeleri", "desc": "Analog saat, ağırlık terazisi, sürükle-bırak matematik ve robot kodlama oyunlarında etkileşim ve sınıf seviyesi düzenlemeleri yapıldı.", "tag": "Oyun"}, {"version": "V3", "title": "İlkokul kapsamı: 39 oyun", "desc": "Ana sınıfı oyunlarına 1–4. sınıflar için yeni oyunlar eklendi; 39 oyunlu, sınıf filtreli yapı hazırlandı.", "tag": "Genişleme"}, {"version": "V1–V2", "title": "İlk geliştirme dönemi", "desc": "Oyun Akademisi’nin temel taslağı, ana sınıfı etkinlikleri ve ilk oyun akışları oluşturuldu. Bu sürümlere ait ayrıntılı değişiklik listesi arşivde bulunmuyor.", "tag": "Başlangıç"}];
function about(){el(`<section class="about-stack"><div class="about-panel"><h1>ℹ️ Hakkında</h1><p>AİP Oyun Akademisi, Atışalanı İsmetpaşa İlkokulu öğrencilerinin oynayarak öğrenmesini desteklemek için hazırlandı. Bu platformda öğrenciler; matematik, Türkçe, fen bilimleri, ülkemiz, sosyal bilgiler, mantık ve kodlama alanlarında seviyelerine uygun etkinliklerle karşılaşır.</p><div class="note-box"><strong>Bu site neden kuruldu?</strong><p>Teknolojiyi eğitimle buluşturmak, öğrencilerin ilgisini çeken bir öğrenme ortamı oluşturmak ve okulumuza özgü dijital içerikler üretmek amacıyla geliştirildi. Site, öğrencilerin güvenli biçimde oyun oynayabildiği; kişisel veri toplamayan bir yapıda tasarlandı.</p></div></div><div class="about-panel about-person"><div><img class="profile-photo" src="enes-engin.jpg" alt="Enes Engin fotoğrafı"><div class="cta-row"><a class="secondary" style="text-decoration:none;display:inline-flex;align-items:center;justify-content:center" href="mailto:enesengin.info@gmail.com">✉️ İletişim</a></div></div><div><span class="kicker">Bu siteyi hazırlayan</span><h2 style="margin-top:12px">Enes ENGİN</h2><p>İstanbul'da doğup büyüdü. Matematik ve Sınıf Öğretmenliği okudu. Hâlihazırda okul müdürüdür. 9 yıldır drone pilotluğu yapmaktadır. İHAKUT isimli havadan tespit ve kurtarma kulübünün resmî üyesi ve sorumlularındandır. Teknolojiyi eğitimle buluşturma adına çalışmalar yapmaktadır.</p><ul class="info-list"><li>Atışalanı İsmetpaşa İlkokulu için özgün dijital eğitim içerikleri üretmektedir.</li><li>Drone pilotluğu, arama-kurtarma ve teknoloji alanındaki deneyimini eğitim çalışmalarıyla birleştirmektedir.</li><li>Öğrencilerin aktif katıldığı güvenli, eğlenceli ve öğretici dijital ortamlar geliştirmeyi hedeflemektedir.</li></ul></div></div><div class="about-panel"><h2>🚀 Sen de yapabilirsin!</h2><p>Bu sitedeki her oyun; fikir, tasarım, kod ve deneme süreciyle ortaya çıktı. Merak etmek, denemek ve vazgeçmemek öğrenmenin en güçlü yollarıdır.</p><div class="mini-grid"><div class="mini-card"><strong>🧩 Oyun Tasarla</strong><p>Kendi sorularını, kartlarını, labirentlerini ve bulmacalarını oluşturabilirsin.</p></div><div class="mini-card"><strong>💻 Kodlamayı Dene</strong><p>Scratch, blok tabanlı araçlar ve basit web projeleriyle dijital üretime başlayabilirsin.</p></div><div class="mini-card"><strong>🤖 Teknolojiyle Öğren</strong><p>Yapay zekâ, robotik ve dijital araçlarla öğrenmeyi daha eğlenceli hâle getirebilirsin.</p></div></div><div class="cta-row">${btn('🎮 Oyunlara Geç',"route('games')")}${btn('📚 Bilgi Köşesi',"route('info')",'secondary')}</div></div><div class="about-panel version-history" id="surum-gecmisi"><div class="version-history-heading"><div><span class="kicker">GELİŞİM YOLCULUĞUMUZ</span><h2>🗂️ Sürüm Geçmişi</h2><p>Oyun Akademisi ilk taslağından bugüne nasıl gelişti? Aşağıdaki sürümlere dokunarak yenilikleri inceleyebilirsiniz.</p></div><span class="version-current">V12.6</span></div><div class="version-list">${versionHistory.map((v,i)=>`<details class="version-entry" ${i===0?'open':''}><summary><span class="version-number">${v.version}</span><span class="version-name">${v.title}</span><span class="version-tag">${v.tag}</span><span class="version-toggle" aria-hidden="true">⌄</span></summary><div class="version-description">${v.desc}</div></details>`).join('')}</div><p class="version-footnote">Not: Sürüm geçmişi geliştirilen paketlerin kronolojisini gösterir. Bazı ara sürümler ayrı düzeltme paketleri olarak hazırlanmıştır. Canlı sitedeki sürüm, GitHub'a son yüklenen dosyalara bağlıdır.</p></div><div class="about-panel"><h2>🙏 Teşekkürler</h2><p>Bu platformun gelişmesinde emeği geçen öğretmenlere, yöneticilere, öğrencilere ve velilere teşekkür ederiz. Oynanan her oyun, cevaplanan her soru ve paylaşılan her geri bildirim bu akademiyi daha da geliştiriyor.</p></div></section>`)}
function badges(){let won=Object.keys(progress).filter(k=>progress[k]?.wins).length;el(`<h1>🏅 Başarı Rozetleri</h1><p>Bir oyunu tamamladığında ilgili rozetin açılır. İlerlemen sadece bu cihazın tarayıcısında tutulur.</p><div class="badges">${catalog.map(g=>`<div class="badgecard ${progress[g.id]?.wins?'':'locked'}"><div class="emoji">${g.emoji}</div><h3>${esc(g.title)}</h3><p>${progress[g.id]?.wins?'🏅 Kazanıldı':'🔒 Henüz kazanılmadı'}</p></div>`).join('')}</div><p>${won}/${catalog.length} rozet</p>`)}
function info(){el(`<h1>💡 Bilgi Köşesi</h1><p>Oyunlardan öğrendiğimiz beceriler gerçek yaşamda da işimize yarar.</p><div class="cards">${[['🎨','Görselleri tanıma','Bilgisayarlar renk ve şekil örüntülerini ayırt etmeyi öğrenebilir.'],['🔊','Sesleri ayırma','Sesleri dikkatle dinlemek ve karşılaştırmak, öğrenmenin önemli bir parçasıdır.'],['🔢','Örüntüleri keşfetme','Sayıların ve şekillerin kurallarını fark etmek problem çözmeye yardımcı olur.'],['🤝','Dijital güvenlik','Kişisel bilgilerini herkesle paylaşma; rahatsız olduğunda güvenilir bir yetişkine söyle.'],['🧩','Algoritma','Bir işi küçük ve anlaşılır adımlara ayırmak, çözümü kolaylaştırır.'],['🔄','Döngüler','Tekrarlanan bir işlemi her defasında yeniden söylemek yerine döngüyle ifade edebiliriz.']].map(x=>`<article class="card"><span class="emoji">${x[0]}</span><h3>${x[1]}</h3><p>${x[2]}</p></article>`).join('')}</div>`)}
function admin(){el(`<h1>⚙️ Yönetim Alanı — Yerel Demo</h1><div class="alert"><strong>Önemli:</strong> Bu bölüm gerçek, şifre korumalı bir yönetim paneli değildir. Burada yaptığınız değişiklikler yalnızca bu tarayıcıda saklanır; diğer kullanıcıların sitesini değiştirmez. Öğrenci hesabı ve merkezi raporlama içermez. Gerçek yayında yönetim yetkileri için kimlik doğrulama ve sunucu gerekir.</div><h2>Oyun başlıklarını ve görünürlüğünü dene</h2><section class="panel">${catalog.map((g,i)=>`<div class="formline"><label style="width:120px">${g.emoji} Oyun ${i+1}</label><input aria-label="Oyun ${i+1} başlığı" id="title${i}" value="${esc(g.title)}"><label><input type="checkbox" id="enabled${i}" ${g.enabled?'checked':''}> Etkin</label></div>`).join('')}<div class="tools">${btn('Değişiklikleri Bu Cihazda Kaydet','saveAdmin()')}${btn('Varsayılanlara Dön','resetAdmin()','secondary')}</div></section>`)}
function saveAdmin(){catalog=catalog.map((g,i)=>({...g,title:document.getElementById('title'+i).value.trim().slice(0,75)||g.title,enabled:document.getElementById('enabled'+i).checked}));store('catalog',catalog);alert('Yalnızca bu cihazda kaydedildi.');render()}
function resetAdmin(){if(!confirm('Bu cihazdaki oyun başlığı değişiklikleri sıfırlansın mı?'))return;catalog=defaults.map(x=>({...x}));store('catalog',catalog);render()}
function say(message){if(!('speechSynthesis'in window)){alert('Bu tarayıcı seslendirmeyi desteklemiyor.');return}let u=new SpeechSynthesisUtterance(message);u.lang='tr-TR';u.rate=.75;speechSynthesis.speak(u)}
let ac;function tone(freq,duration=.2,type='sine',at=0){try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();let o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=freq;o.connect(g);g.connect(ac.destination);let t=ac.currentTime+at;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.16,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.start(t);o.stop(t+duration+.03)}catch{}}
function instrument(kind){if(kind===0)[262,330,392].forEach((f,i)=>tone(f,.3,'sine',i*.34));if(kind===1)[85,110,85].forEach((f,i)=>tone(f,.12,'triangle',i*.23));if(kind===2)[740,830,988].forEach((f,i)=>tone(f,.32,'sine',i*.36))}
function tempo(fast){[0,1,2,3].forEach(i=>tone(180,.08,'square',i*(fast?.22:.65)))}
render();
