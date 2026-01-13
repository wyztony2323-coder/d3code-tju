import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  zh: {
    translation: {
      "title": "天津大学校史 · 3D 时间长卷",
      "scroll_hint": "滚动鼠标探索百年校史",
      "major_count": "专业数量",
      "student_total": "当年人数",
      "career": "主流去向"
    }
  },
  en: {
    translation: {
      "title": "TJU History · 3D Scroll",
      "scroll_hint": "Scroll to explore history",
      "major_count": "Majors",
      "student_total": "Students",
      "career": "Main Career"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "zh", // 默认语言
    interpolation: { escapeValue: false }
  });

export default i18n;