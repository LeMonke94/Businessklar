/**
 * Rule engine singletons — the public entry point for the rules domain.
 *
 * Service / UI code imports the engine instances from here and only ever sees
 * the port interfaces, never the concrete implementations. This mirrors
 * lib/auth/index.ts.
 */

import { createLocalActivityDetectionEngine } from './local-activity-detection-engine';
import { createLocalLegalFormEngine } from './local-legal-form-engine';
import { createLocalComplianceEngine } from './local-compliance-engine';
import type { ActivityDetectionEngine } from './activity-detection-engine';
import type { LegalFormEngine } from './legal-form-engine';
import type { ComplianceEngine } from './compliance-engine';


const activityDetectionEngine: ActivityDetectionEngine = createLocalActivityDetectionEngine();
const legalFormEngine: LegalFormEngine = createLocalLegalFormEngine();
const complianceEngine: ComplianceEngine = createLocalComplianceEngine();


export { activityDetectionEngine, legalFormEngine, complianceEngine };