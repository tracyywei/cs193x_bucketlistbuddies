let API_URL = "/api";

export class HTTPError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const apiRequest = async (method, path, body = null) => {
  const url = API_URL + path;
  let options = {};

  if (body) {
    options = {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : null
    };
  } else {
    options = {
      method: method,
      headers: { "Content-Type": "application/json" }
    };
  }

  let res = await fetch(url, options);
  let data = await res.json();

  if (res.status !== 200) {
    throw new HTTPError(res.status, data.error);
  }
  return data;
};

export default apiRequest;
