/**
 * Performs an HTTP GET request using Fetch API.
 * @param {string} URL 
 * @returns {Promise.<Response>}
 */
export async function httpGet(URL, options) {
  try {
    options = Object.assign({}, { json: false }, options);
    const response = await fetch(URL);

    if (!response.ok) throw new Error(`Resonse was not OK.`);

    if (options.json) return response.json();

    return response.text();
  } catch (ex) {
    throw ex;
  }
}

/**
 * Adds a **one-time** listener function (`callback`) to the target HTML element for the event named `eventName`.
 * @param {HTMLElement} target Target element.
 * @param {string} eventName The name of the event.
 * @param {function} callback The callback function.
 */
export function once(target, eventName, callback) {
  const handler = function (...args) {
    target.removeEventListener(eventName, handler);
    callback(...args);
  };

  target.addEventListener(eventName, handler);
}