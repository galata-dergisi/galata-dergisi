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