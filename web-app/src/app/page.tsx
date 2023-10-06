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
        <iframe src="http://localhost:8080" width={'850px'} height={'650px'}></iframe>
      </div>
    </main>
  )
}
