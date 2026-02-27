require('dotenv').config()
const { sql } = require('./db')

async function seed() {
  console.log('🌱 Seed data əlavə edilir...\n')

  try {
    // ── 1. Müəllimlər (users) ─────────────────
    await sql`
      INSERT INTO users (id, email, first_name, last_name, role, image_url)
      VALUES
        ('seed_educator_1', 'elnur@learnhub.az', 'Elnur', 'Məmmədov', 'educator', 'https://i.pravatar.cc/150?img=11'),
        ('seed_educator_2', 'anar@learnhub.az', 'Anar', 'Əliyev', 'educator', 'https://i.pravatar.cc/150?img=12'),
        ('seed_educator_3', 'leyla@learnhub.az', 'Leyla', 'Hüseynova', 'educator', 'https://i.pravatar.cc/150?img=13'),
        ('seed_educator_4', 'nigar@learnhub.az', 'Nigar', 'Quliyeva', 'educator', 'https://i.pravatar.cc/150?img=14'),
        ('seed_educator_5', 'rauf@learnhub.az', 'Rauf', 'Babayev', 'educator', 'https://i.pravatar.cc/150?img=15'),
        ('seed_educator_6', 'tural@learnhub.az', 'Tural', 'İsmayılov', 'educator', 'https://i.pravatar.cc/150?img=16')
      ON CONFLICT (id) DO NOTHING
    `
    console.log('✅ Müəllimlər əlavə edildi')

    // ── 2. Kurslar ────────────────────────────
    const courses = await sql`
      INSERT INTO courses (title, description, price, thumbnail, category, educator_id, is_published)
      VALUES
        (
          'React.js — Sıfırdan Peşəkar Səviyyəyə',
          'React hooks, context API, routing, state management — hamısını öyrən. Real layihələr üzərindən praktik təlim.',
          24.99,
          'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&q=80',
          'Frontend', 'seed_educator_1', true
        ),
        (
          'Node.js & Express — Backend Development',
          'REST API, MongoDB, JWT authentication — tam backend kurs. Müasir server tərəfi inkişafını öyrən.',
          29.99,
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80',
          'Backend', 'seed_educator_2', true
        ),
        (
          'Python — Məlumat Elmi və AI',
          'Machine learning, pandas, numpy, scikit-learn — süni intellekt əsasları. Praktik data science.',
          34.99,
          'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=400&q=80',
          'Data Science', 'seed_educator_3', true
        ),
        (
          'UI/UX Design — Figma ilə',
          'Müasir dizayn prinsipləri, prototiplər, istifadəçi təcrübəsi. Sıfırdan peşəkar dizayner ol.',
          19.99,
          'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80',
          'Design', 'seed_educator_4', true
        ),
        (
          'Flutter — Mobil Tətbiq İnkişafı',
          'Dart dili, widget sistemi, iOS & Android tətbiqlər. Bir kod bazasından iki platforma.',
          27.99,
          'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&q=80',
          'Mobile', 'seed_educator_5', true
        ),
        (
          'DevOps — Docker & Kubernetes',
          'Konteynerizasiya, CI/CD pipeline, bulud infrastrukturunun idarəsi. Modern DevOps praktikası.',
          39.99,
          'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&q=80',
          'DevOps', 'seed_educator_6', true
        )
      ON CONFLICT DO NOTHING
      RETURNING id, title
    `
    console.log(`✅ ${courses.length} kurs əlavə edildi`)

    // ── 3. Videolar ───────────────────────────
    if (courses.length > 0) {
      const reactCourse = courses[0]
      await sql`
        INSERT INTO course_videos (course_id, title, video_url, duration, position, is_free, description)
        VALUES
          (${reactCourse.id}, 'React-a Giriş', 'https://youtube.com/watch?v=demo1', '45 dəq', 1, true,
           'React nədir, niyə lazımdır? JSX sintaksisi və komponentlər.'),
          (${reactCourse.id}, 'Props və State', 'https://youtube.com/watch?v=demo2', '38 dəq', 2, true,
           'Komponentlər arası məlumat ötürülməsi.'),
          (${reactCourse.id}, 'useState Hook', 'https://youtube.com/watch?v=demo3', '52 dəq', 3, false,
           'State idarəsi, yenidən render.'),
          (${reactCourse.id}, 'useEffect Hook', 'https://youtube.com/watch?v=demo4', '48 dəq', 4, false,
           'Yan təsirlər, API çağırışları.'),
          (${reactCourse.id}, 'React Router', 'https://youtube.com/watch?v=demo5', '41 dəq', 5, false,
           'SPA naviqasiyası, URL parametrləri.')
        ON CONFLICT DO NOTHING
      `
      console.log('✅ Videolar əlavə edildi')
    }

    console.log('\n🎉 Seed tamamlandı! API-da kurslar görünəcək.')
    process.exit(0)
  } catch (err) {
    console.error('\n❌ Seed xətası:', err.message)
    process.exit(1)
  }
}

seed()
