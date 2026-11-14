/** Resolve the same synthetic week at either aggregate or hourly resolution. */
export function balanceWeek(profile, mode = "average") {
  if (!["average", "hourly"].includes(mode))
    throw new Error("Unknown balancing resolution");
  if (
    !Number.isSafeInteger(profile.days) ||
    profile.days < 1 ||
    profile.days > 366
  )
    throw new Error("A profile needs a positive whole number of days");
  if (!Array.isArray(profile.periods) || profile.periods.length === 0)
    throw new Error("A profile needs periods");
  let hours = 0;
  let hydroKwh = 0;
  let demandKwh = 0;
  let hourlyImport = 0;
  let hourlyExport = 0;
  let peakImport = 0;
  for (const period of profile.periods) {
    const { hours: duration, hydroKw, loadKw } = period;
    if (
      ![duration, hydroKw, loadKw].every(Number.isSafeInteger) ||
      duration <= 0 ||
      hydroKw < 0 ||
      loadKw < 0
    )
      throw new Error(
        "Periods require positive whole hours and nonnegative whole kW",
      );
    hours += duration;
    hydroKwh += duration * hydroKw * profile.days;
    demandKwh += duration * loadKw * profile.days;
    hourlyImport += duration * Math.max(loadKw - hydroKw, 0) * profile.days;
    hourlyExport += duration * Math.max(hydroKw - loadKw, 0) * profile.days;
    peakImport = Math.max(peakImport, loadKw - hydroKw);
  }
  if (hours !== 24)
    throw new Error("The repeating daily profile must cover exactly 24 hours");
  if (
    ![hydroKwh, demandKwh, hourlyImport, hourlyExport].every(
      Number.isSafeInteger,
    )
  )
    throw new Error("Profile exceeds exact integer energy range");
  const gridImportKwh =
    mode === "hourly" ? hourlyImport : Math.max(demandKwh - hydroKwh, 0);
  return {
    hours: hours * profile.days,
    hydroKwh,
    demandKwh,
    gridImportKwh,
    gridExportKwh:
      mode === "hourly" ? hourlyExport : Math.max(hydroKwh - demandKwh, 0),
    directUseKwh: demandKwh - gridImportKwh,
    peakImportKw: mode === "hourly" ? peakImport : null,
  };
}

export function energyMwh(kwh) {
  return `${(kwh / 1000).toFixed(2)} MWh`;
}

export function explainWeek(result, mode) {
  return mode === "hourly"
    ? `Hourly balancing requires ${energyMwh(result.gridImportKwh)} of imports and still exports ${energyMwh(result.gridExportKwh)} at night. The annual surplus cannot operate a pump at the wrong hour.`
    : `Weekly netting reports ${energyMwh(result.gridImportKwh)} of imports. It lets surplus night generation pay for daytime demand without a physical way to move the energy.`;
}
