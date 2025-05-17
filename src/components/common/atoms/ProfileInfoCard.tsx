import useCustomTheme from '@/hooks/useCustomTheme';
import useLanguage from '@/hooks/useLanguage';
import { LucideIcon } from 'lucide-react';

interface PersonalInfoCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number | undefined;
}

const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({ icon: Icon, label, value }) => {
  const {t, currentLanguage} = useLanguage()
  const {isLightMode} = useCustomTheme()
  const isRTL = currentLanguage === "ar";
  
  return(
    <div className={`flex items-center gap-4 p-4 bg-secondary rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-300 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <div className="p-3 bg-tblack rounded-lg shadow-md">
        <Icon className="w-5 h-5 text-twhite" />
      </div>
      <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
        <p className={`text-sm ${isLightMode ? "text-slate-600":"text-gray-400"}`}>{t(label)}</p>
        <p className="text-twhite font-semibold text-lg">{value || t("Not Available")}</p>
      </div>
    </div>
  )
};

export default PersonalInfoCard
