(() => {
const x=(exerciseId,sets=1,reps=1,extra=null)=>extra?{exerciseId,sets,reps,...extra}:{exerciseId,sets,reps};
const w=()=>({exercises:[x("caminar",1,1,{stepsPerMin:100,secPerRep:4800})],description:"Actividad base diaria"});
const s=(exercises,description)=>({exercises,description});
const r=(description)=>({type:"rest",description});
const d=(day,gym,extra_activity=null)=>extra_activity?{day,walk:w(),gym,extra_activity}:{day,walk:w(),gym};
const WEEK_ACTIVITY_DEFAULT=[
d("Lunes",s([x("movilidad_articular",1,1,{secPerRep:360}),x("sentadilla",4,"6-10",{weightKg:40,secPerRep:5}),x("press_banca",4,"6-10",{weightKg:30,secPerRep:4}),x("remo_barra",4,"8-12",{weightKg:30,secPerRep:4}),x("press_militar",3,"8-10",{weightKg:20,secPerRep:4}),x("peso_muerto_rumano",3,"8-12",{weightKg:40,secPerRep:4}),x("elevacion_gemelos",3,"12-15",{weightKg:30,secPerRep:3}),x("plancha",1,1,{secPerRep:180}),x("crunch",3,"12-20",{secPerRep:2}),x("estiramientos",1,1,{secPerRep:240})],"Recorrido completo con énfasis en básicos.")),
d("Martes",r("Sin actividad de fuerza o cardio intenso en gimnasio")),
d("Miércoles",s([x("movilidad_articular",1,1,{secPerRep:360}),x("press_inclinado",4,"6-10",{weightKg:30,secPerRep:4}),x("remo_mancuernas",3,"8-12",{weightKg:20,secPerRep:4}),x("press_militar",3,"8-10",{weightKg:20,secPerRep:4}),x("elevaciones_laterales",3,"12-15",{weightKg:8,secPerRep:3}),x("curl_biceps",3,"10-12",{weightKg:10,secPerRep:3}),x("extension_triceps",3,"10-12",{weightKg:15,secPerRep:3}),x("plancha_lateral",1,1,{secPerRep:240}),x("russian_twist",3,"16-24",{weightKg:5,secPerRep:2}),x("estiramientos",1,1,{secPerRep:240})],"Empuje y tracción de tren superior con accesorios.")),
d("Jueves",s([x("movilidad_articular",1,1,{secPerRep:360}),x("estiramientos",1,1,{secPerRep:480})],"Día libre o recuperación activa suave.")),
d("Viernes",s([x("movilidad_articular",1,1,{secPerRep:360}),x("sentadilla_goblet",4,"8-12",{weightKg:20,secPerRep:4}),x("peso_muerto",4,"6-8",{weightKg:50,secPerRep:5}),x("zancadas",3,"10-12",{weightKg:12,secPerRep:4}),x("hip_thrust",3,"8-12",{weightKg:40,secPerRep:4}),x("prensa_piernas",3,"10-12",{weightKg:80,secPerRep:4}),x("elevacion_gemelos",3,"12-15",{weightKg:30,secPerRep:3}),x("plancha",1,1,{secPerRep:180}),x("elevaciones_piernas",3,"10-15",{weightKg:0,secPerRep:2}),x("estiramientos",1,1,{secPerRep:240})],"Tren inferior + full body con énfasis en bisagra.")),
d("Sábado",r("Descanso completo sin actividad programada."),s([x("spinning",1,1,{secPerRep:1800})],"Spinning suave para evaluar el flujo de actividad extra.")),
d("Domingo",r("Descanso completo sin actividad programada."))
];
window.CoreDataRegistry.registerActivityPlan("activity/week_activity_default.js", WEEK_ACTIVITY_DEFAULT);
})();
