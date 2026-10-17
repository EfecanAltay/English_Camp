import React from 'react';
import { PhaseIndicator } from '../../../components/shared/PhaseIndicator';

export const VocabularyPage: React.FC = () => {
  return (
    <PhaseIndicator
      moduleName="Vocabulary (Kelime Merkezi)"
      plannedPhase="Faz 3"
      description="Akademik kelimeler, phrasal verbs, eş ve zıt anlamlılar; test edilebilir aralıklı tekrar (Spaced Repetition) algoritmasıyla uzun vadeli hafızaya aktarılır."
      features={[
        'İki Yüzlü Flashcard: Türkçe anlam, sözcük türü (noun/verb/adj/adv), örnek cümle ve telaffuz',
        'Eş Anlamlı & Zıt Anlamlı Gruplar: Sınav çeldiricilerini eleme teknikleri',
        'Aralıklı Tekrar Motoru (SM-2 Algoritması): Kolay, Orta, Zor değerlendirmesiyle sonraki tekrar gününü hesaplama',
        'Kelime Testi & Eşleştirme Oyunları',
        'Bilinmeyen Kelimeler Havuzu: Reading modülünden seçilen kelimelerin buraya aktarılması',
      ]}
    />
  );
};
