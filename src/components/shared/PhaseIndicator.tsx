import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Clock, Layers, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

interface PhaseIndicatorProps {
  moduleName: string;
  plannedPhase: string;
  description: string;
  features: string[];
}

export const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({
  moduleName,
  plannedPhase,
  description,
  features,
}) => {
  return (
    <div className="mx-auto max-w-2xl py-8">
      <Card className="border-dashed border-2 border-primary/20 bg-primary/[0.02]">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Layers className="h-7 w-7" />
          </div>

          <Badge variant="default" className="mb-3 px-3 py-1 text-xs">
            {plannedPhase} Kapsamında Geliştirilecek
          </Badge>

          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {moduleName} Modülü
          </h2>

          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            {description}
          </p>

          <div className="mt-6 rounded-xl border border-border bg-card p-4 text-left">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              <Clock className="h-3.5 w-3.5" />
              <span>Planlanan Fonksiyonlar ({plannedPhase})</span>
            </div>
            <ul className="space-y-2 text-sm text-foreground/90">
              {features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <Link to="/camp">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Kamp Takvimine Dön</span>
              </Button>
            </Link>
            <Link to="/">
              <Button size="sm">Dashboard'a Git</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
