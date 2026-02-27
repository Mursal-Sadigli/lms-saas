require('dotenv').config()
const { sql } = require('./db')

const demoVideos = [
  { title: 'Giriş Bölməsi', url: 'https://www.youtube.com/embed/SqcY0GlETPk', duration: '10 dəq', free: true, desc: 'Kursun məzmunu və əsas anlayışlar.' },
  { title: 'Əsas Prinsiplər', url: 'https://www.youtube.com/embed/7fPXI_MnBOY', duration: '15 dəq', free: false, desc: 'Təməl qaydalar və baxış bucağı.' },
  { title: 'Praktik Məşğələ 1', url: 'https://www.youtube.com/embed/Ke90Tje7VS0', duration: '20 dəq', free: false, desc: 'Öyrəndiklərimizi tətbiq edirik.' },
  { title: 'Praktik Məşğələ 2', url: 'https://www.youtube.com/embed/m7OWXtbiXX8', duration: '25 dəq', free: false, desc: 'Daha mürəkkəb nümunələr.' },
  { title: 'Yekun və İrəli', url: 'https://www.youtube.com/embed/O6P86uwfdR0', duration: '12 dəq', free: false, desc: 'Karyera məsləhətləri və növbəti addımlar.' },
]

async function reseedAll() {
  console.log('🔄 Bütün kurslara demo videolar əlavə edilir...\n')

  try {
    const courses = await sql`SELECT id, title FROM courses`

    if (courses.length === 0) {
      console.log('❌ Heç bir kurs tapılmadı.')
      process.exit(1)
    }

    for (const course of courses) {
      // Bu kursun videoları varmı?
      const [{ count }] = await sql`SELECT COUNT(*) as count FROM course_videos WHERE course_id = ${course.id}`
      
      if (Number(count) === 0) {
        console.log(`⏳ [${course.title}] üçün videolar əlavə edilir...`)
        
        for (let i = 0; i < demoVideos.length; i++) {
          const v = demoVideos[i]
          await sql`
            INSERT INTO course_videos (course_id, title, video_url, duration, position, is_free, description)
            VALUES (${course.id}, ${v.title}, ${v.url}, ${v.duration}, ${i + 1}, ${v.free}, ${v.desc})
          `
        }
        console.log(`✅ [${course.title}] tamamlandı!`)
      } else {
        console.log(`⏭️  [${course.title}] artıq videoları var, atlanır.`)
      }
    }

    console.log('\n🎉 Bütün kurslar video ilə təmin edildi!')
    process.exit(0)
  } catch (err) {
    console.error('\n❌ Xəta:', err.message)
    process.exit(1)
  }
}

reseedAll()
