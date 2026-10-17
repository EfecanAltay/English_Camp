import { RotateCcw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export const ReviewPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Tekrar Merkezi (Review Queue)"
        description="Yanlış çözülen sorular ve aralıklı tekrar sırası gelen kelimeler bu havuzda toplanır."
      />

      <Card className="border-dashed border-2">
        <CardContent className="p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <RotateCcw className="h-7 w-7" />
          </div>

          <h3 className="text-xl font-bold">Tekrar Havuzu Hazırlanıyor</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Faz 2 (Grammar Quiz) ve Faz 3 (Vocabulary Flashcards) devreye girdiğinde, yanlış cevaplanan sorular ve günü gelen kelime kartları burada otomatik olarak listelenecektir.
          </p>

          <div className="pt-2">
            <Link to="/camp">
              <Button size="sm" variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Kamp Görevlerine Dön</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
