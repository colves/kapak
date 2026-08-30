# Galeri fotoğrafları

Ana sayfadaki **Galeri** bölümünde gösterilen fotoğraflar bu klasörde durur.

## Nasıl eklenir

1. Fotoğrafı bu klasöre kopyalayın (ör. `mutfak-01.jpg`).
2. `js/data/galeri.js` dosyasını açın, bir satırın `dosya` alanına yolunu yazın:

```js
{ dosya: 'assets/galeri/mutfak-01.jpg', baslik: 'Lake mutfak' },
```

`baslik` isteğe bağlıdır — yazılmazsa fotoğrafın altında yazı görünmez.

## Fotoğraf önerisi

- Yatay çekim, yaklaşık **4:3** oran
- Uzun kenar **~1600px** (daha büyüğü siteyi gereksiz yavaşlatır)
- **JPG** formatı

Farklı oranlardaki fotoğraflar da bozulmadan kırpılarak yerleşir
(`object-fit: cover`), ama 4:3'e yakın olanlar en az kırpılır.
