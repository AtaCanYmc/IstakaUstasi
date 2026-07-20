import React from 'react';
import { X, HelpCircle, Copy, Check, ArrowRight } from 'lucide-react';

interface RoboflowGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoboflowGuideModal: React.FC<RoboflowGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: "1. Roboflow Hesabı Oluşturun",
      desc: "Roboflow web sitesine giderek ücretsiz bir geliştirici hesabı açın veya giriş yapın.",
      actionText: "roboflow.com adresine git",
      actionUrl: "https://roboflow.com",
    },
    {
      title: "2. Private API Key'i Kopyalayın",
      desc: "Profil -> Settings -> Workspaces adımları altındaki API Keys bölümünden gizli anahtarınızı alın.",
      example: "rf_xxxxxxxxxxxxxxxxxxxxxxxx",
    },
    {
      title: "3. Workspace Adını Kopyalayın",
      desc: "Roboflow paneline girdiğinizde tarayıcınızın URL kısmında veya Workspace ayarlarında yazar.",
      example: "ata-dc7ry",
    },
    {
      title: "4. Workflow ID'yi Oluşturun",
      desc: "Çalışma alanınızın 'Workflows' menüsünden YOLOv8 taş algılama modelini bağladığınız iş akışını oluşturup ID'sini kopyalayın.",
      example: "okey-and-rummikub-vrummikub-p8akb-vr0ef-3-yolov8n-t1-logic",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-card-bg border border-card-border p-6 shadow-2xl space-y-6 animate-fade-in text-left">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-card-border pb-4">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Roboflow Kurulum Rehberi
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Kendi API anahtarınız ve görsel iş akışınız ile limitsiz tarama yapın.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-bg-secondary text-text-tertiary hover:text-text-primary transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-5">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-4 p-4 rounded-xl bg-bg-secondary/40 border border-card-border/50">
              <div className="flex-1 space-y-2">
                <h4 className="text-xs font-bold text-text-primary flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-black border border-indigo-500/20">
                    {idx + 1}
                  </span>
                  {step.title}
                </h4>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  {step.desc}
                </p>

                {step.example && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-bg-secondary border border-card-border/40 text-[10px] font-mono text-text-tertiary">
                    <span>{step.example}</span>
                    <button
                      onClick={() => copyToClipboard(step.example, idx)}
                      className="p-1 rounded hover:bg-card-bg text-text-tertiary hover:text-text-primary transition-all cursor-pointer"
                      title="Kopyala"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {step.actionUrl && (
                  <a
                    href={step.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-500 hover:text-indigo-400 font-bold transition-all"
                  >
                    {step.actionText}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Workflow Info Section */}
        <div className="p-4 rounded-xl bg-indigo-950/20 dark:bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-300 space-y-2 leading-relaxed">
          <h5 className="font-bold flex items-center gap-1.5 text-indigo-400">
            <SparklesIcon />
            İş Akışımız (Workflow) Nasıl Çalışır?
          </h5>
          <p className="text-[11px]">
            Roboflow Workflow, yüklediğiniz ıstaka görselini önce <strong>YOLOv8</strong> nesne algılama modelimizle tarar. Algılanan taş koordinatları, renkleri ve değerleri etiketlenerek JSON biçiminde FastAPI sunucumuza aktarılır. Sunucu bu koordinat dizilerini matematiksel Okey solver algoritmalarına besleyerek en yüksek skorlu dizilimleri hesaplar.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Anladım
          </button>
        </div>
      </div>
    </div>
  );
};

// Mini Sparkles SVG Helper
const SparklesIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);
