import React, { useState, useEffect } from 'react';
import {
  Download,
  Upload,
  Trash2,
  HardDrive,
  ShieldCheck,
  Moon,
  Sun,
  Laptop,
  AlertTriangle,
  CheckCircle2,
  Cookie,
  SlidersHorizontal,
  RotateCcw,
  Video,
  Settings2,
} from 'lucide-react';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useCookieConsent } from '../../../hooks/useCookieConsent';
import { backupService } from '../../../core/storage/backup.service';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const cookieConsent = useCookieConsent();

  // Storage Persistence Status
  const [isPersisted, setIsPersisted] = useState<boolean | null>(null);
  const [persistMessage, setPersistMessage] = useState<string>('');

  // Backup state
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');

  useEffect(() => {
    // Check navigator.storage persistence
    if (navigator.storage && navigator.storage.persisted) {
      navigator.storage.persisted().then((persisted) => {
        setIsPersisted(persisted);
      });
    }
  }, []);

  const handleRequestPersistence = async () => {
    if (navigator.storage && navigator.storage.persist) {
      const persisted = await navigator.storage.persist();
      setIsPersisted(persisted);
      setPersistMessage(
        persisted
          ? 'Kalıcı depolama izni verildi. Tarayıcınız veri temizliği yaparken bu sitenin verilerini koruyacaktır.'
          : 'Kalıcı depolama tarayıcınız tarafından onaylanmadı (tarayıcı politikalarına bağlıdır).'
      );
    } else {
      setPersistMessage('Tarayıcınız StorageManager persist API desteklemiyor.');
    }
  };

  const handleExportBackup = async () => {
    try {
      const json = await backupService.exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `english-camp-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setFeedback({ type: 'success', message: 'Yedek dosyası başarıyla indirildi.' });
    } catch (err) {
      setFeedback({ type: 'error', message: `Dışa aktarma hatası: ${(err as Error).message}` });
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const res = await backupService.importBackup(content);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Yedek başarıyla geri yüklendi! (${res.counts?.tasks || 0} görev kaydı aktarıldı).`,
        });
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    };
    reader.readAsText(file);
    // Reset file input value to allow selecting same file again if needed
    e.target.value = '';
  };

  const handleResetData = async () => {
    if (resetConfirmInput !== 'SIFIRLA') {
      setFeedback({ type: 'error', message: 'Onaylamak için tam olarak "SIFIRLA" yazmalısınız.' });
      return;
    }

    await backupService.resetAllData();
    setIsResetConfirmOpen(false);
    setResetConfirmInput('');
    setFeedback({ type: 'success', message: 'Tüm öğrenme verileri ve ilerleme başarıyla sıfırlandı.' });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Ayarlar & Veri Yönetimi"
        description="Görünüm tercihleri, çevrimdışı IndexedDB depolama durumu ve güvenli yedekleme."
      />

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start gap-3 border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{feedback.message}</div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-bold underline opacity-80 hover:opacity-100"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Theme Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Görünüm & Tema</CardTitle>
          <CardDescription className="text-xs">
            Uygulamanın açık veya koyu mod rengini belirleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                theme === 'light'
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                  : 'border-border bg-card hover:bg-muted text-muted-foreground'
              }`}
            >
              <Sun className="h-5 w-5 mb-1.5 text-primary" />
              <span>Açık Tema</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                theme === 'dark'
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                  : 'border-border bg-card hover:bg-muted text-muted-foreground'
              }`}
            >
              <Moon className="h-5 w-5 mb-1.5 text-primary" />
              <span>Koyu Tema</span>
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                theme === 'system'
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                  : 'border-border bg-card hover:bg-muted text-muted-foreground'
              }`}
            >
              <Laptop className="h-5 w-5 mb-1.5 text-slate-500" />
              <span>Sistem</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Local Storage & IndexedDB Explanation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-emerald-500" />
              <span>Depolama & Gizlilik Mimarisi</span>
            </CardTitle>
            <Badge variant="success" className="text-xs">
              Tamamen Çevrimdışı (Local-First)
            </Badge>
          </div>
          <CardDescription className="text-xs leading-relaxed mt-1">
            Öğrenme verileriniz (görev durumları, soru çözümleri, kelime tekrarları) hiçbir harici sunucuya veya üçüncü tarafa gönderilmez; yalnızca bu cihazdaki tarayıcının IndexedDB veritabanında tutulur.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-muted/60 border border-border/60 leading-relaxed text-muted-foreground">
            <strong>Önemli Uyarı:</strong> Tarayıcı geçmişini tamamen temizlemek, gizli sekmede (incognito) çalışmak veya cihaz değiştirmek verilerinizin kaybolmasına sebep olabilir. İlerlemenizi korumak için periyodik olarak JSON yedeğinizi indirmenizi öneririz.
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div>
              <div className="font-semibold text-foreground">
                Kalıcı Depolama İzni (Persistent Storage)
              </div>
              <div className="text-muted-foreground">
                Durum: {isPersisted === true ? 'Kalıcı İzin Aktif' : isPersisted === false ? 'Standart Depolama' : 'Bilinmiyor'}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRequestPersistence}
              className="gap-1.5 text-xs h-8"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>Kalıcılık Talep Et</span>
            </Button>
          </div>
          {persistMessage && (
            <p className="text-[11px] text-muted-foreground">{persistMessage}</p>
          )}
        </CardContent>
      </Card>

      {/* Cookie & Storage Permissions (KVKK & GDPR) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Cookie className="h-4 w-4 text-primary" />
              <span>Çerez ve İzin Tercihleri</span>
            </CardTitle>
            <Badge
              variant={
                cookieConsent.status === 'accepted_all'
                  ? 'success'
                  : cookieConsent.status === 'essential_only'
                  ? 'warning'
                  : cookieConsent.status === 'customized'
                  ? 'default'
                  : 'outline'
              }
              className="text-xs"
            >
              {cookieConsent.status === 'accepted_all' && 'Tüm İzinler Verildi'}
              {cookieConsent.status === 'essential_only' && 'Yalnızca Gerekli'}
              {cookieConsent.status === 'customized' && 'Özel Tercihler'}
              {cookieConsent.status === 'pending' && 'Onay Bekleniyor'}
            </Badge>
          </div>
          <CardDescription className="text-xs leading-relaxed mt-1">
            KVKK ve GDPR standartlarına uygun olarak; çevrimdışı IndexedDB veritabanı, YouTube ders videoları ve kişisel deneyim tercihlerinizi buradan yönetebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2.5">
            {/* Category 1: Zorunlu */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <HardDrive className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground flex items-center gap-2">
                    <span>Zorunlu Yerel Depolama (IndexedDB / LocalStorage)</span>
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                      Her Zaman Aktif
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Çözdüğünüz sorular, kamp tamamlama durumları ve tema ayarlarınız cihazınızda saklanır.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">Zorunlu</span>
            </div>

            {/* Category 2: YouTube Media */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Video className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">
                    Ders Videoları & YouTube Medyası
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    YouTube üzerinden video derslerin gömülü oynatılması ve bölüm atlamaları.
                  </p>
                </div>
              </div>
              <Button
                variant={cookieConsent.preferences.media ? 'outline' : 'secondary'}
                size="sm"
                onClick={() =>
                  cookieConsent.saveCustomPreferences({
                    media: !cookieConsent.preferences.media,
                  })
                }
                className="text-xs h-7 px-3 shrink-0 ml-2"
              >
                {cookieConsent.preferences.media ? 'İzin Verildi' : 'Devre Dışı'}
              </Button>
            </div>

            {/* Category 3: Preferences */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Settings2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">
                    Arayüz Tercihleri & Sinema Modu
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Genişletilmiş video sinema modu ve son izlenen bölüm konumunun hatırlanması.
                  </p>
                </div>
              </div>
              <Button
                variant={cookieConsent.preferences.preferences ? 'outline' : 'secondary'}
                size="sm"
                onClick={() =>
                  cookieConsent.saveCustomPreferences({
                    preferences: !cookieConsent.preferences.preferences,
                  })
                }
                className="text-xs h-7 px-3 shrink-0 ml-2"
              >
                {cookieConsent.preferences.preferences ? 'İzin Verildi' : 'Devre Dışı'}
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-border/60">
            <div className="text-[11px] text-muted-foreground">
              {cookieConsent.consentedAt ? (
                <span>Son Onay: {new Date(cookieConsent.consentedAt).toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
              ) : (
                <span>Henüz tercih kaydedilmedi</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={cookieConsent.resetConsent}
                className="gap-1.5 text-xs h-8 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>İzni Sıfırla</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => cookieConsent.openBanner({ customize: true })}
                className="gap-1.5 text-xs h-8"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                <span>Banner'ı Göster</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={cookieConsent.acceptAll}
                className="text-xs h-8 font-bold"
              >
                Tümünü Kabul Et
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup Import / Export */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Veri Yedekleme & Geri Yükleme</CardTitle>
          <CardDescription className="text-xs">
            İlerlemenizi JSON dosyası olarak kaydedebilir veya başka bir cihaza aktarabilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleExportBackup}
              className="gap-2 flex-1 justify-center text-xs h-10"
            >
              <Download className="h-4 w-4 text-primary" />
              <span>Yedek İndir (JSON Export)</span>
            </Button>

            <label className="flex-1">
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImportFile}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium cursor-pointer transition-colors text-foreground">
                <Upload className="h-4 w-4 text-emerald-500" />
                <span>Yedekten Geri Yükle (JSON Import)</span>
              </div>
            </label>
          </div>
          <p className="text-[11px] text-muted-foreground">
            * İçe aktarılan yedek Zod şeması ile sıkı kontrolden geçer. Bozuk veya uyumsuz dosyalar mevcut kayıtlarınıza zarar vermez.
          </p>
        </CardContent>
      </Card>

      {/* Dangerous Zone: Reset All Data */}
      <Card className="border-rose-500/30 bg-rose-500/[0.02]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            <span>Tüm Verileri Sıfırla (Danger Zone)</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Tüm kamp ilerlemesini, soru geçmişini ve ayarları yerel veritabanından kalıcı olarak siler. Bu işlem geri alınamaz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isResetConfirmOpen ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsResetConfirmOpen(true)}
              className="text-xs"
            >
              Tüm Öğrenme Verilerini Sıfırla...
            </Button>
          ) : (
            <div className="p-4 rounded-xl border border-rose-500/40 bg-card space-y-3">
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                Çift Onay: Bu işlemi gerçekleştirmek için aşağıdaki kutucuğa büyük harflerle <strong>SIFIRLA</strong> yazın.
              </p>
              <input
                type="text"
                placeholder="SIFIRLA"
                value={resetConfirmInput}
                onChange={(e) => setResetConfirmInput(e.target.value)}
                className="w-full sm:w-64 px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleResetData}
                  disabled={resetConfirmInput !== 'SIFIRLA'}
                  className="text-xs h-8"
                >
                  Onayla ve Tamamen Sil
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsResetConfirmOpen(false);
                    setResetConfirmInput('');
                  }}
                  className="text-xs h-8"
                >
                  İptal
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
