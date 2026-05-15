// emeli-widget.js — Scriptable.app widget for Emeli
// ─────────────────────────────────────────────────
// 1. Установи Scriptable из App Store.
// 2. Создай новый скрипт и вставь сюда весь этот код.
// 3. В Emeli открой Настройки → «Экспорт для виджета».
//    Сохрани файл `emeli-widget.json` в Файлы → iCloud Drive → Scriptable.
// 4. Добавь Scriptable-виджет на главный экран и выбери этот скрипт.
//
// При обновлении прогресса повтори шаг 3 (виджет читает локальный JSON).

const FILE = 'emeli-widget.json';
const APP_URL = 'https://emaxx7-cmd.github.io/emelink/';

const fm = FileManager.iCloud();
const path = fm.joinPath(fm.documentsDirectory(), FILE);

let data = null;
try {
  if (fm.fileExists(path)) {
    if (!fm.isFileDownloaded(path)) await fm.downloadFileFromiCloud(path);
    data = JSON.parse(fm.readString(path));
  }
} catch (e) {
  // ignore
}

const widget = new ListWidget();
widget.backgroundColor = new Color('#0a0a0f');
widget.url = APP_URL;
widget.setPadding(14, 14, 14, 14);

// Subtle accent gradient
const grad = new LinearGradient();
grad.colors = [new Color('#1a1730'), new Color('#0a0a0f')];
grad.locations = [0, 1];
widget.backgroundGradient = grad;

if (!data || !Array.isArray(data.habits)) {
  // Empty state
  const t = widget.addText('Emeli');
  t.font = Font.boldSystemFont(16);
  t.textColor = new Color('#ffffff');
  widget.addSpacer(6);
  const sub = widget.addText('Открой настройки → «Экспорт для виджета» и сохрани в Scriptable.');
  sub.font = Font.systemFont(11);
  sub.textColor = new Color('#9a9aae');
  Script.setWidget(widget);
  Script.complete();
  return;
}

const today = data.today;
const habits = data.habits;
const doneCount = habits.filter(h => h.doneToday).length;
const total = habits.length;
const pct = total ? Math.round((doneCount / total) * 100) : 0;

// Header row
const headerRow = widget.addStack();
headerRow.layoutHorizontally();
headerRow.centerAlignContent();

const title = headerRow.addText('Сегодня');
title.font = Font.semiboldSystemFont(13);
title.textColor = new Color('#9a9aae');

headerRow.addSpacer();

const cnt = headerRow.addText(`${doneCount} / ${total}`);
cnt.font = Font.boldRoundedSystemFont(15);
cnt.textColor = new Color('#ffffff');

widget.addSpacer(6);

// Progress bar
const barBg = widget.addStack();
barBg.size = new Size(0, 6);
barBg.backgroundColor = new Color('#25253a');
barBg.cornerRadius = 3;

const barFill = barBg.addStack();
barFill.size = new Size(0, 6);
barFill.backgroundColor = new Color('#a78bfa');
barFill.cornerRadius = 3;
// Width is set by layout: use a spacer trick
// (Scriptable doesn't support relative widths, so we approximate)

widget.addSpacer(8);

// Habit rows (up to 4)
const maxRows = Math.min(habits.length, total <= 4 ? 4 : 4);
for (let i = 0; i < maxRows; i++) {
  const h = habits[i];
  const row = widget.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();
  row.spacing = 8;

  const icon = row.addText(h.icon);
  icon.font = Font.systemFont(13);

  const name = row.addText(h.name);
  name.font = Font.mediumSystemFont(12);
  name.textColor = new Color(h.doneToday ? '#f0f0f5' : '#7a7a8e');
  name.lineLimit = 1;

  row.addSpacer();

  if (h.streak > 0) {
    const fire = row.addText(`● ${h.streak}`);
    fire.font = Font.semiboldRoundedSystemFont(11);
    fire.textColor = new Color(h.color || '#a78bfa');
  }

  if (h.doneToday) {
    const dot = row.addText('✓');
    dot.font = Font.boldSystemFont(12);
    dot.textColor = new Color('#4ade80');
  }

  if (i < maxRows - 1) widget.addSpacer(4);
}

if (habits.length > maxRows) {
  widget.addSpacer(4);
  const more = widget.addText(`+ ещё ${habits.length - maxRows}`);
  more.font = Font.systemFont(10);
  more.textColor = new Color('#5e5e75');
}

// Footer
widget.addSpacer();
const footer = widget.addStack();
footer.layoutHorizontally();
const fd = footer.addText(today);
fd.font = Font.systemFont(9);
fd.textColor = new Color('#5e5e75');
footer.addSpacer();
const fpct = footer.addText(`${pct}%`);
fpct.font = Font.semiboldRoundedSystemFont(9);
fpct.textColor = new Color('#a78bfa');

Script.setWidget(widget);
widget.presentMedium();
Script.complete();
