import { createLookup } from "../shared/collection-utils.js";

export const EXERCISES_DB = [
  // Strength - Upper Body
  { id: "bench_press", type: "strength", focus: "upper_body", met: 5.5, relativeLoad: 0.42, cadenceBase: null, descriptionKey: "exercises.bench_press.description", techniqueKey: "exercises.bench_press.technique" },
  { id: "barbell_bench_press", type: "strength", focus: "upper_body", met: 5.5, relativeLoad: 0.42, cadenceBase: null, descriptionKey: "exercises.barbell_bench_press.description", techniqueKey: "exercises.barbell_bench_press.technique" },
  { id: "dumbbell_bench_press", type: "strength", focus: "upper_body", met: 5.3, relativeLoad: 0.38, cadenceBase: null, descriptionKey: "exercises.dumbbell_bench_press.description", techniqueKey: "exercises.dumbbell_bench_press.technique" },
  { id: "incline_press", type: "strength", focus: "upper_body", met: 5.2, relativeLoad: 0.36, cadenceBase: null, descriptionKey: "exercises.incline_press.description", techniqueKey: "exercises.incline_press.technique" },
  { id: "barbell_row", type: "strength", focus: "upper_body", met: 5.4, relativeLoad: 0.45, cadenceBase: null, descriptionKey: "exercises.barbell_row.description", techniqueKey: "exercises.barbell_row.technique" },
  { id: "machine_high_row", type: "strength", focus: "upper_body", met: 5.2, relativeLoad: 0.34, cadenceBase: null, descriptionKey: "exercises.machine_high_row.description", techniqueKey: "exercises.machine_high_row.technique" },
  { id: "seated_low_row", type: "strength", focus: "upper_body", met: 5.1, relativeLoad: 0.34, cadenceBase: null, descriptionKey: "exercises.seated_low_row.description", techniqueKey: "exercises.seated_low_row.technique" },
  { id: "push_ups", type: "strength", focus: "upper_body", met: 6.0, relativeLoad: 0.32, cadenceBase: null, descriptionKey: "exercises.push_ups.description", techniqueKey: "exercises.push_ups.technique" },
  { id: "dumbbell_flyes", type: "strength", focus: "upper_body", met: 4.0, relativeLoad: 0.22, cadenceBase: null, descriptionKey: "exercises.dumbbell_flyes.description", techniqueKey: "exercises.dumbbell_flyes.technique" },
  { id: "chest_fly", type: "strength", focus: "upper_body", met: 4.0, relativeLoad: 0.22, cadenceBase: null, descriptionKey: "exercises.chest_fly.description", techniqueKey: "exercises.chest_fly.technique" },
  { id: "dips", type: "strength", focus: "upper_body", met: 6.5, relativeLoad: 0.38, cadenceBase: null, descriptionKey: "exercises.dips.description", techniqueKey: "exercises.dips.technique" },
  { id: "pull_ups", type: "strength", focus: "upper_body", met: 7.0, relativeLoad: 0.4, cadenceBase: null, descriptionKey: "exercises.pull_ups.description", techniqueKey: "exercises.pull_ups.technique" },
  { id: "lat_pulldown", type: "strength", focus: "upper_body", met: 5.0, relativeLoad: 0.34, cadenceBase: null, descriptionKey: "exercises.lat_pulldown.description", techniqueKey: "exercises.lat_pulldown.technique" },
  { id: "behind_neck_pulldown", type: "strength", focus: "upper_body", met: 4.8, relativeLoad: 0.34, cadenceBase: null, descriptionKey: "exercises.behind_neck_pulldown.description", techniqueKey: "exercises.behind_neck_pulldown.technique" },
  { id: "cable_pullover", type: "strength", focus: "upper_body", met: 4.4, relativeLoad: 0.3, cadenceBase: null, descriptionKey: "exercises.cable_pullover.description", techniqueKey: "exercises.cable_pullover.technique" },
  { id: "dumbbell_row", type: "strength", focus: "upper_body", met: 5.5, relativeLoad: 0.35, cadenceBase: null, descriptionKey: "exercises.dumbbell_row.description", techniqueKey: "exercises.dumbbell_row.technique" },
  { id: "face_pull", type: "strength", focus: "upper_body", met: 4.0, relativeLoad: 0.2, cadenceBase: null, descriptionKey: "exercises.face_pull.description", techniqueKey: "exercises.face_pull.technique" },
  { id: "military_press", type: "strength", focus: "upper_body", met: 6.0, relativeLoad: 0.4, cadenceBase: null, descriptionKey: "exercises.military_press.description", techniqueKey: "exercises.military_press.technique" },
  { id: "machine_shoulder_press", type: "strength", focus: "upper_body", met: 5.4, relativeLoad: 0.24, cadenceBase: null, descriptionKey: "exercises.machine_shoulder_press.description", techniqueKey: "exercises.machine_shoulder_press.technique" },
  { id: "dumbbell_shoulder_press", type: "strength", focus: "upper_body", met: 5.6, relativeLoad: 0.22, cadenceBase: null, descriptionKey: "exercises.dumbbell_shoulder_press.description", techniqueKey: "exercises.dumbbell_shoulder_press.technique" },
  { id: "lateral_raise", type: "strength", focus: "upper_body", met: 4.0, relativeLoad: 0.2, cadenceBase: null, descriptionKey: "exercises.lateral_raise.description", techniqueKey: "exercises.lateral_raise.technique" },
  { id: "front_raise", type: "strength", focus: "upper_body", met: 3.6, relativeLoad: 0.18, cadenceBase: null, descriptionKey: "exercises.front_raise.description", techniqueKey: "exercises.front_raise.technique" },
  { id: "rear_delt_pec_deck", type: "strength", focus: "upper_body", met: 4.0, relativeLoad: 0.16, cadenceBase: null, descriptionKey: "exercises.rear_delt_pec_deck.description", techniqueKey: "exercises.rear_delt_pec_deck.technique" },
  { id: "bicep_curl", type: "strength", focus: "upper_body", met: 3.5, relativeLoad: 0.22, cadenceBase: null, descriptionKey: "exercises.bicep_curl.description", techniqueKey: "exercises.bicep_curl.technique" },
  { id: "hammer_curl", type: "strength", focus: "upper_body", met: 3.5, relativeLoad: 0.22, cadenceBase: null, descriptionKey: "exercises.hammer_curl.description", techniqueKey: "exercises.hammer_curl.technique" },
  { id: "tricep_extension", type: "strength", focus: "upper_body", met: 3.5, relativeLoad: 0.22, cadenceBase: null, descriptionKey: "exercises.tricep_extension.description", techniqueKey: "exercises.tricep_extension.technique" },

  // Strength - Lower Body
  { id: "squat", type: "strength", focus: "lower_body", met: 6, relativeLoad: 0.8, cadenceBase: null, descriptionKey: "exercises.squat.description", techniqueKey: "exercises.squat.technique" },
  { id: "romanian_deadlift", type: "strength", focus: "lower_body", met: 5.8, relativeLoad: 0.72, cadenceBase: null, descriptionKey: "exercises.romanian_deadlift.description", techniqueKey: "exercises.romanian_deadlift.technique" },
  { id: "lunges", type: "strength", focus: "lower_body", met: 5, relativeLoad: 0.5, cadenceBase: null, descriptionKey: "exercises.lunges.description", techniqueKey: "exercises.lunges.technique" },
  { id: "leg_extension", type: "strength", focus: "lower_body", met: 4.4, relativeLoad: 0.35, cadenceBase: null, descriptionKey: "exercises.leg_extension.description", techniqueKey: "exercises.leg_extension.technique" },
  { id: "leg_curl", type: "strength", focus: "lower_body", met: 4.4, relativeLoad: 0.3, cadenceBase: null, descriptionKey: "exercises.leg_curl.description", techniqueKey: "exercises.leg_curl.technique" },
  { id: "goblet_squat", type: "strength", focus: "lower_body", met: 6.0, relativeLoad: 0.4, cadenceBase: null, descriptionKey: "exercises.goblet_squat.description", techniqueKey: "exercises.goblet_squat.technique" },
  { id: "deadlift", type: "strength", focus: "lower_body", met: 7.0, relativeLoad: 0.48, cadenceBase: null, descriptionKey: "exercises.deadlift.description", techniqueKey: "exercises.deadlift.technique" },
  { id: "leg_press", type: "strength", focus: "lower_body", met: 6.0, relativeLoad: 0.48, cadenceBase: null, descriptionKey: "exercises.leg_press.description", techniqueKey: "exercises.leg_press.technique" },
  { id: "hip_thrust", type: "strength", focus: "lower_body", met: 5.5, relativeLoad: 0.45, cadenceBase: null, descriptionKey: "exercises.hip_thrust.description", techniqueKey: "exercises.hip_thrust.technique" },
  { id: "calf_raise", type: "strength", focus: "lower_body", met: 3.5, relativeLoad: 0.25, cadenceBase: null, descriptionKey: "exercises.calf_raise.description", techniqueKey: "exercises.calf_raise.technique" },
  { id: "step_up", type: "strength", focus: "lower_body", met: 5.5, relativeLoad: 0.38, cadenceBase: null, descriptionKey: "exercises.step_up.description", techniqueKey: "exercises.step_up.technique" },

  // Strength - Core
  { id: "plank", type: "strength", focus: "core", met: 3.8, relativeLoad: null, cadenceBase: null, descriptionKey: "exercises.plank.description", techniqueKey: "exercises.plank.technique" },
  { id: "side_plank", type: "strength", focus: "core", met: 3.5, relativeLoad: 0.18, cadenceBase: null, descriptionKey: "exercises.side_plank.description", techniqueKey: "exercises.side_plank.technique" },
  { id: "crunch", type: "strength", focus: "core", met: 3.0, relativeLoad: 0.18, cadenceBase: null, descriptionKey: "exercises.crunch.description", techniqueKey: "exercises.crunch.technique" },
  { id: "leg_raises", type: "strength", focus: "core", met: 4.0, relativeLoad: 0.2, cadenceBase: null, descriptionKey: "exercises.leg_raises.description", techniqueKey: "exercises.leg_raises.technique" },
  { id: "russian_twist", type: "strength", focus: "core", met: 4.0, relativeLoad: 0.2, cadenceBase: null, descriptionKey: "exercises.russian_twist.description", techniqueKey: "exercises.russian_twist.technique" },

  // Strength - Full Body
  { id: "burpees", type: "strength", focus: "full_body", met: 8.5, relativeLoad: 0.3, cadenceBase: null, descriptionKey: "exercises.burpees.description", techniqueKey: "exercises.burpees.technique" },
  { id: "thrusters", type: "strength", focus: "full_body", met: 9.0, relativeLoad: 0.4, cadenceBase: null, descriptionKey: "exercises.thrusters.description", techniqueKey: "exercises.thrusters.technique" },
  { id: "clean_and_press", type: "strength", focus: "full_body", met: 9.0, relativeLoad: 0.42, cadenceBase: null, descriptionKey: "exercises.clean_and_press.description", techniqueKey: "exercises.clean_and_press.technique" },
  { id: "kettlebell_swing", type: "strength", focus: "full_body", met: 8.0, relativeLoad: 0.35, cadenceBase: null, descriptionKey: "exercises.kettlebell_swing.description", techniqueKey: "exercises.kettlebell_swing.technique" },

  // Cardio - General
  { id: "walk", type: "cardio", focus: "general", met: 3.5, relativeLoad: null, cadenceBase: 100, descriptionKey: "exercises.walk.description", techniqueKey: "exercises.walk.technique" },
  { id: "spinning", type: "cardio", focus: "general", met: 8.5, relativeLoad: null, cadenceBase: 90, descriptionKey: "exercises.spinning.description", techniqueKey: "exercises.spinning.technique" },
  { id: "running", type: "cardio", focus: "general", met: 9.8, relativeLoad: null, cadenceBase: 160, descriptionKey: "exercises.running.description", techniqueKey: "exercises.running.technique" },

  // Cardio - Full Body
  { id: "hiit", type: "cardio", focus: "full_body", met: 10.5, relativeLoad: null, cadenceBase: 160, descriptionKey: "exercises.hiit.description", techniqueKey: "exercises.hiit.technique" },
  { id: "jump_rope", type: "cardio", focus: "full_body", met: 11.5, relativeLoad: null, cadenceBase: 120, descriptionKey: "exercises.jump_rope.description", techniqueKey: "exercises.jump_rope.technique" },
  { id: "jumping_jacks", type: "cardio", focus: "full_body", met: 8.0, relativeLoad: null, cadenceBase: 100, descriptionKey: "exercises.jumping_jacks.description", techniqueKey: "exercises.jumping_jacks.technique" },
  { id: "mountain_climbers", type: "cardio", focus: "full_body", met: 9.0, relativeLoad: null, cadenceBase: 120, descriptionKey: "exercises.mountain_climbers.description", techniqueKey: "exercises.mountain_climbers.technique" },

  // Cardio - Lower Body
  { id: "stationary_bike", type: "cardio", focus: "lower_body", met: 7.0, relativeLoad: null, cadenceBase: 85, descriptionKey: "exercises.stationary_bike.description", techniqueKey: "exercises.stationary_bike.technique" },
  { id: "road_cycling", type: "cardio", focus: "lower_body", met: 8.0, relativeLoad: null, cadenceBase: 80, descriptionKey: "exercises.road_cycling.description", techniqueKey: "exercises.road_cycling.technique" },
  { id: "mountain_biking", type: "cardio", focus: "lower_body", met: 10.0, relativeLoad: null, cadenceBase: 70, descriptionKey: "exercises.mountain_biking.description", techniqueKey: "exercises.mountain_biking.technique" },
  { id: "elliptical", type: "cardio", focus: "lower_body", met: 6.5, relativeLoad: null, cadenceBase: 140, descriptionKey: "exercises.elliptical.description", techniqueKey: "exercises.elliptical.technique" },
  { id: "step_machine", type: "cardio", focus: "lower_body", met: 8.8, relativeLoad: null, cadenceBase: 90, descriptionKey: "exercises.step_machine.description", techniqueKey: "exercises.step_machine.technique" },
  { id: "hiking", type: "cardio", focus: "lower_body", met: 6.5, relativeLoad: null, cadenceBase: 100, descriptionKey: "exercises.hiking.description", techniqueKey: "exercises.hiking.technique" },
  { id: "skating", type: "cardio", focus: "lower_body", met: 7.5, relativeLoad: null, cadenceBase: 110, descriptionKey: "exercises.skating.description", techniqueKey: "exercises.skating.technique" },

  // Cardio - Upper Body
  { id: "rowing_machine", type: "cardio", focus: "upper_body", met: 8.5, relativeLoad: null, cadenceBase: 24, descriptionKey: "exercises.rowing_machine.description", techniqueKey: "exercises.rowing_machine.technique" },
  { id: "heavy_bag_boxing", type: "cardio", focus: "upper_body", met: 10.5, relativeLoad: null, cadenceBase: 120, descriptionKey: "exercises.heavy_bag_boxing.description", techniqueKey: "exercises.heavy_bag_boxing.technique" },
  { id: "swimming", type: "cardio", focus: "upper_body", met: 9.5, relativeLoad: null, cadenceBase: 30, descriptionKey: "exercises.swimming.description", techniqueKey: "exercises.swimming.technique" },

  // Mobility
  { id: "joint_mobility", type: "mobility", focus: "mobility", met: 2.5, relativeLoad: null, cadenceBase: 50, descriptionKey: "exercises.joint_mobility.description", techniqueKey: "exercises.joint_mobility.technique" },
  { id: "gentle_yoga", type: "mobility", focus: "mobility", met: 2.5, relativeLoad: null, cadenceBase: 50, descriptionKey: "exercises.gentle_yoga.description", techniqueKey: "exercises.gentle_yoga.technique" },

  // Recovery
  { id: "stretching", type: "recovery", focus: "recovery", met: 2.3, relativeLoad: null, cadenceBase: 45, descriptionKey: "exercises.stretching.description", techniqueKey: "exercises.stretching.technique" },
  { id: "sauna", type: "recovery", focus: "recovery", met: 1.5, relativeLoad: null, cadenceBase: 30, descriptionKey: "exercises.sauna.description", techniqueKey: "exercises.sauna.technique" },
];

export const EXERCISE_BY_ID = createLookup(EXERCISES_DB);
