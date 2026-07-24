#pragma once

namespace OtaUpdate {

// spec section 54: admin uploads firmware -> Supabase Storage -> ESP32
// checks version -> downloads -> verifies -> installs -> restarts.
//
// NOT WIRED UP YET: there is no version-check endpoint or Storage bucket
// serving firmware builds on the backend yet. This function is structured
// to be a straightforward drop-in once that endpoint exists - it currently
// always returns false without attempting a network call, so issuing the
// UPDATE valve command is safe but a no-op today.
bool checkAndApply();

} // namespace OtaUpdate
