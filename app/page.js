import React from 'react';
import { Client, Calendar } from './client.js';
import { load } from 'app/actions/save';

export default async function Page({ searchParams }) {
  let classes = {};
  let calUrl;
  const saveId = searchParams['saveId'];

  if (saveId) {
    const res = await load(saveId);
    if (res) {
      calUrl = '/api/calendar/' + saveId;
      classes = res.class_data;
    }
  }

  return (
    <div className="px-2">
      <Client defaultClasses={classes} />
      <Calendar defaultCalUrl={calUrl} />
    </div>
  );
}
