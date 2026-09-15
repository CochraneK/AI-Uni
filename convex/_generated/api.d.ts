/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agent_conversation from "../agent/conversation.js";
import type * as agent_deepseekConversation from "../agent/deepseekConversation.js";
import type * as agent_embeddingsCache from "../agent/embeddingsCache.js";
import type * as agent_memory from "../agent/memory.js";
import type * as aiTown_agent from "../aiTown/agent.js";
import type * as aiTown_agentDescription from "../aiTown/agentDescription.js";
import type * as aiTown_agentInputs from "../aiTown/agentInputs.js";
import type * as aiTown_agentOperations from "../aiTown/agentOperations.js";
import type * as aiTown_conversation from "../aiTown/conversation.js";
import type * as aiTown_conversationMembership from "../aiTown/conversationMembership.js";
import type * as aiTown_game from "../aiTown/game.js";
import type * as aiTown_ids from "../aiTown/ids.js";
import type * as aiTown_inputHandler from "../aiTown/inputHandler.js";
import type * as aiTown_inputs from "../aiTown/inputs.js";
import type * as aiTown_insertInput from "../aiTown/insertInput.js";
import type * as aiTown_llmFallback from "../aiTown/llmFallback.js";
import type * as aiTown_location from "../aiTown/location.js";
import type * as aiTown_main from "../aiTown/main.js";
import type * as aiTown_movement from "../aiTown/movement.js";
import type * as aiTown_player from "../aiTown/player.js";
import type * as aiTown_playerDescription from "../aiTown/playerDescription.js";
import type * as aiTown_publicInputAuthorization from "../aiTown/publicInputAuthorization.js";
import type * as aiTown_world from "../aiTown/world.js";
import type * as aiTown_worldMap from "../aiTown/worldMap.js";
import type * as assessment_constructs from "../assessment/constructs.js";
import type * as assessment_measures from "../assessment/measures.js";
import type * as campus_commitments from "../campus/commitments.js";
import type * as campus_config from "../campus/config.js";
import type * as campus_profiles from "../campus/profiles.js";
import type * as campus_registry from "../campus/registry.js";
import type * as campus_schedule from "../campus/schedule.js";
import type * as campus_templates_bjtu from "../campus/templates/bjtu.js";
import type * as campus_validation from "../campus/validation.js";
import type * as constants from "../constants.js";
import type * as content_packs_campusLife from "../content/packs/campusLife.js";
import type * as content_packs_cityLife from "../content/packs/cityLife.js";
import type * as content_packs_lifeCourse from "../content/packs/lifeCourse.js";
import type * as content_packs_sensitiveResearch from "../content/packs/sensitiveResearch.js";
import type * as content_packs_socialFriction from "../content/packs/socialFriction.js";
import type * as content_types from "../content/types.js";
import type * as content_validation from "../content/validation.js";
import type * as crons from "../crons.js";
import type * as engine_abstractGame from "../engine/abstractGame.js";
import type * as engine_historicalObject from "../engine/historicalObject.js";
import type * as http from "../http.js";
import type * as init from "../init.js";
import type * as life_activities from "../life/activities.js";
import type * as life_commitments from "../life/commitments.js";
import type * as life_day from "../life/day.js";
import type * as life_dayClock from "../life/dayClock.js";
import type * as life_development from "../life/development.js";
import type * as life_firstWeek from "../life/firstWeek.js";
import type * as life_firstWeekProgress from "../life/firstWeekProgress.js";
import type * as life_influence from "../life/influence.js";
import type * as life_model from "../life/model.js";
import type * as life_signals from "../life/signals.js";
import type * as life_state from "../life/state.js";
import type * as life_theories from "../life/theories.js";
import type * as life_transitions from "../life/transitions.js";
import type * as life_types from "../life/types.js";
import type * as messages from "../messages.js";
import type * as music from "../music.js";
import type * as research_events from "../research/events.js";
import type * as research_telemetry from "../research/telemetry.js";
import type * as scenarios_completion from "../scenarios/completion.js";
import type * as scenarios_controller from "../scenarios/controller.js";
import type * as scenarios_lifeFilter from "../scenarios/lifeFilter.js";
import type * as scenarios_npcContext from "../scenarios/npcContext.js";
import type * as scenarios_progress from "../scenarios/progress.js";
import type * as scenarios_registry from "../scenarios/registry.js";
import type * as scenarios_runtime from "../scenarios/runtime.js";
import type * as scenarios_types from "../scenarios/types.js";
import type * as testing from "../testing.js";
import type * as util_FastIntegerCompression from "../util/FastIntegerCompression.js";
import type * as util_assertNever from "../util/assertNever.js";
import type * as util_asyncMap from "../util/asyncMap.js";
import type * as util_compression from "../util/compression.js";
import type * as util_geometry from "../util/geometry.js";
import type * as util_isSimpleObject from "../util/isSimpleObject.js";
import type * as util_llm from "../util/llm.js";
import type * as util_minheap from "../util/minheap.js";
import type * as util_object from "../util/object.js";
import type * as util_sleep from "../util/sleep.js";
import type * as util_types from "../util/types.js";
import type * as util_xxhash from "../util/xxhash.js";
import type * as world from "../world.js";
import type * as world_locations from "../world/locations.js";
import type * as world_runtime from "../world/runtime.js";
import type * as world_travel from "../world/travel.js";
import type * as world_zones from "../world/zones.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "agent/conversation": typeof agent_conversation;
  "agent/deepseekConversation": typeof agent_deepseekConversation;
  "agent/embeddingsCache": typeof agent_embeddingsCache;
  "agent/memory": typeof agent_memory;
  "aiTown/agent": typeof aiTown_agent;
  "aiTown/agentDescription": typeof aiTown_agentDescription;
  "aiTown/agentInputs": typeof aiTown_agentInputs;
  "aiTown/agentOperations": typeof aiTown_agentOperations;
  "aiTown/conversation": typeof aiTown_conversation;
  "aiTown/conversationMembership": typeof aiTown_conversationMembership;
  "aiTown/game": typeof aiTown_game;
  "aiTown/ids": typeof aiTown_ids;
  "aiTown/inputHandler": typeof aiTown_inputHandler;
  "aiTown/inputs": typeof aiTown_inputs;
  "aiTown/insertInput": typeof aiTown_insertInput;
  "aiTown/llmFallback": typeof aiTown_llmFallback;
  "aiTown/location": typeof aiTown_location;
  "aiTown/main": typeof aiTown_main;
  "aiTown/movement": typeof aiTown_movement;
  "aiTown/player": typeof aiTown_player;
  "aiTown/playerDescription": typeof aiTown_playerDescription;
  "aiTown/publicInputAuthorization": typeof aiTown_publicInputAuthorization;
  "aiTown/world": typeof aiTown_world;
  "aiTown/worldMap": typeof aiTown_worldMap;
  "assessment/constructs": typeof assessment_constructs;
  "assessment/measures": typeof assessment_measures;
  "campus/commitments": typeof campus_commitments;
  "campus/config": typeof campus_config;
  "campus/profiles": typeof campus_profiles;
  "campus/registry": typeof campus_registry;
  "campus/schedule": typeof campus_schedule;
  "campus/templates/bjtu": typeof campus_templates_bjtu;
  "campus/validation": typeof campus_validation;
  constants: typeof constants;
  "content/packs/campusLife": typeof content_packs_campusLife;
  "content/packs/cityLife": typeof content_packs_cityLife;
  "content/packs/lifeCourse": typeof content_packs_lifeCourse;
  "content/packs/sensitiveResearch": typeof content_packs_sensitiveResearch;
  "content/packs/socialFriction": typeof content_packs_socialFriction;
  "content/types": typeof content_types;
  "content/validation": typeof content_validation;
  crons: typeof crons;
  "engine/abstractGame": typeof engine_abstractGame;
  "engine/historicalObject": typeof engine_historicalObject;
  http: typeof http;
  init: typeof init;
  "life/activities": typeof life_activities;
  "life/commitments": typeof life_commitments;
  "life/day": typeof life_day;
  "life/dayClock": typeof life_dayClock;
  "life/development": typeof life_development;
  "life/firstWeek": typeof life_firstWeek;
  "life/firstWeekProgress": typeof life_firstWeekProgress;
  "life/influence": typeof life_influence;
  "life/model": typeof life_model;
  "life/signals": typeof life_signals;
  "life/state": typeof life_state;
  "life/theories": typeof life_theories;
  "life/transitions": typeof life_transitions;
  "life/types": typeof life_types;
  messages: typeof messages;
  music: typeof music;
  "research/events": typeof research_events;
  "research/telemetry": typeof research_telemetry;
  "scenarios/completion": typeof scenarios_completion;
  "scenarios/controller": typeof scenarios_controller;
  "scenarios/lifeFilter": typeof scenarios_lifeFilter;
  "scenarios/npcContext": typeof scenarios_npcContext;
  "scenarios/progress": typeof scenarios_progress;
  "scenarios/registry": typeof scenarios_registry;
  "scenarios/runtime": typeof scenarios_runtime;
  "scenarios/types": typeof scenarios_types;
  testing: typeof testing;
  "util/FastIntegerCompression": typeof util_FastIntegerCompression;
  "util/assertNever": typeof util_assertNever;
  "util/asyncMap": typeof util_asyncMap;
  "util/compression": typeof util_compression;
  "util/geometry": typeof util_geometry;
  "util/isSimpleObject": typeof util_isSimpleObject;
  "util/llm": typeof util_llm;
  "util/minheap": typeof util_minheap;
  "util/object": typeof util_object;
  "util/sleep": typeof util_sleep;
  "util/types": typeof util_types;
  "util/xxhash": typeof util_xxhash;
  world: typeof world;
  "world/locations": typeof world_locations;
  "world/runtime": typeof world_runtime;
  "world/travel": typeof world_travel;
  "world/zones": typeof world_zones;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
