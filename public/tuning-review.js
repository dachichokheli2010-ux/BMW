// A configuration review for an educational scenario. These checks describe
// evidence and planning gaps; they do not certify parts compatibility or safety.
export function assessBuild(model, config) {
  const turbocharged = Number(model?.turbos) > 0;
  const changed = Object.entries(config).filter(([key, value]) => value !== ({suspension:'stock',wheels:'stock',brakes:'stock',transmission:'stock'}[key] || '0')).length;
  const checks = [], tradeoffs = [];
  const add = (title, detail, action = '') => checks.push({title, detail, action});
  if (config.turbo !== '0' && turbocharged) {
    if (config.ecu === '0' || config.intercooler === '0') add('Review the supporting systems', 'This turbo concept is missing a calibration or charge-cooling choice. Add those to the scenario, then verify the actual hardware, fuel delivery and controls with a specialist.', 'support');
    else add('Turbo support is recorded', 'Calibration and charge cooling are selected. Turbo fitment, fuel capacity, boost control and thermal limits still need evidence.');
    tradeoffs.push('Larger turbo concept: airflow potential and response change together. This lab cannot quantify spool, lag or a safe boost target.');
  }
  if (config.ecu !== '0') {
    add('Calibration needs a matching specification', 'Fuel, engine condition, logging, torque limits and the exact ECU variant need a model-specific review. The output increase here is an editable-parts teaching assumption.');
    if (config.ecu === '2' && config.transmission === 'stock') add('Keep the driveline in the review', 'An advanced output scenario retains the factory transmission selection. Clutch, gearbox and driveline capacity are not documented by this builder.');
    tradeoffs.push('Calibration concept: increased output demand adds thermal and driveline questions; a higher peak figure alone does not describe durability.');
  }
  if (config.suspension === 'track') tradeoffs.push('Track chassis concept: road comfort, ground clearance, alignment and tyre suitability need attention. No handling score is predicted.');
  if (config.brakes === 'track') tradeoffs.push('Track brakes concept: temperature range, pedal behavior, wheel clearance and road suitability depend on the actual components.');
  if (config.exhaust === '2') add('Exhaust specification is incomplete', 'The full-exhaust concept has no defined catalyst, noise or local road-compliance specification. Verify these before choosing real parts.');
  if (config.transmission === 'sport' && /manual/i.test(model?.verified?.transmission || model?.transmission || '')) add('Manual transmission selected', 'A shift-calibration concept does not describe a manual gearbox upgrade. Choose the factory transmission or a clutch / cooling concept.');
  if (config.wheels !== 'stock') add('Wheel change is visual only', 'The preview changes finish only. Diameter, width, offset, tyre size, load rating and brake clearance are unspecified.');
  if (!turbocharged) tradeoffs.push('Naturally aspirated engine: turbo and charge-cooler controls are unavailable. A forced-induction conversion is a separate engineering project.');
  if (changed && !checks.length) add('Verify the chosen hardware', 'These are system concepts. Exact parts, fitment and measured results have not been supplied for this build.');
  return {changed, checks, tradeoffs, turbocharged, headline: changed ? `${checks.length} review item${checks.length === 1 ? '' : 's'}` : 'Factory configuration', description: changed ? 'Use these prompts to develop the build. They do not approve a real installation.' : 'Compare the documented engine ratings before exploring a scenario.'};
}
