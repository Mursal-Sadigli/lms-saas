require('dotenv').config()
const { sql } = require('./db')

// Tək bir 2 saatlıq React kursunu hissələrə bölürük (FreeCodeCamp - w7ejDZ8bGvE)
// start və end saniyələrlə göstərilir. Məsələn, 0-300 (0-5 dəq)
const VIDEO_ID = 'SqcY0GlETPk'

const reactVideos = [
  { title: 'Bölmə 1: React-a Giriş (00:00 - 10:00)', url: `https://www.youtube.com/embed/${VIDEO_ID}?start=0&end=600`, duration: '10 dəq', free: true, desc: 'React nədir, niyə lazımdır, ilk addımlar.' },
  { title: 'Bölmə 2: JSX Sintaksisi (10:00 - 20:00)', url: `https://www.youtube.com/embed/${VIDEO_ID}?start=600&end=1200`, duration: '10 dəq', free: false, desc: 'JSX necə işləyir, HTML və JS-in vəhdəti.' },
  { title: 'Bölmə 3: Komponentlər (20:00 - 30:00)', url: `https://www.youtube.com/embed/${VIDEO_ID}?start=1200&end=1800`, duration: '10 dəq', free: false, desc: 'Function və Class komponentlər.' },
  { title: 'Bölmə 4: Props və Məlumat (30:00 - 45:00)', url: `https://www.youtube.com/embed/${VIDEO_ID}?start=1800&end=2700`, duration: '15 dəq', free: false, desc: 'Komponentlər arası məlumat ötürülməsi.' },
  { title: 'Bölmə 5: State və useState (45:00 - 60:00)', url: `https://www.youtube.com/embed/${VIDEO_ID}?start=2700&end=3600`, duration: '15 dəq', free: false, desc: 'Hook-lara giriş, useState istifadəsi.' },
  { title: 'Bölmə 6: useEffect Hook (60:00 - 75:00)', url: `https://www.youtube.com/embed/${VIDEO_ID}?start=3600&end=4500`, duration: '15 dəq', free: false, desc: 'API istəkləri və yan təsirlərin idarəsi.' },
  { title: 'Bölmə 7: Event Handling (75:00 - 90:00)', url: `https://www.youtube.com/embed/${VIDEO_ID}?start=4500&end=5400`, duration: '15 dəq', free: false, desc: 'Kliklər, formalar və event-lərin tutulması.' },
  { title: 'Bölmə 8: Form İdarəsi (90:00 - 105:00)', url: `https://www.youtube.com/embed/${VIDEO_ID}?start=5400&end=6300`, duration: '15 dəq', free: false, desc: 'Controlled və Uncontrolled component-lər.' },
  { title: 'Bölmə 9: React Router (105:00 - 120:00)', url: `https://www.youtube.com/embed/${VIDEO_ID}?start=6300&end=7200`, duration: '15 dəq', free: false, desc: 'Çoxsəhifəli tətbiq (SPA) yaradılması.' },
]

async function reseed() {
  console.log('🔄 Video seed yenilənir (Tək videonun bölünməsi)...\n')

  try {
    const [course] = await sql`
      SELECT id FROM courses
      WHERE educator_id = 'seed_educator_1'
      LIMIT 1
    `

    if (!course) {
      console.log('❌ Seed kurs tapılmadı.')
      process.exit(1)
    }

    await sql`DELETE FROM course_videos WHERE course_id = ${course.id}`
    console.log('🗑️  Köhnə videolar silindi')

    for (let i = 0; i < reactVideos.length; i++) {
      const v = reactVideos[i]
      await sql`
        INSERT INTO course_videos (course_id, title, video_url, duration, position, is_free, description)
        VALUES (${course.id}, ${v.title}, ${v.url}, ${v.duration}, ${i + 1}, ${v.free}, ${v.desc})
      `
    }

    console.log(`✅ ${reactVideos.length} vahid tam kurs bölmələri (start/end) əlavə edildi`)
    console.log('\n🎉 Video seed tamamlandı!')
    process.exit(0)
  } catch (err) {
    console.error('\n❌ Xəta:', err.message)
    process.exit(1)
  }
}

reseed()
