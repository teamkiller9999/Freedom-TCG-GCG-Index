const revealItems = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });

revealItems.forEach((item) => revealObserver.observe(item));

const languagePicker = document.querySelector('.language-picker');
const languageButton = document.querySelector('.language');
const languageMenu = document.querySelector('.language-menu');
const currentLanguage = document.querySelector('#current-language');
const defaultLanguage = 'zh-TW';

const setLanguage = (language, translations) => {
  const dictionary = translations[language] || translations[defaultLanguage];

  document.documentElement.lang = language;
  document.title = dictionary.pageTitle;
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = dictionary[element.dataset.i18n];
  });
  document.querySelectorAll('[data-i18n-html]').forEach((element) => {
    element.innerHTML = dictionary[element.dataset.i18nHtml];
  });

  currentLanguage.textContent = dictionary.label;
  languageMenu.querySelectorAll('button').forEach((button) => {
    button.setAttribute('aria-current', String(button.dataset.language === language));
  });
  localStorage.setItem('freedom-tcg-language', language);
};

fetch('lang.json')
  .then((response) => {
    if (!response.ok) throw new Error('Unable to load translations');
    return response.json();
  })
  .then((translations) => {
    Object.entries(translations).forEach(([language, dictionary]) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.role = 'menuitem';
      option.dataset.language = language;
      option.textContent = dictionary.label;
      option.addEventListener('click', () => {
        setLanguage(language, translations);
        languagePicker.classList.remove('open');
        languageButton.setAttribute('aria-expanded', 'false');
      });
      languageMenu.append(option);
    });

    const savedLanguage = localStorage.getItem('freedom-tcg-language');
    const browserLanguage = navigator.language;
    const language = translations[savedLanguage] ? savedLanguage : (translations[browserLanguage] ? browserLanguage : defaultLanguage);
    setLanguage(language, translations);
  })
  .catch(() => {
    currentLanguage.textContent = '繁體中文';
  });

languageButton.addEventListener('click', () => {
  const isOpen = languagePicker.classList.toggle('open');
  languageButton.setAttribute('aria-expanded', String(isOpen));
});

document.addEventListener('click', (event) => {
  if (!languagePicker.contains(event.target)) {
    languagePicker.classList.remove('open');
    languageButton.setAttribute('aria-expanded', 'false');
  }
});