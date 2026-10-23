import { paylasimMetniOlustur } from './paylasim.js';

export const ILETISIM_NUMARASI = '905336639714';
export const GENEL_WHATSAPP_MESAJI = 'Merhaba, Şahinkaya Mobilya lake kapak modelleri hakkında bilgi almak istiyorum.';

export function whatsappAdresiOlustur(secim) {
    const mesaj = secim
        ? `Merhaba, aşağıdaki lake kapak seçimi için bilgi ve teklif almak istiyorum.\n\n${paylasimMetniOlustur(secim)}\n\nProjemin özel ölçülerini ayrıca paylaşacağım.`
        : GENEL_WHATSAPP_MESAJI;
    return `https://wa.me/${ILETISIM_NUMARASI}?text=${encodeURIComponent(mesaj)}`;
}
