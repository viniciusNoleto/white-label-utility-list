import { useMemo } from "react";
import { useTranslation } from 'react-i18next';
import type { ScheduleLabelsOverride } from '@mantine/schedule';

export function useScheduleLabels() {
  const { t, i18n: { language: locale } } = useTranslation();

  const scheduleLabels: ScheduleLabelsOverride = useMemo(() => ({
    today: t('events.scheduleLabels.today'),
    next: t('events.scheduleLabels.next'),
    previous: t('events.scheduleLabels.previous'),
    more: t('events.scheduleLabels.more'),
    day: t('events.scheduleLabels.day'),
    week: t('events.scheduleLabels.week'),
    month: t('events.scheduleLabels.month'),
    year: t('events.scheduleLabels.year'),
    allDay: t('events.scheduleLabels.allDay'),
    weekday: t('events.scheduleLabels.weekday'),
    timeSlot: t('events.scheduleLabels.timeSlot'),
    selectMonth: t('events.scheduleLabels.selectMonth'),
    selectYear: t('events.scheduleLabels.selectYear'),
    switchToDayView: t('events.scheduleLabels.switchToDayView'),
    switchToWeekView: t('events.scheduleLabels.switchToWeekView'),
    switchToMonthView: t('events.scheduleLabels.switchToMonthView'),
    switchToYearView: t('events.scheduleLabels.switchToYearView'),
    viewSelectLabel: t('events.scheduleLabels.viewSelectLabel'),
    noEvents: t('events.scheduleLabels.noEvents'),
    moreLabel: (count) => t('events.scheduleLabels.moreLabel', { count }),
  }), [t]);

  return { scheduleLabels, locale };
}