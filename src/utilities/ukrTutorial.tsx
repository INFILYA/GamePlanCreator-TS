import MyLogo from "../myLogo/MyLogo";

const enterWord = (
  <>
    <div className="inner-text-wrapper">
      Дякую, що вирішили скористатися послугами моєї програми. Наразі мій проект знаходиться в
      режимі бета-тесту, тому контент буде оновлюватись періодично. На данний момент реальна база
      статистичних даних відсутня, але буде заповнюватися з початком сезону 2023-2024 ПВЛУ.
    </div>
    <div className="inner-image-wrapper">
      <MyLogo />
    </div>
  </>
);
const aboutFirstPage = (
  <>
    <div className="inner-text-wrapper">
      За її допомогою ви зможете швидко та легко складати плани на поєдинки. Також вона допоможе вам
      організувати стратегію для вашої команди. Ви зможете обрати склад з існуючих колективів ПВЛУ,
      обрати стартовий розташунок гравців на майданчику та підкрутити його під свої потреби.
    </div>
    <div className="inner-image-wrapper">
      <img alt="" src="/photos/FirstPage.jpg" />
    </div>
  </>
);
const attackAndService = (
  <>
    <div className="inner-text-wrapper">
      Крім того, програма надасть вам можливість візуалізувати свої плани за допомогою зрозумілого
      графічного інтерфейсу. Відобразити візуально напрямок атак та подач в процентному
      співвідношенні з кожної зони та по кожній позиції усіх гравців ПВЛУ.
    </div>
    <div className="inner-image-wrapper">
      <img alt="" src="/photos/Attack.jpg" />
    </div>
  </>
);
const distribution = (
  <>
    <div className="inner-text-wrapper">
      Також ви зможете відобразити "загрузку" зон пасуючого гравця, щоб максимально ефективно обрати
      стратегію своєї команди для гри на блоці та в захисті. А в майбутньому (наразі я працюю над
      цим), побачити, як буде поводити кожний зв'язуючий ПВЛУ в тій або іншій ситуації.
    </div>
    <div className="inner-image-wrapper">
      <img alt="" src="/photos/Distribution.jpg" />
    </div>
  </>
);
const ratings = (
  <>
    <div className="inner-text-wrapper">
      Рейтинги гравців по позиціях до ваших послуг. При натисканні на заголовок кожної з категорій
      програма відсортує по рейтингу від першого до останнього та навпаки. А також рейтинги по
      командах в цілому.
    </div>
    <div className="inner-image-wrapper">
      <img alt="" src="/photos/Ratings.jpg" />
    </div>
  </>
);
const personalInfo = (
  <>
    <div className="inner-text-wrapper">
      І на додачу , персональна інформація по кожному гравцю з діаграмою ефективності в атаці і на
      подачі. На даний момент наявна інформація більше ніж на 100 гравців.
    </div>
    <div className="inner-image-wrapper">
      <img alt="" src="/photos/PersonalInfo.jpg" />
    </div>
  </>
);
const awarness = (
  <>
    <div className="inner-text-wrapper">
      Повний функціонал програми ви зможете отримати лише за умови простої та безкоштовної
      регестрації через Google , Facebook або @Email.
    </div>
    <div className="inner-image-wrapper">
      <img alt="" src="/photos/Registration.jpg" />
    </div>
  </>
);
const lastWord = (
  <>
    <div className="inner-text-wrapper">
      Моя програма є простою та зрозумілою для розробки ефективної стратегії вашого колективу. Я
      завжди відкритий до отримання вашого фідбеку та пропозицій щодо поліпшення функціоналу. Бажаю
      вам успіхів та вдалого складання планів для вашої команди! З найкращими побажаннями, Пилип
      Гармаш.
    </div>

    <div className="inner-image-wrapper">
      <img alt="" src="/photos/Harmash.jpg" />
    </div>
  </>
);

export const UKRTUTORIAL = [
  lastWord,
  awarness,
  personalInfo,
  ratings,
  distribution,
  attackAndService,
  aboutFirstPage,
  enterWord,
];
