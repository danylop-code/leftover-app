// Maestro runScript: the shop (Crumb) confirms the customer's pickup code through the API.
const api = API_URL;
const login = http.post(`${api}/auth/login`, {
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'crumb@seed.leftover.app', password: 'leftover24' }),
});
const token = json(login.body).token;
const confirm = http.post(`${api}/store/orders/confirm`, {
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ code: CODE }),
});
if (confirm.status !== 200) throw new Error(`confirm failed: ${confirm.status} ${confirm.body}`);
