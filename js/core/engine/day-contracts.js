/* =========================================
   core/engine/day-contracts.js - DAILY DOMAIN CONTRACTS
   ========================================= */

const DayContracts = (() => {
    const toNumber = (value, fallback = 0) => {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    };

    const buildDayTargets = ({ day = '', target = {} } = {}) => ({
        day,
        kcal: toNumber(target.kcal),
        protein: toNumber(Number.isFinite(parseFloat(target.protein)) ? target.protein : target.p),
        carbs: toNumber(Number.isFinite(parseFloat(target.carbs)) ? target.carbs : target.c),
        fat: toNumber(Number.isFinite(parseFloat(target.fat)) ? target.fat : target.f),
        salt: toNumber(target.salt),
        fiber: toNumber(target.fiber),
        sugar: toNumber(target.sugar),
        saturatedFat: toNumber(target.saturatedFat),
        processing: toNumber(target.processing),
        hydrationMin: toNumber(target.hydrationMin),
        hydrationMax: toNumber(target.hydrationMax),
        hydrationBaseMin: toNumber(target.hydrationBaseMin),
        hydrationBaseMax: toNumber(target.hydrationBaseMax),
        hydrationExtra: toNumber(target.hydrationExtra)
    });

    const buildDayIntake = ({ day = '', totals = {}, hydrationDirectMl = null } = {}) => {
        const totalWaterMl = toNumber(totals.waterMl);
        const directWaterMl = hydrationDirectMl === null ? totalWaterMl : toNumber(hydrationDirectMl);
        return {
            day,
            kcal: toNumber(totals.kcal),
            protein: toNumber(totals.protein),
            carbs: toNumber(totals.carbs),
            fat: toNumber(totals.fat),
            salt: toNumber(totals.salt),
            fiber: toNumber(totals.fiber),
            sugar: toNumber(totals.sugar),
            saturatedFat: toNumber(totals.saturatedFat),
            processing: toNumber(totals.processing ?? totals.processingAvg),
            waterMl: totalWaterMl,
            hydrationDirectMl: directWaterMl,
            hydrationTotalMl: totalWaterMl
        };
    };

    const buildDayConsumption = ({ day = '', consumption = {} } = {}) => ({
        day,
        totalKcal: toNumber(consumption.totalKcal),
        trainingKcal: toNumber(consumption.trainingKcal),
        stepsKcal: toNumber(consumption.stepsKcal),
        totalMinutes: toNumber(consumption.totalMinutes),
        trainingMinutes: toNumber(consumption.trainingMinutes),
        stepsMinutes: toNumber(consumption.stepsMinutes),
        metAvg: toNumber(consumption.metAvg),
        intensityAvg: toNumber(consumption.intensityAvg)
    });

    const buildDayAssessment = ({ day = '', nutrition = null, activity = null } = {}) => ({
        day,
        nutrition,
        activity
    });

    return {
        buildDayTargets,
        buildDayIntake,
        buildDayConsumption,
        buildDayAssessment
    };
})();

var __root = (typeof globalThis !== 'undefined')
    ? globalThis
    : (typeof window !== 'undefined' ? window : this);
__root.DayContracts = DayContracts;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DayContracts;
}
