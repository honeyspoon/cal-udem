import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useState } from "react";

export default function Home() {
  const [classes, setClasses] = useState(new Set());

  return (
    <div className={styles.container}>
      <Head>
        <title>Calendier udem</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Calendrier udem</h1>

        <input
          type="text"
          onKeyUp={(e) => {
            if (e.keyCode === 13) {
              const s = new Set(classes);
              s.add(event.target.value);
              console.log(s);
              setClasses(s);
              e.target.value = "";
            }
          }}
        />

        {Array.from(classes).map((e, i) => (
          <div key={i}>
            {e}{" "}
            <button
              onClick={() => {
                const s = new Set(classes);
                s.delete(e);
                setClasses(s);
              }}
            >
              X
            </button>
          </div>
        ))}
        <button>generer</button>
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
}
