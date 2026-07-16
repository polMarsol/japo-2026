// Google Material Symbols, self-hosted como SVG (offline, sin depender de
// Google Fonts CDN). Cada icono se importa como texto crudo y hereda color
// via CSS (ver la regla ".gicon svg" en index.css).
import iconHome from "@material-symbols/svg-400/outlined/home.svg?raw";
import iconCalendarMonth from "@material-symbols/svg-400/outlined/calendar_month.svg?raw";
import iconHotel from "@material-symbols/svg-400/outlined/hotel.svg?raw";
import iconMap from "@material-symbols/svg-400/outlined/map.svg?raw";
import iconLocationOn from "@material-symbols/svg-400/outlined/location_on.svg?raw";
import iconOpenInNew from "@material-symbols/svg-400/outlined/open_in_new.svg?raw";
import iconFlag from "@material-symbols/svg-400/outlined/flag.svg?raw";
import iconDirectionsCar from "@material-symbols/svg-400/outlined/directions_car.svg?raw";
import iconExplore from "@material-symbols/svg-400/outlined/explore.svg?raw";
import iconRoute from "@material-symbols/svg-400/outlined/route.svg?raw";
import iconPayments from "@material-symbols/svg-400/outlined/payments.svg?raw";
import iconDescription from "@material-symbols/svg-400/outlined/description.svg?raw";
import iconChecklist from "@material-symbols/svg-400/outlined/checklist.svg?raw";
import iconFlightTakeoff from "@material-symbols/svg-400/outlined/flight_takeoff.svg?raw";
import iconSportsScore from "@material-symbols/svg-400/outlined/sports_score.svg?raw";
import iconDirectionsBus from "@material-symbols/svg-400/outlined/directions_bus.svg?raw";
import iconStraighten from "@material-symbols/svg-400/outlined/straighten.svg?raw";
import iconSchedule from "@material-symbols/svg-400/outlined/schedule.svg?raw";
import iconDirectionsWalk from "@material-symbols/svg-400/outlined/directions_walk.svg?raw";
import iconWarning from "@material-symbols/svg-400/outlined/warning.svg?raw";
import iconLightbulb from "@material-symbols/svg-400/outlined/lightbulb.svg?raw";
import iconAutoStories from "@material-symbols/svg-400/outlined/auto_stories.svg?raw";
import iconAddAPhoto from "@material-symbols/svg-400/outlined/add_a_photo.svg?raw";
import iconImage from "@material-symbols/svg-400/outlined/image.svg?raw";
import iconLightMode from "@material-symbols/svg-400/outlined/light_mode.svg?raw";
import iconDarkMode from "@material-symbols/svg-400/outlined/dark_mode.svg?raw";
import iconTranslate from "@material-symbols/svg-400/outlined/translate.svg?raw";
import iconCheckCircle from "@material-symbols/svg-400/outlined/check_circle.svg?raw";
import iconRadioButtonUnchecked from "@material-symbols/svg-400/outlined/radio_button_unchecked.svg?raw";
import iconEditNote from "@material-symbols/svg-400/outlined/edit_note.svg?raw";
import iconChevronLeft from "@material-symbols/svg-400/outlined/chevron_left.svg?raw";
import iconKeyboardArrowDown from "@material-symbols/svg-400/outlined/keyboard_arrow_down.svg?raw";
import iconViewAgenda from "@material-symbols/svg-400/outlined/view_agenda.svg?raw";
import iconViewCarousel from "@material-symbols/svg-400/outlined/view_carousel.svg?raw";
import iconNearMe from "@material-symbols/svg-400/outlined/near_me.svg?raw";
import iconLock from "@material-symbols/svg-400/outlined/lock.svg?raw";
import iconBackspace from "@material-symbols/svg-400/outlined/backspace.svg?raw";
import iconLogout from "@material-symbols/svg-400/outlined/logout.svg?raw";

const ICONS = {
  home: iconHome,
  calendar_month: iconCalendarMonth,
  hotel: iconHotel,
  map: iconMap,
  location_on: iconLocationOn,
  open_in_new: iconOpenInNew,
  flag: iconFlag,
  directions_car: iconDirectionsCar,
  explore: iconExplore,
  route: iconRoute,
  payments: iconPayments,
  description: iconDescription,
  checklist: iconChecklist,
  flight_takeoff: iconFlightTakeoff,
  sports_score: iconSportsScore,
  directions_bus: iconDirectionsBus,
  straighten: iconStraighten,
  schedule: iconSchedule,
  directions_walk: iconDirectionsWalk,
  warning: iconWarning,
  lightbulb: iconLightbulb,
  auto_stories: iconAutoStories,
  add_a_photo: iconAddAPhoto,
  image: iconImage,
  light_mode: iconLightMode,
  dark_mode: iconDarkMode,
  translate: iconTranslate,
  check_circle: iconCheckCircle,
  radio_button_unchecked: iconRadioButtonUnchecked,
  edit_note: iconEditNote,
  chevron_left: iconChevronLeft,
  keyboard_arrow_down: iconKeyboardArrowDown,
  view_agenda: iconViewAgenda,
  view_carousel: iconViewCarousel,
  near_me: iconNearMe,
  lock: iconLock,
  backspace: iconBackspace,
  logout: iconLogout,
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <span
      className={`gicon inline-flex shrink-0 ${className}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICONS[name] }}
    />
  );
}
