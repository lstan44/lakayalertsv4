import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ReportButtonProps {
  onClick: () => void;
}

export default function ReportButton({ onClick }: ReportButtonProps) {
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      className="bg-red-600 text-white rounded-full px-6 py-3 shadow-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
    >
      <AlertCircle className="h-5 w-5" />
      <span className="font-medium">{t('incident.report.button')}</span>
    </button>
  );
}