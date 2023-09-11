import React from 'react';
import { Client } from './client.js';

export default function Page({ searchParams }) {
  const classes = JSON.parse(searchParams['classes']) || {};

  return <Client defaultClasses={classes} />;
}
