import Head from 'next/head';
import React from 'react';

const boxStyles = {
  padding: '12px',
  border: '1px solid #eaeaea',
  borderRadius: '10px',
};

export default function Home() {
  return (
    <div>
      <Head>
        <title>Sentry Onboarding</title>
        <meta
          name="description"
          content="Make your Next.js ready for Sentry"
        />
      </Head>

      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <p>Get started by sending us a sample error</p>
        <button
          type="button"
          style={{
            ...boxStyles,
            backgroundColor: '#c73852',
            borderRadius: '12px',
            border: 'none',
          }}
          onClick={() => {
            throw new Error('heyyyy yaaa');
          }}
        >
          Throw error
        </button>
      </main>
    </div>
  );
}
