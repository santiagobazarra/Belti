import {
  BuildingOfficeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CogIcon,
  ChartBarIcon,
  BeakerIcon,
  ComputerDesktopIcon,
  CurrencyDollarIcon,
  MegaphoneIcon,
  ShieldCheckIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  LightBulbIcon,
  AcademicCapIcon,
  HeartIcon,
  ScaleIcon,
  GlobeAltIcon,
  PhoneIcon,
  ChatBubbleBottomCenterTextIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/24/outline'

// Mapeo de nombres de iconos a componentes de HeroIcons
export const DEPARTMENT_ICONS = {
  BuildingOfficeIcon: {
    component: BuildingOfficeIcon,
    label: 'Oficina'
  },
  UserGroupIcon: {
    component: UserGroupIcon,
    label: 'Equipo'
  },
  BriefcaseIcon: {
    component: BriefcaseIcon,
    label: 'Negocios'
  },
  CogIcon: {
    component: CogIcon,
    label: 'Configuración'
  },
  ChartBarIcon: {
    component: ChartBarIcon,
    label: 'Estadísticas'
  },
  BeakerIcon: {
    component: BeakerIcon,
    label: 'Investigación'
  },
  ComputerDesktopIcon: {
    component: ComputerDesktopIcon,
    label: 'Tecnología'
  },
  CurrencyDollarIcon: {
    component: CurrencyDollarIcon,
    label: 'Finanzas'
  },
  MegaphoneIcon: {
    component: MegaphoneIcon,
    label: 'Marketing'
  },
  ShieldCheckIcon: {
    component: ShieldCheckIcon,
    label: 'Seguridad'
  },
  TruckIcon: {
    component: TruckIcon,
    label: 'Logística'
  },
  WrenchScrewdriverIcon: {
    component: WrenchScrewdriverIcon,
    label: 'Mantenimiento'
  },
  LightBulbIcon: {
    component: LightBulbIcon,
    label: 'Innovación'
  },
  AcademicCapIcon: {
    component: AcademicCapIcon,
    label: 'Formación'
  },
  HeartIcon: {
    component: HeartIcon,
    label: 'Recursos Humanos'
  },
  ScaleIcon: {
    component: ScaleIcon,
    label: 'Legal'
  },
  GlobeAltIcon: {
    component: GlobeAltIcon,
    label: 'Internacional'
  },
  PhoneIcon: {
    component: PhoneIcon,
    label: 'Atención al Cliente'
  },
  ChatBubbleBottomCenterTextIcon: {
    component: ChatBubbleBottomCenterTextIcon,
    label: 'Comunicación'
  },
  PresentationChartLineIcon: {
    component: PresentationChartLineIcon,
    label: 'Ventas'
  }
}

// Obtener el componente de icono por nombre
export const getIconComponent = (iconName) => {
  return DEPARTMENT_ICONS[iconName]?.component || BuildingOfficeIcon
}

// Obtener todos los nombres de iconos disponibles
export const getAvailableIcons = () => {
  return Object.keys(DEPARTMENT_ICONS)
}
