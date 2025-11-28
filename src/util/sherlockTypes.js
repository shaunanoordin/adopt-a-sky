/*
Sherlock Types
The Lasair's Sherlock system classifies objects into certain known types,
such as Supernovae (listed in the Lasair Sherlock system as "SN").

This is a map that matches "type codes" from Lasair (via our server API's
/skydata endpoint) to their full names.

See https://lasair.readthedocs.io/en/main/core_functions/sherlock.html
and https://lasair-lsst.readthedocs.io/en/main/core_functions/sherlock.html
 */

export const SHERLOCK_TYPES = {
  'VS': 'Variable Star',
  'CV': 'Cataclysmic Variable',
  'BS': 'Bright Star',
  'AGN': 'Active Galactic Nucleus',
  'NT': 'Nuclear Transient',
  'SN': 'Supernova',
  '': 'Orphan (unidentified/unclassified)'
}