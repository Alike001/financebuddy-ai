import { categorize } from './categorize.js';
import { insights } from './insights.js';
import { saver } from './saver.js';
import { report } from './report.js';

/** Registered skills, keyed by id. The planner reads this to assemble runs. */
export const SKILLS = { categorize, insights, saver, report };

/** A flat list, for the Skills marketplace page (Step 9). */
export const SKILL_LIST = Object.values(SKILLS);
