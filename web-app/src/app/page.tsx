"use client"
import Canvas from '@/components/Canvas'
import styles from './page.module.css'
import Navigation from '@/components/Navigation'

export default function Home() {
  return (
    <main className={styles.main}>
      <Navigation>
      <div className={styles.description}>
        <div>
          Game Builder Workshop
        </div>
      </div>

      <div className={styles.center}>
        <Canvas/>
      </div>
      </Navigation>
    </main>
  )
}
