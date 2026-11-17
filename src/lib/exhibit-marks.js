/**
 * Presentation helper shared by the exhibits. An exhibit replaces displayed
 * values when a control changes; without a mark, the reader has to remember
 * the previous screen to see what moved. This writes the new text and flags
 * the element when the text differs from what was shown before.
 *
 * It compares displayed strings only. It computes nothing about the exhibit's
 * subject and is not part of any exhibit's checked implementation.
 *
 * @param {Element} target
 * @param {string} value
 * @param {boolean} mark Whether a difference should be flagged. Pass false for
 *   the first render and for a wholesale context switch, where every value
 *   differs and marking all of them says nothing.
 */
export function writeMarked(target, value, mark) {
  const changed = mark && target.textContent.trim() !== value.trim();
  target.textContent = value;
  target.toggleAttribute("data-changed", changed);
}
