import React from 'react';
import { Client, CalendarWrapper } from './client.js';

export default function Page({ searchParams }) {
  const classParam = searchParams['classes'];
  const calUrl = searchParams['classes'];
  const classes = JSON.parse(classParam || '{}');

  return (
    <div className="px-2">
      <Client defaultClasses={classes} />
    </div>
  );
}
