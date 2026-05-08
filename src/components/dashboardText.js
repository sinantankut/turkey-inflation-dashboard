const DASHBOARD_TEXT = {
  tr: {
    locale: 'tr',
    title: 'Türkiye Enflasyon Gösterge Paneli',
    subtitle: 'TÜİK, ENAG ve İTO enflasyon serilerinin karşılaştırmalı görünümü.',
    lastDataLabel: 'Son veri',
    periodLabel: 'Dönem',
    periodAverageLabel: 'Dönem ort.',
    periodAverageFullLabel: 'Dönem ortalaması',
    recentMonthsTitle: 'Son 12 ay',
    tableMonthHeader: 'Ay',
    differenceTitle: 'Kaynak farkı',
    latestMonthFallback: 'Son ay',
    differenceSubtitleSeparator: 've',
    sourceFooter: "Veri kaynakları: TÜİK ve İTO verileri kurumların yayımladığı serilerden; ENAG verileri ENAG'ın kamuya açık duyurularından derlenmiştir.",
    rightsFooter: 'Tüm hakları saklıdır.',
    error: {
      title: 'Veri Yüklenirken Hata Oluştu',
      body: 'Enflasyon verilerini yüklerken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.',
      retry: 'Yeniden Dene'
    },
    loading: {
      title: 'Türkiye Enflasyon Gösterge Paneli',
      body: 'Enflasyon verileri yükleniyor...',
      description: 'Bu gösterge paneli TÜİK, ENAG ve İTO enflasyon verilerini karşılaştırmalı olarak sunmaktadır.'
    },
    mode: {
      monthly: {
        label: 'Aylık',
        title: 'Aylık karşılaştırma',
        description: 'Bir önceki aya göre değişim'
      },
      annual: {
        label: 'Yıllık',
        title: 'Yıllık karşılaştırma',
        description: '12 aylık değişim oranı'
      },
      difference: {
        label: 'Fark',
        title: 'Kaynak farkı',
        description: 'Kaynaklar arasındaki puan farkı'
      }
    },
    months: {
      Oca: 'Oca',
      Şub: 'Şub',
      Mar: 'Mar',
      Nis: 'Nis',
      May: 'May',
      Haz: 'Haz',
      Tem: 'Tem',
      Ağu: 'Ağu',
      Eyl: 'Eyl',
      Eki: 'Eki',
      Kas: 'Kas',
      Ara: 'Ara'
    },
    units: {
      points: 'puan'
    }
  },
  en: {
    locale: 'en',
    title: 'Turkey Inflation Dashboard',
    subtitle: 'A comparative view of TÜİK, ENAG, and İTO inflation series.',
    lastDataLabel: 'Latest data',
    periodLabel: 'Period',
    periodAverageLabel: 'Period avg.',
    periodAverageFullLabel: 'Period average',
    recentMonthsTitle: 'Last 12 months',
    tableMonthHeader: 'Month',
    differenceTitle: 'Source gap',
    latestMonthFallback: 'Latest month',
    differenceSubtitleSeparator: 'and',
    sourceFooter: 'Data sources: TÜİK and İTO figures are compiled from institutional series; ENAG figures are compiled from ENAG public releases.',
    rightsFooter: 'All rights reserved.',
    error: {
      title: 'Error Loading Data',
      body: 'There was a problem loading the inflation data. Please try again later.',
      retry: 'Try Again'
    },
    loading: {
      title: 'Turkey Inflation Dashboard',
      body: 'Loading inflation data...',
      description: 'This dashboard presents a comparative view of TÜİK, ENAG, and İTO inflation data.'
    },
    mode: {
      monthly: {
        label: 'Monthly',
        title: 'Monthly comparison',
        description: 'Change from the previous month'
      },
      annual: {
        label: 'Annual',
        title: 'Annual comparison',
        description: '12-month change rate'
      },
      difference: {
        label: 'Gap',
        title: 'Source gap',
        description: 'Point difference between sources'
      }
    },
    months: {
      Oca: 'Jan',
      Şub: 'Feb',
      Mar: 'Mar',
      Nis: 'Apr',
      May: 'May',
      Haz: 'Jun',
      Tem: 'Jul',
      Ağu: 'Aug',
      Eyl: 'Sep',
      Eki: 'Oct',
      Kas: 'Nov',
      Ara: 'Dec'
    },
    units: {
      points: 'pp'
    }
  }
};

export function getDashboardLocale(env = {}) {
  const locale = String(env.VITE_DASHBOARD_LOCALE ?? '').trim().toLowerCase();
  return locale === 'en' || locale === 'english' ? 'en' : 'tr';
}

export function getDashboardText(locale = 'tr') {
  return DASHBOARD_TEXT[locale] ?? DASHBOARD_TEXT.tr;
}

export function formatDateLabel(date, text = DASHBOARD_TEXT.tr) {
  if (!date) return 'N/A';

  const [month, year] = String(date).split(' ');
  return text.months?.[month] && year ? `${text.months[month]} ${year}` : date;
}

export function formatRangeLabel(rangeLabel, text = DASHBOARD_TEXT.tr) {
  if (!rangeLabel) return '';

  return rangeLabel
    .split(' - ')
    .map((date) => formatDateLabel(date, text))
    .join(' - ');
}
