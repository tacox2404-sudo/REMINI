/**
 * The impact model from Remini_Studio_Impact.xlsx, formula for formula.
 * Inputs are the case data; the scenarios are the workbook's three cases.
 */
const IN = {
  installs: 350_000,
  trialStart: 0.05,
  conversion: 0.2,
  price: 5,
  paidWeeks: 4,
  adPrice: 0.005,
  adsPerFree: 3.8,
  target: 5_000_000,
  discount: 0.09,
  buildMonths: 2,
  testShare: 0.1,
  rolloutShare: 0.5,
  returningBase: 15_000_000 - 350_000 - 98_000,
  baseDecline: 0.05,
  returningTrialRate: 0.00005,
  // Margins tab: AI cost per action and usage per trial user.
  costEnhance: 0.0024,
  costCreation: 0.9 * 0.039 + 0.1 * 0.25,
  storePhoto: 0.001,
  storeCreation: 0.001 * (0.9 + 0.1 * 10),
  enhTrial: 20,
  aiTrial: 4,
  enhWeek: 10,
  aiWeek: 2,
};

export interface Levers {
  /** Relative changes, e.g. 0.1 = +10%. */
  t: number;
  c: number;
  w: number;
  /** New installs from invites per 100 trial users. */
  inv: number;
  /** Growth in enhancement and AI creation usage with Studio. */
  enh: number;
  ai: number;
}

export const SCENARIOS: { id: string; name: string; what: string; v: Levers }[] = [
  { id: 'rush', name: 'Trial rush', what: 'Many more trials from the showcase, but curious users convert worse and leave when the job is done.', v: { t: 0.2, c: -0.05, w: 0, inv: 5, enh: 0.25, ai: 0.15 } },
  { id: 'balanced', name: 'Balanced', what: 'Projects meet the free limit and creating with friends sells the trial; conversion holds as with AI Photos; a few more paid days.', v: { t: 0.1, c: 0, w: 0.06, inv: 5, enh: 0.5, ai: 0.3 } },
  { id: 'engaged', name: 'Engaged', what: 'Fewer extra trials, but people build projects and create with friends: conversion and paid weeks rise, and so does AI usage.', v: { t: 0.07, c: 0.03, w: 0.1, inv: 8, enh: 0.75, ai: 0.5 } },
];

/** Value today of $1 a day, for new users and for the fading base of returning users. */
const FACTORS = (() => {
  let fNew = 0;
  let fRet = 0;
  for (let m = 1; m <= 24; m++) {
    const share = m <= IN.buildMonths ? 0 : m === IN.buildMonths + 1 ? IN.testShare : m === IN.buildMonths + 2 ? IN.rolloutShare : 1;
    const d = 1 / (1 + IN.discount) ** ((m - 0.5) / 12);
    fNew += share * d;
    fRet += share * (1 - IN.baseDecline) ** (m - 1) * d;
  }
  return { fNew: (fNew * 365) / 12, fRet: (fRet * 365) / 12 };
})();

/** Margin after AI compute and storage, per trial (Margins tab). */
function margin(c: number, w: number, enh: number, ai: number) {
  const pw = IN.conversion * (1 + c) * IN.paidWeeks * (1 + w);
  const nEnh = IN.enhTrial * (1 + enh) + pw * IN.enhWeek * (1 + enh);
  const nAi = IN.aiTrial * (1 + ai) + pw * IN.aiWeek * (1 + ai);
  const cost = nEnh * IN.costEnhance + nAi * IN.costCreation + nEnh * IN.storePhoto + nAi * IN.storeCreation;
  return 1 - cost / (pw * IN.price);
}

export function npv(v: Levers) {
  const I = IN.installs;
  const m0 = margin(0, 0, 0, 0);
  const m1 = margin(v.c, v.w, v.enh, v.ai);
  const t1 = IN.trialStart * (1 + v.t);
  const c1 = IN.conversion * (1 + v.c);
  const w1 = IN.paidWeeks * (1 + v.w);
  const r0 = IN.trialStart * IN.conversion * IN.paidWeeks * IN.price;
  const r1 = t1 * c1 * w1 * IN.price;
  const retTrials = IN.returningBase * IN.returningTrialRate;
  const invites = ((I * t1 + retTrials) * v.inv) / 100;

  const perDay = {
    newInstalls: I * (r1 - r0) * m0,
    invites: invites * r1 * m0,
    aiCost: -(I + invites) * r1 * (m0 - m1),
    ads: (invites * (1 - t1) - I * (t1 - IN.trialStart)) * IN.adsPerFree * IN.adPrice,
    returning: retTrials * c1 * w1 * IN.price * m1,
  };
  const parts = {
    newInstalls: perDay.newInstalls * FACTORS.fNew,
    invites: perDay.invites * FACTORS.fNew,
    aiCost: perDay.aiCost * FACTORS.fNew,
    ads: perDay.ads * FACTORS.fNew,
    returning: perDay.returning * FACTORS.fRet,
  };
  const total = parts.newInstalls + parts.invites + parts.aiCost + parts.ads + parts.returning;
  // Hurdle tab: the change in revenue per install needed for the target, at this margin.
  const needPerDay = (IN.target - parts.returning) / FACTORS.fNew;
  const bar = (needPerDay + I * r0 * (m0 - m1)) / m1 / (I * r0);
  const delivered = ((I + invites) * r1) / (I * r0) - 1;
  return { total, parts, m0, m1, bar, delivered, invitesShare: invites / I, target: IN.target };
}
