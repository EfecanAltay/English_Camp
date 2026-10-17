import React from 'react';
import { PhaseIndicator } from '../../../components/shared/PhaseIndicator';

export const ReadingPage: React.FC = () => {
  return (
    <PhaseIndicator
      moduleName="Reading (Akademik Okuma & Metin Analizi)"
      plannedPhase="Faz 4"
      description="Bilim, sosyal ve sağlık alanlarından seçilmiş akademik paragraflar, interaktif kelime seçimi ve sınav tipi kavrama soruları."
      features={[
        'Seviyeli Metin Player: Rahat okunur tipografi ve mobil uyumlu paragraf düzeni',
        'Tıklanabilir Kelimeler: Bilinmeyen kelimeye tıklayarak doğrudan Vocabulary tekrar havuzuna ekleme (kaynak metin referanslı)',
        'Okuma Süresi Sayacı & WPM (Words Per Minute) Hesaplama',
        'Metne Dayalı Soru Çözümü: Ana fikir, çıkarım ve yazar tutumu soruları',
      ]}
    />
  );
};
