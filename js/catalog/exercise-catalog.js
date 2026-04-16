import { createLookup } from "../shared/collection-utils.js";

export const EXERCISES_DB = [
  // Strength - Upper Body
  { id: "bench_press", type: "strength", focus: "upper_body", met: 5.5, relativeLoad: 0.42, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 120, descriptionKey: "exercises.bench_press.description", techniqueKey: "exercises.bench_press.technique" },
  { id: "incline_press", type: "strength", focus: "upper_body", met: 5.2, relativeLoad: 0.36, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 120, descriptionKey: "exercises.incline_press.description", techniqueKey: "exercises.incline_press.technique" },
  { id: "barbell_row", type: "strength", focus: "upper_body", met: 5.4, relativeLoad: 0.45, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 120, descriptionKey: "exercises.barbell_row.description", techniqueKey: "exercises.barbell_row.technique" },
  { id: "push_ups", type: "strength", focus: "upper_body", met: 6.0, relativeLoad: 0.32, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 90, descriptionKey: "exercises.push_ups.description", techniqueKey: "exercises.push_ups.technique" },
  { id: "dumbbell_flyes", type: "strength", focus: "upper_body", met: 4.0, relativeLoad: 0.22, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 60, descriptionKey: "exercises.dumbbell_flyes.description", techniqueKey: "exercises.dumbbell_flyes.technique" },
  { id: "dips", type: "strength", focus: "upper_body", met: 6.5, relativeLoad: 0.38, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 90, descriptionKey: "exercises.dips.description", techniqueKey: "exercises.dips.technique" },
  { id: "pull_ups", type: "strength", focus: "upper_body", met: 7.0, relativeLoad: 0.4, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 120, descriptionKey: "exercises.pull_ups.description", techniqueKey: "exercises.pull_ups.technique" },
  { id: "lat_pulldown", type: "strength", focus: "upper_body", met: 5.0, relativeLoad: 0.34, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 90, descriptionKey: "exercises.lat_pulldown.description", techniqueKey: "exercises.lat_pulldown.technique" },
  { id: "dumbbell_row", type: "strength", focus: "upper_body", met: 5.5, relativeLoad: 0.35, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 90, descriptionKey: "exercises.dumbbell_row.description", techniqueKey: "exercises.dumbbell_row.technique" },
  { id: "face_pull", type: "strength", focus: "upper_body", met: 4.0, relativeLoad: 0.2, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 60, descriptionKey: "exercises.face_pull.description", techniqueKey: "exercises.face_pull.technique" },
  { id: "military_press", type: "strength", focus: "upper_body", met: 6.0, relativeLoad: 0.4, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 90, descriptionKey: "exercises.military_press.description", techniqueKey: "exercises.military_press.technique" },
  { id: "lateral_raise", type: "strength", focus: "upper_body", met: 4.0, relativeLoad: 0.2, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 60, descriptionKey: "exercises.lateral_raise.description", techniqueKey: "exercises.lateral_raise.technique" },
  { id: "bicep_curl", type: "strength", focus: "upper_body", met: 3.5, relativeLoad: 0.22, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 60, descriptionKey: "exercises.bicep_curl.description", techniqueKey: "exercises.bicep_curl.technique" },
  { id: "hammer_curl", type: "strength", focus: "upper_body", met: 3.5, relativeLoad: 0.22, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 60, descriptionKey: "exercises.hammer_curl.description", techniqueKey: "exercises.hammer_curl.technique" },
  { id: "tricep_extension", type: "strength", focus: "upper_body", met: 3.5, relativeLoad: 0.22, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 60, descriptionKey: "exercises.tricep_extension.description", techniqueKey: "exercises.tricep_extension.technique" },

  // Strength - Lower Body
  { id: "squat", type: "strength", focus: "lower_body", met: 6, relativeLoad: 0.8, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 150, descriptionKey: "exercises.squat.description", techniqueKey: "exercises.squat.technique" },
  { id: "romanian_deadlift", type: "strength", focus: "lower_body", met: 5.8, relativeLoad: 0.72, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 135, descriptionKey: "exercises.romanian_deadlift.description", techniqueKey: "exercises.romanian_deadlift.technique" },
  { id: "lunges", type: "strength", focus: "lower_body", met: 5, relativeLoad: 0.5, cadenceBase: null, defaultSecPerRep: 5, defaultRestSec: 90, descriptionKey: "exercises.lunges.description", techniqueKey: "exercises.lunges.technique" },
  { id: "goblet_squat", type: "strength", focus: "lower_body", met: 6.0, relativeLoad: 0.4, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 90, descriptionKey: "exercises.goblet_squat.description", techniqueKey: "exercises.goblet_squat.technique" },
  { id: "deadlift", type: "strength", focus: "lower_body", met: 7.0, relativeLoad: 0.48, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 150, descriptionKey: "exercises.deadlift.description", techniqueKey: "exercises.deadlift.technique" },
  { id: "leg_press", type: "strength", focus: "lower_body", met: 6.0, relativeLoad: 0.48, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 120, descriptionKey: "exercises.leg_press.description", techniqueKey: "exercises.leg_press.technique" },
  { id: "hip_thrust", type: "strength", focus: "lower_body", met: 5.5, relativeLoad: 0.45, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 120, descriptionKey: "exercises.hip_thrust.description", techniqueKey: "exercises.hip_thrust.technique" },
  { id: "calf_raise", type: "strength", focus: "lower_body", met: 3.5, relativeLoad: 0.25, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 60, descriptionKey: "exercises.calf_raise.description", techniqueKey: "exercises.calf_raise.technique" },
  { id: "step_up", type: "strength", focus: "lower_body", met: 5.5, relativeLoad: 0.38, cadenceBase: null, defaultSecPerRep: 5, defaultRestSec: 90, descriptionKey: "exercises.step_up.description", techniqueKey: "exercises.step_up.technique" },

  // Strength - Core
  { id: "plank", type: "strength", focus: "core", met: 3.8, relativeLoad: null, cadenceBase: null, defaultSecPerRep: 45, defaultRestSec: 30, descriptionKey: "exercises.plank.description", techniqueKey: "exercises.plank.technique" },
  { id: "side_plank", type: "strength", focus: "core", met: 3.5, relativeLoad: 0.18, cadenceBase: null, defaultSecPerRep: 45, defaultRestSec: 45, descriptionKey: "exercises.side_plank.description", techniqueKey: "exercises.side_plank.technique" },
  { id: "crunch", type: "strength", focus: "core", met: 3.0, relativeLoad: 0.18, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 45, descriptionKey: "exercises.crunch.description", techniqueKey: "exercises.crunch.technique" },
  { id: "leg_raises", type: "strength", focus: "core", met: 4.0, relativeLoad: 0.2, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 45, descriptionKey: "exercises.leg_raises.description", techniqueKey: "exercises.leg_raises.technique" },
  { id: "russian_twist", type: "strength", focus: "core", met: 4.0, relativeLoad: 0.2, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 45, descriptionKey: "exercises.russian_twist.description", techniqueKey: "exercises.russian_twist.technique" },

  // Strength - Full Body
  { id: "burpees", type: "strength", focus: "full_body", met: 8.5, relativeLoad: 0.3, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 90, descriptionKey: "exercises.burpees.description", techniqueKey: "exercises.burpees.technique" },
  { id: "thrusters", type: "strength", focus: "full_body", met: 9.0, relativeLoad: 0.4, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 90, descriptionKey: "exercises.thrusters.description", techniqueKey: "exercises.thrusters.technique" },
  { id: "clean_and_press", type: "strength", focus: "full_body", met: 9.0, relativeLoad: 0.42, cadenceBase: null, defaultSecPerRep: 4, defaultRestSec: 120, descriptionKey: "exercises.clean_and_press.description", techniqueKey: "exercises.clean_and_press.technique" },
  { id: "kettlebell_swing", type: "strength", focus: "full_body", met: 8.0, relativeLoad: 0.35, cadenceBase: null, defaultSecPerRep: null, defaultRestSec: 90, descriptionKey: "exercises.kettlebell_swing.description", techniqueKey: "exercises.kettlebell_swing.technique" },

  // Cardio - General
  { id: "walk", type: "cardio", focus: "general", met: 3.5, relativeLoad: null, cadenceBase: 100, defaultSecPerRep: null, defaultRestSec: null, descriptionKey: "exercises.walk.description", techniqueKey: "exercises.walk.technique" },
  { id: "spinning", type: "cardio", focus: "general", met: 8.5, relativeLoad: null, cadenceBase: 90, defaultSecPerRep: null, defaultRestSec: null, descriptionKey: "exercises.spinning.description", techniqueKey: "exercises.spinning.technique" },
  { id: "running", type: "cardio", focus: "general", met: 9.8, relativeLoad: null, cadenceBase: 160, defaultSecPerRep: null, defaultRestSec: null, descriptionKey: "exercises.running.description", techniqueKey: "exercises.running.technique" },

  // Cardio - Full Body
  { id: "hiit", type: "cardio", focus: "full_body", met: 10.5, relativeLoad: null, cadenceBase: 160, defaultSecPerRep: null, defaultRestSec: null, descriptionKey: "exercises.hiit.description", techniqueKey: "exercises.hiit.technique" },
  { id: "jump_rope", type: "cardio", focus: "full_body", met: 11.5, relativeLoad: null, cadenceBase: 120, defaultSecPerRep: null, defaultRestSec: null, descriptionKey: "exercises.jump_rope.description", techniqueKey: "exercises.jump_rope.technique" },
  { id: "jumping_jacks", type: "cardio", focus: "full_body", met: 8.0, relativeLoad: null, cadenceBase: 100, defaultSecPerRep: null, defaultRestSec: null, descriptionKey: "exercises.jumping_jacks.description", techniqueKey: "exercises.jumping_jacks.technique" },
  { id: "mountain_climbers", type: "cardio", focus: "full_body", met: 9.0, relativeLoad: null, cadenceBase: 120, defaultSecPerRep: null, defaultRestSec: null, descriptionKey: "exercises.mountain_climbers.description", techniqueKey: "exercises.mountain_climbers.technique" },

  // Cardio - Lower Body
  { id: "road_cycling", type: "cardio", focus: "lower_body", met: 8.0, relativeLoad: null, cadenceBase: 80, defaultSecPerRep: null, defaultRestSec: null, descriptionKey: "exercises.road_cycling.description", techniqueKey: "exercises.road_cycling.technique" },
  { id: "mountain_biking", type: "cardio", focus: "lower_body", met: 10.0, relativeLoad: null, cadenceBase: 70, defaultSecPerRep: null, defaultRestSec: null, descriptionKey: "exercises.mountain_biking.description", techniqueKey: "exercises.mountain_biking.technique" },
  { id: "elliptical", type: "cardio", focus: "lower_body", met: 6.5, relativeLoad: null, cadenceBase: 140, defaultSecPerRep: null, defaultRestSec: null, descriptionKey: "exercises.elliptical.description", techniqueKey: "exercises.elliptical.technique" },
  { id: "step_machine", type: "cardio", focus: "lower_body", met: 8.8, relativeLoad: null, cadenceBase: 90, defaultSecPerRep: null, defaultRestSec: null, descriptionKey: "exercises.step_machine.description", techniqueKey: "exercises.step_machine.technique" },
  { id: "hiking", type: "cardio", focus: "lower_body", met: 6.5, relativeLoad: null, cadenceBase: 100, defaultSecPerRep: null, defaultRestSec: null, descriptionKey: "exercises.hiking.description", techniqueKey: "exercises.hiking.technique" },
  { id: "skating", type: "cardio", focus: "lower_body", met: 7.5, relativeLoad: null, cadenceBase: 110, defaultSecPerRep: null, defaultRestSec: null, descriptionKey: "exercises.skating.description", techniqueKey: "exercises.skating.technique" },

  // Cardio - Upper Body
  { id: "rowing_machine", type: "cardio", focus: "upper_body", met: 8.5, relativeLoad: null, cadenceBase: 24, defaultSecPerRep: null, defaultRestSec: null, descriptionKey: "exercises.rowing_machine.description", techniqueKey: "exercises.rowing_machine.technique" },
  { id: "heavy_bag_boxing", type: "cardio", focus: "upper_body", met: 10.5, relativeLoad: null, cadenceBase: 120, defaultSecPerRep: null, defaultRestSec: null, descriptionKey: "exercises.heavy_bag_boxing.description", techniqueKey: "exercises.heavy_bag_boxing.technique" },
  { id: "swimming", type: "cardio", focus: "upper_body", met: 9.5, relativeLoad: null, cadenceBase: 30, defaultSecPerRep: null, defaultRestSec: null, descriptionKey: "exercises.swimming.description", techniqueKey: "exercises.swimming.technique" },

  // Mobility
  { id: "joint_mobility", type: "mobility", focus: "mobility", met: 2.5, relativeLoad: null, cadenceBase: 50, defaultSecPerRep: 6, defaultRestSec: 20, descriptionKey: "exercises.joint_mobility.description", techniqueKey: "exercises.joint_mobility.technique" },
  { id: "gentle_yoga", type: "mobility", focus: "mobility", met: 2.5, relativeLoad: null, cadenceBase: 50, defaultSecPerRep: null, defaultRestSec: null, descriptionKey: "exercises.gentle_yoga.description", techniqueKey: "exercises.gentle_yoga.technique" },

  // Recovery
  { id: "stretching", type: "recovery", focus: "recovery", met: 2.3, relativeLoad: null, cadenceBase: 45, defaultSecPerRep: 8, defaultRestSec: 20, descriptionKey: "exercises.stretching.description", techniqueKey: "exercises.stretching.technique" },
  { id: "sauna", type: "recovery", focus: "recovery", met: 1.5, relativeLoad: null, cadenceBase: 30, defaultSecPerRep: null, defaultRestSec: null, descriptionKey: "exercises.sauna.description", techniqueKey: "exercises.sauna.technique" },
];

export const EXERCISE_BY_ID = createLookup(EXERCISES_DB);
