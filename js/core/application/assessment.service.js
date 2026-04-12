const AssessmentApplicationService = (() => {
    const createDayAssessment = (options = {}) => (
        typeof DayAssessmentEngine !== 'undefined' && typeof DayAssessmentEngine.createDayAssessment === 'function'
            ? DayAssessmentEngine.createDayAssessment(options)
            : null
    );
    const createNutritionAssessment = ({ dayTargets = null, dayIntake = null, nutritionScoreEngine = null } = {}) => (
        createDayAssessment({ dayTargets, dayIntake, nutritionScoreEngine })
    );
    const createActivityAssessment = ({ dayTargets = null, dayConsumption = null, activityScoreEngine = null } = {}) => (
        createDayAssessment({ dayTargets, dayConsumption, activityScoreEngine })
    );

    return {
        createDayAssessment,
        createNutritionAssessment,
        createActivityAssessment
    };
})();

window.AssessmentApplicationService = AssessmentApplicationService;
