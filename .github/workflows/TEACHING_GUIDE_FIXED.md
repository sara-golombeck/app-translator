# מדריך CI/CD - Backend Workflow

## 1. מטרה
להגדיר תהליך אוטומטי אשר:
- בונה Docker images
- מעלה אותם ל-DockerHub
- מתבצע על כל שינוי בקוד

---

## 2. מבנה הפתרון
קיימים כמה סוגי workflows:

### CI Backend
- **קובץ**: `ci-backend.yml`
- רץ על שינויים בתיקיית `backend`
- בונה image ל-backend

### CI Frontend
- **קובץ**: `ci-frontend.yml`
- רץ על שינויים בתיקיית `frontend`

---

## 3. דרישות מוקדמות
נדרש:
- חשבון DockerHub
- Access Token מ-DockerHub

---

## 4. הגדרת Access Token

### יצירה:
1. היכנס ל-DockerHub
2. לך ל: **Account Settings → Security → New Access Token**
3. תן שם ל-Token (למשל: `github-actions`)
4. העתק את ה-Token (לא תוכל לראות אותו שוב!)

### שמירה ב-GitHub:
1. לך לריפו שלך ב-GitHub
2. **Settings → Secrets and variables → Actions → New repository secret**
3. צור 2 Secrets:
   - `DOCKERHUB_USERNAME` - שם המשתמש שלך ב-DockerHub
   - `DOCKERHUB_TOKEN` - ה-Token שיצרת

---

## 5. שימוש ב-Secrets ב-Workflow

דוגמה:
```yaml
- name: Login to DockerHub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}
```

**הרעיון**: לא להכניס סיסמאות רגישות בקוד!

---

## 6. איך נראה הפייפליין בפועל?

```
בדיקות אוטומטיות (Unit Tests)
   ↓
בניית Docker Image
   ↓
בדיקות מערכת (Integration Tests)
   ↓
העלאה ל-DockerHub
```

המערכת תרוץ אוטומטית בכל שינוי בקוד.

---

## 7. בניית ה-Workflow צעד אחר צעד

### לפני התחלה - הגדרות כלליות

צור קובץ: `.github/workflows/ci-backend.yml`

```yaml
name: Backend CI

on:
  push:
    branches: [main, develop, ci/cd]  # TODO: על אילו branches לרוץ?
    paths:
      - 'backend/**'  # TODO: על איזו תיקייה לעקוב?
      - '.github/workflows/ci-backend.yml'  # עוקב גם אחרי שינויים בקובץ הזה
  pull_request:
    branches: [main]  # TODO: על אילו branches לרוץ ב-PR?
    paths:
      - 'backend/**'
```

⚠️ **שים לב**: לדחוף לגיט אחרי כל אחד מהשלבים!

---

### שלב 1 – Unit Tests (בדיקות קוד)

בשלב זה אנו מוודאים שהקוד תקין לפני כל פעולה אחרת.

#### הכנה:
1. **צור קובץ unit test** או הורד מכאן:
   ```
   https://raw.githubusercontent.com/sara-golombeck/app-translator/ci/cd/backend/server.test.js
   ```

2. **עדכן את `package.json`** - הוסף בתוך `scripts`:
   ```json
   "test": "node --test server.test.js"
   ```

#### הוסף את ה-Job:

```yaml
jobs:
  unit-tests:
    name: Run Unit Tests  # TODO: תיאור קצר
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        working-directory: ./backend  # TODO: באיזו תיקייה?
        run: npm install
      
      - name: Run unit tests
        working-directory: ./backend  # TODO: באיזו תיקייה?
        run: npm test
      
      - name: Test summary
        run: echo "✅ Unit tests passed!"  # TODO: הדפס הודעה מתאימה
```

#### בדיקה:
```bash
git add .
git commit -m "Add unit tests job"
git push
```

לך ל-GitHub → Actions ובדוק שה-workflow רץ!

---

### שלב 2 – Build Docker Image

בשלב זה אנו בונים Image של האפליקציה אך **לא מעלים אותו עדיין**.

💡 **מושג חדש - needs**: 
זה אומר שהשלב הזה ימתין עד שהשלב הקודם יסתיים בהצלחה.
אם `unit-tests` נכשל, `build` לא ירוץ בכלל!

```yaml
  build:
    name: Build Docker Image  # TODO: תיאור קצר
    runs-on: ubuntu-latest
    needs: unit-tests  # TODO: איזה stage חייב להסתיים לפני בניית האימג'?
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: false  # ← עדיין לא דוחפים!
          tags: YOUR_USERNAME/app-translator-backend:${{ github.sha }}  # TODO: שם המשתמש שלך
          load: true
          cache-from: type=gha  # מאיץ builds
          cache-to: type=gha,mode=max
      
      - name: Test Docker image
        run: |
          docker run --rm YOUR_USERNAME/app-translator-backend:${{ github.sha }} node --version
          echo "✅ Docker image works!"
```

#### בדיקה:
```bash
git add .
git commit -m "Add build job"
git push
```

---

### שלב 3 – Integration Tests (בדיקות מערכת)

בשלב זה אנו בודקים את המערכת כולה יחד (כולל שירותים חיצוניים כמו DB).

#### הכנה:
1. **הורד `docker-compose.test.yml`**:
   ```
   https://raw.githubusercontent.com/sara-golombeck/app-translator/ci/cd/docker-compose.test.yml
   ```

2. **הורד בדיקות אינטגרציה**:
   ```
   https://raw.githubusercontent.com/sara-golombeck/app-translator/ci/cd/backend/server.integration.test.js
   ```

#### הוסף את ה-Job:

```yaml
  integration-tests:
    name: Run Integration Tests
    runs-on: ubuntu-latest
    needs: build  # ← ממתין ל-build
    if: |
      github.ref == 'refs/heads/main' ||
      github.ref == 'refs/heads/ci/cd' ||
      github.event_name == 'pull_request'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run tests with Docker Compose
        run: |
          docker compose -f docker-compose.test.yml up \
            --abort-on-container-exit \
            --exit-code-from backend-test
      
      - name: Show logs
        if: always()  # רץ גם אם הבדיקות נכשלו
        run: docker compose -f docker-compose.test.yml logs
      
      - name: Cleanup
        if: always()  # תמיד לנקות
        run: docker compose -f docker-compose.test.yml down -v
```

💡 **מה זה `if`?**
זה תנאי - השלב הזה ירוץ רק על `main`, `ci/cd`, או ב-Pull Requests.
על `develop` הוא לא ירוץ (חוסך זמן).

#### בדיקה:
```bash
git add .
git commit -m "Add integration tests job"
git push
```

---

### שלב 4 – Push ל-DockerHub (פריסה)

בשלב זה מעלים את ה-Image ל-DockerHub **רק לאחר שכל הבדיקות עברו**.

```yaml
  push:
    name: Push to DockerHub
    runs-on: ubuntu-latest
    needs: [build, integration-tests]  # ← ממתין ל-2 jobs!
    if: |
      always() &&
      github.event_name == 'push' &&
      (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/ci/cd') &&
      needs.build.result == 'success' &&
      (needs.integration-tests.result == 'success' || needs.integration-tests.result == 'skipped')
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}  # TODO: מה שם ה-secret?
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true  # ← עכשיו כן דוחפים!
          tags: |
            YOUR_USERNAME/app-translator-backend:latest
            YOUR_USERNAME/app-translator-backend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Push summary
        run: |
          echo "✅ Pushed to DockerHub:"
          echo "   - latest"
          echo "   - ${{ github.sha }}"
```

💡 **למה 2 tags?**
- `latest` - תמיד מצביע על הגרסה האחרונה
- `${{ github.sha }}` - מזהה ייחודי לכל commit (אפשר לחזור לגרסה ספציפית)

#### בדיקה:
```bash
git add .
git commit -m "Add push job"
git push
```

לך ל-DockerHub ובדוק שה-Image הועלה!

---

## 8. זרימת העבודה המלאה

```
Unit Tests
   ↓
Build Docker Image
   ↓
Integration Tests (רק על main/ci/cd/PR)
   ↓
Push to DockerHub (רק על main/ci/cd)
```

---

## 9. הסברים

### Unit Tests
בודקים שהקוד תקין ברמת פונקציות ולוגיקה.
- מהיר
- ללא תלות חיצונית (DB, API)

### Build
בודקים שהאפליקציה ניתנת להרצה בתוך Docker.
- בונה Image
- בודק שהוא עובד

### Integration Tests
בודקים שהמערכת עובדת יחד (כולל שירותים נוספים).
- עם DB אמיתי
- עם Docker Compose
- איטי יותר

### Push
מפרסמים גרסה רק לאחר שכל הבדיקות הצליחו.
- רק על `main` ו-`ci/cd`
- לא על `develop`
- לא על Pull Requests

---

## 10. עקרונות חשובים

✅ **כל שלב תלוי בשלב הקודם** (`needs`)

✅ **כשלון בשלב אחד עוצר את התהליך**

✅ **פריסה מתבצעת רק על main/ci/cd**

✅ **כל גרסה מתויגת לפי commit** (`github.sha`)

✅ **Secrets לא בקוד** (רק ב-GitHub Secrets)

---

## 11. שגיאות נפוצות

### שגיאה: "docker-compose: command not found"
**פתרון**: השתמש ב-`docker compose` (ללא מקף) ב-GitHub Actions

### שגיאה: "permission denied while trying to connect to Docker"
**פתרון**: השתמש ב-`docker/setup-buildx-action@v3`

### שגיאה: "needs.integration-tests.result == 'success' but job was skipped"
**פתרון**: הוסף תנאי:
```yaml
(needs.integration-tests.result == 'success' || needs.integration-tests.result == 'skipped')
```

---

## 12. מושגים חשובים

| מושג | הסבר |
|------|------|
| **workflow** | תהליך אוטומטי ב-GitHub Actions |
| **job** | משימה בתוך workflow (unit-tests, build...) |
| **step** | פעולה בתוך job (checkout, npm install...) |
| **needs** | תלות בין jobs |
| **if** | תנאי להרצת job |
| **secrets** | משתנים מוצפנים (סיסמאות, tokens) |
| **github.sha** | hash ייחודי של commit |
| **github.ref** | שם branch מלא |

---

## 13. מה הלאה?

לאחר שהשלמת את המדריך, אתה יכול:

1. ✅ להוסיף Frontend CI (דומה ל-Backend)
2. ✅ להוסיף E2E Tests
3. ✅ להוסיף Deployment ל-AWS/Azure
4. ✅ להוסיף Notifications (Slack, Email)
5. ✅ להוסיף Code Coverage Reports

---

## 14. משאבים נוספים

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [DockerHub](https://hub.docker.com/)

---

**בהצלחה! 🚀**
