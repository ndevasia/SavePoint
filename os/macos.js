/**
 * These are intentionally no-ops on macOS.
 *
 * The Windows implementation captures the foreground HWND before showing the
 * annotation overlay and restores it afterwards, because showing the overlay
 * steals focus from the game. On macOS the overlay is created as a panel (an
 * NSPanel with the non-activating style mask, see createNoteWindow in main.js),
 * so it takes keyboard input without the game ever losing focus — there is
 * nothing to capture or restore.
 *
 * Note that macOS has no permission-free way to focus another application's
 * window anyway: the addressable unit is the application, and reading the
 * frontmost one via System Events would require an Automation permission
 * prompt. Avoiding focus theft is preferable to undoing it.
 */

/**
 * Gets the handle of the currently focused window
 */
function getFocusedWindow() {
    return undefined;
}

/**
 * Sets focus to a window based on its handle
 */
function setFocusedWindow(hwnd) {
}

module.exports = {
    getFocusedWindow: getFocusedWindow,
    setFocusedWindow: setFocusedWindow
};
