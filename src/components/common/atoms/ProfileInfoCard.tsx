import useCustomTheme from '@/hooks/useCustomTheme';
import useLanguage from '@/hooks/useLanguage';
import { LucideIcon } from 'lucide-react';

interface PersonalInfoCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number | undefined;
}

const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({ icon: Icon, label, value }) => {
    const {t} = useLanguage()
    const {isLightMode} = useCustomTheme()
    return(
  <div className="flex items-center gap-4 p-3 bg-secondary rounded-lg  transition-all">
    <div className="p-2 bg-tblack rounded-lg">
      <Icon className="w-5 h-5 text-twhite" />
    </div>
    <div className="flex-1">
      <p className={ `text-sm  ${isLightMode ? "text-slate-600":"text-slate-400" }`}>{t(label)}</p>
      <p className="text-twhite font-medium">{value || t("Not Available")}</p>
    </div>
  </div>
)};

export default PersonalInfoCard