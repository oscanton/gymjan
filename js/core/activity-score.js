/* =========================================
   core/activity-score.js - ACTIVITY SCORE
   ========================================= */

const ActivityScore = (() => {
    const DEFAULT_WEIGHTS = {
        stepsKcal: 0.4,
        trainingKcal: 0.3,
        met: 0.2,
        intensity: 0.1
    };
    const DEFAULT_TARGETS = {
        stepsKcalPct: 0.15,
        trainingKcalPct: 0.10,
        met: 5,
        intensity: 1.5
    };
    const DEFAULT_K = 2.2;

    const toNumber = (value) => {
        const n = parseFloat(value);
        return Number.isFinite(n) ? n : 0;
    };

    const scoreAtan10 = (value, target, k = DEFAULT_K) => {
        const v = toNumber(value);
        const t = toNumber(target);
        if (!Number.isFinite(t) || t <= 0) return 0;
        if (!Number.isFinite(v) || v <= 0) return 0;
        const ratio = (v / t) - 1;
        const normalized = (Math.atan(k * ratio) / Math.atan(k)) + 1;
        const score = 10 * normalized;
        return Math.max(0, score);
    };

    const normalizeWeights = (weights) => {
        const w = { ...DEFAULT_WEIGHTS, ...(weights || {}) };
        const sum = w.stepsKcal + w.trainingKcal + w.met + w.intensity;
        if (!Number.isFinite(sum) || sum <= 0) return { ...DEFAULT_WEIGHTS };
        return {
            stepsKcal: w.stepsKcal / sum,
            trainingKcal: w.trainingKcal / sum,
            met: w.met / sum,
            intensity: w.intensity / sum
        };
    };

    const calculate = ({
        stepsKcal = 0,
        trainingKcal = 0,
        met = 0,
        intensity = 0,
        targetKcal = 0,
        weights = null,
        targets = null,
        k = DEFAULT_K
    } = {}) => {
        const safeTargetKcal = toNumber(targetKcal);
        if (!Number.isFinite(safeTargetKcal) || safeTargetKcal <= 0) {
            return { score: NaN };
        }

        const resolvedTargets = { ...DEFAULT_TARGETS, ...(targets || {}) };
        const resolvedWeights = normalizeWeights(weights);

        const stepsKcalTarget = safeTargetKcal * resolvedTargets.stepsKcalPct;
        const trainingKcalTarget = safeTargetKcal * resolvedTargets.trainingKcalPct;

        const scoreSteps = scoreAtan10(stepsKcal, stepsKcalTarget, k);
        const scoreTraining = scoreAtan10(trainingKcal, trainingKcalTarget, k);
        const scoreMet = scoreAtan10(met, resolvedTargets.met, k);
        const scoreIntensity = scoreAtan10(intensity, resolvedTargets.intensity, k);

        const normalized = {
            stepsKcal: scoreSteps / 10,
            trainingKcal: scoreTraining / 10,
            met: scoreMet / 10,
            intensity: scoreIntensity / 10
        };

        const score = 10 * (
            (resolvedWeights.stepsKcal * normalized.stepsKcal)
            + (resolvedWeights.trainingKcal * normalized.trainingKcal)
            + (resolvedWeights.met * normalized.met)
            + (resolvedWeights.intensity * normalized.intensity)
        );

        return {
            score,
            scores: {
                stepsKcal: scoreSteps,
                trainingKcal: scoreTraining,
                met: scoreMet,
                intensity: scoreIntensity
            },
            normalized,
            targets: {
                stepsKcal: stepsKcalTarget,
                trainingKcal: trainingKcalTarget,
                met: resolvedTargets.met,
                intensity: resolvedTargets.intensity
            },
            weights: resolvedWeights
        };
    };

    const getStatusClass = (score) => {
        const val = parseFloat(score);
        if (!Number.isFinite(val)) return '';
        if (val >= 10) return 'text-status--ok';
        if (val >= 7) return 'text-status--warning';
        return 'text-status--danger';
    };

    return { calculate, getStatusClass };
})();

window.ActivityScore = ActivityScore;
