# GitHub Actions CI/CD - Backend Workflow

## מטרה
הגדרת תהליך אוטומטי (CI/CD) עבור Backend שמבצע:
- בניית Docker image
- בדיקות אוטומטיות
- העלאה ל-DockerHub

---

## משימה 1: Workflow בסיסי - Build בלבד

נתחיל פשוט - רק בניית image.

צור קובץ: `.github/workflows/ci-backend.yml`

```yaml
name: Backend CI

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: false
          tags: backend:test
```

מה לעשות:
1. צור את התיקייה `.github/workflows/`
2. צור את הקובץ `ci-backend.yml`
3. העתק את הקוד המלא למעלה
4. עשה commit ו-push
5. לך ל-Actions tab ב-GitHub ובדוק שזה עובד

---

## משימה 2: הוספת Unit Tests

נוסיף בדיקות לפני הבנייה.

שלב 1: הוסף ל-`backend/package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "test": "node --test server.test.js"
  }
}
```

שלב 2: החלף את כל תוכן `ci-backend.yml` בקוד הזה:

```yaml
name: Backend CI

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  test:
    name: Run Unit Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        working-directory: ./backend
        run: npm install
      
      - name: Run tests
        working-directory: ./backend
        run: npm test

  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: false
          tags: backend:test
```

מה לעשות:
1. עדכן את `package.json`
2. החלף את כל תוכן `ci-backend.yml` בקוד המלא למעלה
3. עשה commit ו-push

הסבר: `needs: test` אומר ל-build לחכות שה-tests יסיימו בהצלחה.

---

## משימה 3: הכנה להעלאה ל-DockerHub

לפני שנעלה images, צריך להכין Access Token.

### שלב 1: יצירת Access Token ב-DockerHub

למה צריך? GitHub Actions רץ על שרת מרוחק וצריך אישור להעלות images.

1. הירשם ב-https://hub.docker.com
2. צור repository בשם `app-translator-backend`
3. לך ל-Account Settings → Security
4. לחץ על New Access Token
5. שם: `github-actions`
6. הרשאות: Read & Write
7. העתק את הטוקן (לא תראה אותו שוב!)

### שלב 2: הגדרת Secrets ב-GitHub

למה? לא לשים סיסמאות בקוד.

1. GitHub Repository → Settings
2. Secrets and variables → Actions
3. New repository secret
4. הוסף שני secrets:
   - Name: `DOCKERHUB_USERNAME` | Value: שם המשתמש שלך
   - Name: `DOCKERHUB_TOKEN` | Value: הטוקן שיצרת

אין צורך לשנות קוד בשלב הזה.

---

## משימה 4: הוספת Push ל-DockerHub

עכשיו נוסיף job שמעלה את ה-image ל-DockerHub.

החלף את כל תוכן `ci-backend.yml` בקוד הזה:

```yaml
name: Backend CI

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  test:
    name: Run Unit Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        working-directory: ./backend
        run: npm install
      
      - name: Run tests
        working-directory: ./backend
        run: npm test

  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: false
          tags: backend:test

  push:
    name: Push to DockerHub
    runs-on: ubuntu-latest
    needs: build
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: YOUR_USERNAME/app-translator-backend:latest
```

מה לעשות:
1. החלף `YOUR_USERNAME` בשם המשתמש שלך ב-DockerHub
2. החלף את כל תוכן `ci-backend.yml` בקוד המלא למעלה
3. עשה commit ו-push
4. בדוק ב-DockerHub שה-image עלה

הסבר: `needs: build` אומר ל-push לחכות שה-build יסיים בהצלחה.

---

## משימה 5: הוספת Git SHA Tag

נוסיף tag נוסף עם מספר commit.

החלף את כל תוכן `ci-backend.yml` בקוד הזה:

```yaml
name: Backend CI

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  test:
    name: Run Unit Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        working-directory: ./backend
        run: npm install
      
      - name: Run tests
        working-directory: ./backend
        run: npm test

  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: false
          tags: backend:test

  push:
    name: Push to DockerHub
    runs-on: ubuntu-latest
    needs: build
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: |
            YOUR_USERNAME/app-translator-backend:latest
            YOUR_USERNAME/app-translator-backend:${{ github.sha }}
```

מה לעשות:
1. החלף את כל תוכן `ci-backend.yml` בקוד המלא למעלה
2. עשה commit ו-push
3. בדוק ב-DockerHub שיש 2 tags

---

## משימה 6: הוספת Integration Tests

נוסיף job שבודק את Backend עם Database אמיתי.

החלף את כל תוכן `ci-backend.yml` בקוד הזה:

```yaml
name: Backend CI

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  test:
    name: Run Unit Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        working-directory: ./backend
        run: npm install
      
      - name: Run tests
        working-directory: ./backend
        run: npm test

  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: false
          tags: backend:test

  integration-tests:
    name: Run Integration Tests
    runs-on: ubuntu-latest
    needs: build
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run tests with Docker Compose
        run: |
          docker compose -f docker-compose.test.yml up \
            --abort-on-container-exit \
            --exit-code-from backend-test
      
      - name: Show logs
        if: always()
        run: docker compose -f docker-compose.test.yml logs
      
      - name: Cleanup
        if: always()
        run: docker compose -f docker-compose.test.yml down -v

  push:
    name: Push to DockerHub
    runs-on: ubuntu-latest
    needs: integration-tests
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: |
            YOUR_USERNAME/app-translator-backend:latest
            YOUR_USERNAME/app-translator-backend:${{ github.sha }}
```

מה לעשות:
1. החלף את כל תוכן `ci-backend.yml` בקוד המלא למעלה
2. עשה commit ו-push

הסבר: `needs: integration-tests` אומר ל-push לחכות שה-integration tests יסיימו בהצלחה.

---

## משימה 7: הגבלת Push רק ל-Main

נוסיף תנאי שpush ל-DockerHub יקרה רק על branch main.

החלף את כל תוכן `ci-backend.yml` בקוד הזה:

```yaml
name: Backend CI

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  test:
    name: Run Unit Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        working-directory: ./backend
        run: npm install
      
      - name: Run tests
        working-directory: ./backend
        run: npm test

  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: false
          tags: backend:test

  integration-tests:
    name: Run Integration Tests
    runs-on: ubuntu-latest
    needs: build
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run tests with Docker Compose
        run: |
          docker compose -f docker-compose.test.yml up \
            --abort-on-container-exit \
            --exit-code-from backend-test
      
      - name: Show logs
        if: always()
        run: docker compose -f docker-compose.test.yml logs
      
      - name: Cleanup
        if: always()
        run: docker compose -f docker-compose.test.yml down -v

  push:
    name: Push to DockerHub
    runs-on: ubuntu-latest
    needs: integration-tests
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: |
            YOUR_USERNAME/app-translator-backend:latest
            YOUR_USERNAME/app-translator-backend:${{ github.sha }}
```

מה לעשות:
1. החלף את כל תוכן `ci-backend.yml` בקוד המלא למעלה
2. עשה commit ו-push

הסבר: `if: github.event_name == 'push' && github.ref == 'refs/heads/main'` אומר ל-push לרוץ רק על branch main.

---

## הזרימה הסופית

```
test → build → integration-tests → push
```

כל job רץ רק אם הקודם הצליח.

---

## שאלות לדיון

1. מה יקרה אם test נכשל?
2. למה חשוב לבדוק את ה-image לפני push?
3. מה ההבדל בין Unit Tests ל-Integration Tests?
4. למה לא לדחוף ל-DockerHub על כל branch?

---

## משאבים

- GitHub Actions: https://docs.github.com/en/actions
- Docker Build Push: https://github.com/docker/build-push-action
