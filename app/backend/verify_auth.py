import urllib.request, json, urllib.error, time

BASE = "http://localhost:8000/api"

def req(method, path, body=None, token=None):
    url = BASE + path
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    rq = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        r = urllib.request.urlopen(rq)
        return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())

results = []

# 1. Health check
s, d = req("GET", "/")
ok = s == 200 and d.get("status") == "ok"
results.append(("GET /api/ (health)", s, ok))
print("[1] GET /api/:", s, d)

# 2. Signup
email = "testuser_" + str(int(time.time())) + "@example.com"
s, d = req("POST", "/auth/signup", {"name": "Test User", "email": email, "password": "test123"})
ok = s == 200 and bool(d.get("token"))
token = d.get("token", "")
results.append(("POST /auth/signup", s, ok))
print("[2] POST /auth/signup:", s, "token=" + str(bool(token)), "email=" + str(d.get("user", {}).get("email", "")))

# 3. Login
s, d = req("POST", "/auth/login", {"email": email, "password": "test123"})
ok = s == 200 and bool(d.get("token"))
login_token = d.get("token", "")
results.append(("POST /auth/login", s, ok))
print("[3] POST /auth/login:", s, "token=" + str(bool(login_token)))

# 4. GET /auth/me
s, d = req("GET", "/auth/me", token=login_token)
ok = s == 200 and d.get("email") == email.lower()
results.append(("GET /auth/me", s, ok))
print("[4] GET /auth/me:", s, "email=" + str(d.get("email", d)))

# 5. Wrong password
s, d = req("POST", "/auth/login", {"email": email, "password": "wrongpw"})
ok = s == 401
results.append(("POST /auth/login (wrong pw)", s, ok))
print("[5] POST /auth/login (wrong pw):", s, d.get("detail"))

# 6. Duplicate signup
s, d = req("POST", "/auth/signup", {"name": "Dupe", "email": email, "password": "test123"})
ok = s == 400
results.append(("POST /auth/signup (duplicate)", s, ok))
print("[6] POST /auth/signup (dupe):", s, d.get("detail"))

# 7. Short password
s, d = req("POST", "/auth/signup", {"name": "Dupe", "email": "new_" + str(int(time.time())) + "@test.com", "password": "123"})
ok = s == 400
results.append(("POST /auth/signup (short pw)", s, ok))
print("[7] POST /auth/signup (short pw):", s, d.get("detail"))

# 8. Unauthorized /auth/me (no token)
s, d = req("GET", "/auth/me")
ok = s == 403
results.append(("GET /auth/me (no token)", s, ok))
print("[8] GET /auth/me (no token):", s, d)

# 9. Projects list
s, d = req("GET", "/projects", token=login_token)
ok = s == 200 and isinstance(d, list)
results.append(("GET /projects", s, ok))
print("[9] GET /projects:", s, "count=" + str(len(d) if isinstance(d, list) else d))

# 10. Create project
s, d = req("POST", "/projects", {"name": "Test Project", "description": "Auth test"}, token=login_token)
ok = s == 200 and d.get("id")
proj_id = d.get("id", "")
results.append(("POST /projects", s, ok))
print("[10] POST /projects:", s, "id=" + str(proj_id))

print()
print("=" * 55)
print("VERIFICATION SUMMARY")
print("=" * 55)
all_pass = True
for name, code, passed in results:
    status = "PASS" if passed else "FAIL"
    if not passed:
        all_pass = False
    print(f"  {status}  [{code}]  {name}")
print()
print("OVERALL:", "ALL TESTS PASSED" if all_pass else "SOME TESTS FAILED")
