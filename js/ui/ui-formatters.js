export function createUiFormatters(locale, t) {
  const formatterCache = new Map();

  function getNumberFormatter(minimumFractionDigits, maximumFractionDigits) {
    const key = `${minimumFractionDigits}:${maximumFractionDigits}`;

    if (!formatterCache.has(key)) {
      formatterCache.set(
        key,
        new Intl.NumberFormat(locale, {
          minimumFractionDigits,
          maximumFractionDigits,
        }),
      );
    }

    return formatterCache.get(key);
  }

  const numberFormatter = getNumberFormatter(0, 1);
  const integerFormatter = getNumberFormatter(0, 0);
  const scoreFormatter = getNumberFormatter(1, 2);

  return {
    number(value, digits = 1) {
      return getNumberFormatter(0, digits).format(Number(value ?? 0));
    },
    integer(value) {
      return integerFormatter.format(Number(value ?? 0));
    },
    score(value) {
      return scoreFormatter.format(Number(value ?? 0));
    },
    percent(value) {
      return `${numberFormatter.format(Number(value ?? 0))}%`;
    },
    metric(value, unit, digits = 1) {
      return `${this.number(value, digits)} ${t(`units.${unit}`, undefined, unit)}`;
    },
    labelForStatus(status) {
      return t(`status.${status}`, undefined, status);
    },
    labelForVerdict(verdict) {
      return t(`verdicts.${verdict}`, undefined, verdict);
    },
    statusClass(status) {
      return `status-${status ?? "none"}`;
    },
    scoreWidth(score) {
      return Math.max(0, Math.min(100, Number(score ?? 0) * 10));
    },
  };
}
