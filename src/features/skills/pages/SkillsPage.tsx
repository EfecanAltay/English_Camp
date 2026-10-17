import React from 'react';
import { PhaseIndicator } from '../../../components/shared/PhaseIndicator';

export const SkillsPage: React.FC = () => {
  return (
    <PhaseIndicator
      moduleName="Skills (Soru Tipleri & Çözüm Stratejileri)"
      plannedPhase="Faz 5"
      description="YDS/YÖKDİL sınavında puan kazandıran spesifik soru türleri ve süreli deneme modları."
      features={[
        'Soru Kategorileri: Cloze Test, Cümle Tamamlama, Çeviri, Paragraf Tamamlama, Diyalog ve Akışı Bozan Cümle',
        'Strateji Rehberi: Her soru türü için hızlı eleme taktikleri ve tuzak tespitleri',
        'Süreli Test Modu: Gerçek sınav baskısını simüle eden geri sayım sayacı',
        'Detaylı Çözüm İpuçları ve Doğru Yanıt Mantığı',
      ]}
    />
  );
};
