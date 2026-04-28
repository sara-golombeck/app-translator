# GitHub Actions CI/CD Setup

## 🚀 Workflows שנוצרו:

### 1. `ci-backend.yml`
- רץ כשיש שינויים ב-`backend/`
- בונה Docker image ל-backend
- מעלה ל-DockerHub עם tags: `latest` + `git-sha`

### 2. `ci-frontend.yml`
- רץ כשיש שינויים ב-`frontend/`
- בונה Docker image ל-frontend
- מעלה ל-DockerHub עם tags: `latest` + `git-sha`

### 3. `build-all.yml`
- רץ על כל push/PR
- בונה את שני הקומפוננטים במקביל
- ניתן להפעיל ידנית דרך GitHub UI (workflow_dispatch)

---

## ⚙️ הגדרת Secrets ב-GitHub:

עבור לרפוזיטורי שלך ב-GitHub:

1. **Settings** → **Secrets and variables** → **Actions**
2. לחץ על **New repository secret**
3. הוסף את ה-secrets הבאים:

### Secrets נדרשים:

| Secret Name | Value | הסבר |
|------------|-------|------|
| `DOCKERHUB_USERNAME` | `sara3259` | שם המשתמש שלך ב-DockerHub |
| `DOCKERHUB_TOKEN` | `<your-token>` | Access Token מ-DockerHub |

---

## 🔑 איך ליצור DockerHub Access Token:

1. היכנס ל-[DockerHub](https://hub.docker.com)
2. לחץ על **Account Settings** → **Security**
3. לחץ על **New Access Token**
4. תן שם לטוקן (למשל: `github-actions`)
5. העתק את הטוקן ושמור אותו ב-GitHub Secrets

---

## ✅ בדיקה שהכל עובד:

1. עשה commit ו-push לקוד
2. לך ל-**Actions** tab ב-GitHub
3. תראה את ה-workflows רצים
4. אחרי שהם מסיימים, בדוק ב-DockerHub שה-images עלו

---

## 🎯 שימוש ב-workflow_dispatch (הפעלה ידנית):

1. לך ל-**Actions** → **Build All**
2. לחץ על **Run workflow**
3. בחר branch ולחץ **Run workflow**

זה שימושי כשאתה רוצה לבנות images בלי לעשות commit.

---

## 📝 הערות:

- ה-workflows משתמשים ב-cache כדי להאיץ builds
- כל build מקבל 2 tags: `latest` (לפיתוח) ו-`git-sha` (לייצור)
- ה-workflows רצים רק כשיש שינויים בתיקיות הרלוונטיות
