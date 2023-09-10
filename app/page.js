import React from 'react';
import { Client } from './client.js';

export default function Page({ searchParams }) {
  const classes = searchParams['classes'] || {};

  return <Client classes={classes} />;
}
