import Canvas from '@/components/Canvas'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <div>
          Game Builder Workshop
        </div>
      </div>

      <div className={styles.center}>
        <Canvas/>
      </div>
    </main>
  )
}
