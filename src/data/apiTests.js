// Live API automation demo data for the OrangeHRM REST API.
// Base: https://opensource-demo.orangehrmlive.com/web/index.php/api/v2
//
// Same shape as the Web UI test cases: framework-agnostic `steps` drive the
// live request/response replay, plus per-framework source code.

export const API_BASE =
  'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2'

export const apiFrameworks = [
  { id: 'rest-assured', label: 'REST Assured (Java)' },
  { id: 'python-requests', label: 'Python (requests + pytest)' },
  { id: 'postman', label: 'Postman / Newman' },
  { id: 'supertest', label: 'Supertest (JS)' },
]

export const apiTestCases = [
  {
    id: 'API01',
    title: 'Authenticate and receive a token',
    description: 'POST valid credentials and verify a token is returned.',
    expected: 'HTTP 200 with a non-empty access token.',
    steps: [
      { log: 'Build POST /auth/login request', state: { method: 'POST', url: '/auth/login', reqBody: '{\n  "username": "Admin",\n  "password": "admin123"\n}' } },
      { log: 'Send request', state: { method: 'POST', url: '/auth/login', reqBody: '{\n  "username": "Admin",\n  "password": "admin123"\n}', sending: true } },
      { log: 'Receive 200 OK', state: { method: 'POST', url: '/auth/login', status: 200, resBody: '{\n  "token": "eyJhbGciOiJIUzI1NiIs...",\n  "expiresIn": 3600\n}' } },
      { log: 'Assert status == 200 && token not empty', state: { method: 'POST', url: '/auth/login', status: 200, resBody: '{\n  "token": "eyJhbGciOiJIUzI1NiIs...",\n  "expiresIn": 3600\n}' }, pass: true },
    ],
  },
  {
    id: 'API02',
    title: 'Get employees list',
    description: 'GET the employees collection and verify the payload.',
    expected: 'HTTP 200 with a non-empty data array.',
    steps: [
      { log: 'Build GET /pim/employees request', state: { method: 'GET', url: '/pim/employees?limit=5' } },
      { log: 'Attach Bearer token + send', state: { method: 'GET', url: '/pim/employees?limit=5', sending: true } },
      { log: 'Receive 200 OK', state: { method: 'GET', url: '/pim/employees?limit=5', status: 200, resBody: '{\n  "data": [\n    { "empNumber": 1, "firstName": "Aaliyah" },\n    { "empNumber": 7, "firstName": "Asahd" }\n  ],\n  "meta": { "total": 52 }\n}' } },
      { log: 'Assert data.length > 0 && meta.total == 52', state: { method: 'GET', url: '/pim/employees?limit=5', status: 200, resBody: '{\n  "data": [\n    { "empNumber": 1, "firstName": "Aaliyah" },\n    { "empNumber": 7, "firstName": "Asahd" }\n  ],\n  "meta": { "total": 52 }\n}' }, pass: true },
    ],
  },
  {
    id: 'API03',
    title: 'Search employee by name',
    description: 'GET employees filtered by name query parameter.',
    expected: 'HTTP 200 with only matching records.',
    steps: [
      { log: 'Build GET /pim/employees?nameOrId=Aa', state: { method: 'GET', url: '/pim/employees?nameOrId=Aa' } },
      { log: 'Send request', state: { method: 'GET', url: '/pim/employees?nameOrId=Aa', sending: true } },
      { log: 'Receive 200 OK', state: { method: 'GET', url: '/pim/employees?nameOrId=Aa', status: 200, resBody: '{\n  "data": [\n    { "empNumber": 1, "firstName": "Aaliyah", "lastName": "Haq" }\n  ],\n  "meta": { "total": 1 }\n}' } },
      { log: 'Assert every record matches "Aa"', state: { method: 'GET', url: '/pim/employees?nameOrId=Aa', status: 200, resBody: '{\n  "data": [\n    { "empNumber": 1, "firstName": "Aaliyah", "lastName": "Haq" }\n  ],\n  "meta": { "total": 1 }\n}' }, pass: true },
    ],
  },
  {
    id: 'API04',
    title: 'Unauthorized request returns 401',
    description: 'GET a protected resource without a token.',
    expected: 'HTTP 401 with an error message.',
    steps: [
      { log: 'Build GET /pim/employees (no token)', state: { method: 'GET', url: '/pim/employees' } },
      { log: 'Send request', state: { method: 'GET', url: '/pim/employees', sending: true } },
      { log: 'Receive 401 Unauthorized', state: { method: 'GET', url: '/pim/employees', status: 401, resBody: '{\n  "error": "Unauthorized",\n  "status": "401"\n}' } },
      { log: 'Assert status == 401', state: { method: 'GET', url: '/pim/employees', status: 401, resBody: '{\n  "error": "Unauthorized",\n  "status": "401"\n}' }, pass: true },
    ],
  },
]

export function getApiCode(frameworkId, tc) {
  const builders = {
    'rest-assured': restAssured,
    'python-requests': pythonRequests,
    'postman': postman,
    'supertest': supertest,
  }
  return (builders[frameworkId] || restAssured)(tc)
}

function restAssured(tc) {
  const body = {
    API01: `        given()
            .contentType("application/json")
            .body("{ \\"username\\": \\"Admin\\", \\"password\\": \\"admin123\\" }")
        .when()
            .post("/auth/login")
        .then()
            .statusCode(200)
            .body("token", not(emptyString()));`,
    API02: `        given()
            .header("Authorization", "Bearer " + token)
        .when()
            .get("/pim/employees?limit=5")
        .then()
            .statusCode(200)
            .body("data.size()", greaterThan(0))
            .body("meta.total", equalTo(52));`,
    API03: `        given()
            .header("Authorization", "Bearer " + token)
            .queryParam("nameOrId", "Aa")
        .when()
            .get("/pim/employees")
        .then()
            .statusCode(200)
            .body("data.firstName", everyItem(containsString("Aa")));`,
    API04: `        given()
        .when()
            .get("/pim/employees")
        .then()
            .statusCode(401)
            .body("error", equalTo("Unauthorized"));`,
  }
  return `// REST Assured (Java) — ${tc.id}
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

@Test
public void ${tc.id.toLowerCase()}() {
    RestAssured.baseURI =
        "https://opensource-demo.orangehrmlive.com/web/index.php/api/v2";
${body[tc.id]}
}`
}

function pythonRequests(tc) {
  const body = {
    API01: `    res = requests.post(f"{BASE}/auth/login",
                        json={"username": "Admin", "password": "admin123"})
    assert res.status_code == 200
    assert res.json()["token"]`,
    API02: `    res = requests.get(f"{BASE}/pim/employees?limit=5",
                       headers={"Authorization": f"Bearer {token}"})
    body = res.json()
    assert res.status_code == 200
    assert len(body["data"]) > 0
    assert body["meta"]["total"] == 52`,
    API03: `    res = requests.get(f"{BASE}/pim/employees",
                       params={"nameOrId": "Aa"},
                       headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert all("Aa" in e["firstName"] for e in res.json()["data"])`,
    API04: `    res = requests.get(f"{BASE}/pim/employees")
    assert res.status_code == 401
    assert res.json()["error"] == "Unauthorized"`,
  }
  return `# Python (requests + pytest) — ${tc.id}
import requests

BASE = "https://opensource-demo.orangehrmlive.com/web/index.php/api/v2"

def test_${tc.id.toLowerCase()}():
${body[tc.id]}`
}

function postman(tc) {
  const body = {
    API01: `pm.test("Status is 200", () => pm.response.to.have.status(200));
pm.test("Token returned", () => {
    pm.expect(pm.response.json().token).to.be.a("string").and.not.empty;
});`,
    API02: `pm.test("Status is 200", () => pm.response.to.have.status(200));
pm.test("Data not empty", () => {
    pm.expect(pm.response.json().data.length).to.be.above(0);
    pm.expect(pm.response.json().meta.total).to.eql(52);
});`,
    API03: `pm.test("Status is 200", () => pm.response.to.have.status(200));
pm.test("All match 'Aa'", () => {
    pm.response.json().data.forEach(e =>
        pm.expect(e.firstName).to.include("Aa"));
});`,
    API04: `pm.test("Status is 401", () => pm.response.to.have.status(401));
pm.test("Error message", () => {
    pm.expect(pm.response.json().error).to.eql("Unauthorized");
});`,
  }
  return `// Postman test script — ${tc.id}
// (run from CLI with: newman run OrangeHRM.postman_collection.json)
${body[tc.id]}`
}

function supertest(tc) {
  const body = {
    API01: `  const res = await request(BASE)
    .post('/auth/login')
    .send({ username: 'Admin', password: 'admin123' });
  expect(res.status).toBe(200);
  expect(res.body.token).toBeTruthy();`,
    API02: `  const res = await request(BASE)
    .get('/pim/employees?limit=5')
    .set('Authorization', \`Bearer \${token}\`);
  expect(res.status).toBe(200);
  expect(res.body.data.length).toBeGreaterThan(0);
  expect(res.body.meta.total).toBe(52);`,
    API03: `  const res = await request(BASE)
    .get('/pim/employees')
    .query({ nameOrId: 'Aa' })
    .set('Authorization', \`Bearer \${token}\`);
  expect(res.status).toBe(200);
  res.body.data.forEach(e => expect(e.firstName).toContain('Aa'));`,
    API04: `  const res = await request(BASE).get('/pim/employees');
  expect(res.status).toBe(401);
  expect(res.body.error).toBe('Unauthorized');`,
  }
  return `// Supertest (JS / Jest) — ${tc.id}
const request = require('supertest');
const BASE = 'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2';

test('${tc.title}', async () => {
${body[tc.id]}
});`
}
