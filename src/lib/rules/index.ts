/**
 * Rule engine singletons — the public entry point for the rules domain.
 *
 * Service / UI code imports the engine instances from here and only ever sees
 * the port interfaces, never the concrete implementations. This mirrors
 * lib/auth/index.ts.
 *
 * As the local Compliance implementation lands (Phase 9.3 / 9.4), its singleton
 * is added here too.
 */

import { createLocalActivityDetectionEngine } from './local-activity-detection-engine';
import { createLocalLegalFormEngine } from './local-legal-form-engine';
import type { ActivityDetectionEngine } from './activity-detection-engine';
import type { LegalFormEngine } from './legal-form-engine';


const activityDetectionEngine: ActivityDetectionEngine = createLocalActivityDetectionEngine();
const legalFormEngine: LegalFormEngine = createLocalLegalFormEngine();


export { activityDetectionEngine, legalFormEngine };