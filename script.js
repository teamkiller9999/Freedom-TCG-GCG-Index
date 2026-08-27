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
  document.title = dictionary[document.body.dataset.titleKey || 'pageTitle'];
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = dictionary[element.dataset.i18n];
  });
  document.querySelectorAll('[data-i18n-html]').forEach((element) => {
    element.innerHTML = dictionary[element.dataset.i18nHtml];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    element.placeholder = dictionary[element.dataset.i18nPlaceholder];
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

const dictionarySearch = document.querySelector('#dictionary-search');
const dictionaryRows = document.querySelectorAll('.dict-table tbody tr');
const dictionaryEmpty = document.querySelector('.dict-empty');

if (dictionarySearch) {
  dictionarySearch.addEventListener('input', () => {
    const query = dictionarySearch.value.trim().toLowerCase();
    let visibleCount = 0;
    dictionaryRows.forEach((row) => {
      const matches = row.textContent.toLowerCase().includes(query);
      row.hidden = !matches;
      if (matches) visibleCount += 1;
    });
    if (dictionaryEmpty) dictionaryEmpty.hidden = visibleCount !== 0;
  });
}